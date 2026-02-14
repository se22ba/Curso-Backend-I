const Product = require('../dao/models/product.model');

class ProductsRepository {
  async paginateLean({ filter, sortOptions, skip, limit }) {
    const [products, totalDocs] = await Promise.all([
      Product.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);
    return { products, totalDocs };
  }

  async getAllLean() {
    const docs = await Product.find().lean();
    return docs.map(p => ({ ...p, id: p._id.toString() }));
  }

  async getByIdLean(id) {
    return Product.findById(id).lean();
  }

  async getById(id) {
    return Product.findById(id);
  }

  async create(data) {
    return Product.create(data);
  }

  async updateById(id, data) {
    return Product.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async deleteById(id) {
    return Product.findByIdAndDelete(id).lean();
  }
}

module.exports = ProductsRepository