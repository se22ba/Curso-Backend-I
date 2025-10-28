const path = require('node:path');
const fs = require('fs').promises;
class ProductManager {
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


async getAll() { return this._read(); }


async getById(id) {
const list = await this._read();
const nid = isNaN(Number(id)) ? String(id) : Number(id);
return list.find(p => p.id === nid) || null;
}


async create(data) {
const list = await this._read();
const nextId = (list.length ? Math.max(...list.map(p => Number(p.id) || 0)) + 1 : 1);
const product = {
id: nextId, 
title: data?.title ?? null,
description: data?.description ?? null,
code: data?.code ?? null,
price: data?.price ?? null,
status: data?.status ?? null,
stock: data?.stock ?? null,
category: data?.category ?? null,
thumbnails: Array.isArray(data?.thumbnails) ? data.thumbnails : []
};
list.push(product);
await this._write(list);
return product;
}


async update(id, changes) {
const list = await this._read();
const nid = isNaN(Number(id)) ? String(id) : Number(id);
const idx = list.findIndex(p => p.id === nid);
if (idx === -1) return null;


const safeChanges = { ...changes };
delete safeChanges.id; 


list[idx] = { ...list[idx], ...safeChanges };
await this._write(list);
return list[idx];
}


async delete(id) {
const list = await this._read();
const nid = isNaN(Number(id)) ? String(id) : Number(id);
const idx = list.findIndex(p => p.id === nid);
if (idx === -1) return false;
list.splice(idx, 1);
await this._write(list);
return true;
}
}


module.exports = ProductManager;