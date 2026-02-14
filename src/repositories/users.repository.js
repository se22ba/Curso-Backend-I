const User = require('../dao/models/user.model');

class UsersRepository {
  async findByEmail(email) {
    return User.findOne({ email }).lean();
  }

  async findByEmailWithPassword(email) {
    return User.findOne({ email });
  }

  async findByIdSafe(id) {
    return User.findById(id).select('first_name last_name email role cart').lean();
  }

  async findByIdWithPassword(id) {
    return User.findById(id);
  }

  async create(data) {
    return User.create(data);
  }

  async updatePassword(id, hashedPassword) {
    return User.updateOne({ _id: id }, { $set: { password: hashedPassword } });
  }
}

module.exports = UsersRepository;