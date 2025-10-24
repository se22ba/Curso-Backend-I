const fs = require('fs').promises;
const path = require('path');


class CartManager {
constructor(filePath) {
this.filePath = filePath;
this._ensureFile();
}


async _ensureFile() {
const dir = path.dirname(this.filePath);
await fs.mkdir(dir, { recursive: true });
try {
await fs.access(this.filePath);
} catch (_) {
await fs.writeFile(this.filePath, '[]', 'utf-8');
}
}


async _read() {
const raw = await fs.readFile(this.filePath, 'utf-8');
try { return JSON.parse(raw); } catch { return []; }
}


async _write(data) {
await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
}


async createCart() {
const list = await this._read();
const nextId = (list.length ? Math.max(...list.map(c => Number(c.id) || 0)) + 1 : 1);
const cart = { id: nextId, products: [] };
list.push(cart);
await this._write(list);
return cart;
}


async getById(id) {
const list = await this._read();
const nid = isNaN(Number(id)) ? String(id) : Number(id);
return list.find(c => c.id === nid) || null;
}


async addProduct(cid, pid) {
const list = await this._read();
const nid = isNaN(Number(cid)) ? String(cid) : Number(cid);
const cartIdx = list.findIndex(c => c.id === nid);
if (cartIdx === -1) return null;


const productId = isNaN(Number(pid)) ? String(pid) : Number(pid);
const prodIdx = list[cartIdx].products.findIndex(pr => pr.product === productId);


if (prodIdx === -1) {
list[cartIdx].products.push({ product: productId, quantity: 1 });
} else {
list[cartIdx].products[prodIdx].quantity += 1; 
}


await this._write(list);
return list[cartIdx];
}
}


module.exports = CartManager;