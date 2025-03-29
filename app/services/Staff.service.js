const { ObjectId } = require("mongodb");

class Staff_Service {
  constructor(client) {
    this.Staff = client.db().collection("staffs");
  }

  extractStaffData(payload) {
    const staff = {
      name: payload.name,
      birth: payload.birth,
      gender: payload.gender,
      phone: payload.phone,
      password: payload.password,
      address: payload.address,
      position: payload.position,
      email: payload.email,
    };

    Object.keys(staff).forEach(
      (key) => staff[key] === undefined && delete staff[key]
    );
    return staff;
  }

  async create(payload) {
    const staff = this.extractStaffData(payload);
    const result = await this.Staff.findOneAndUpdate(
      staff,
      { $set: staff },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.Staff.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findByPhone(phone) {
    return await this.find({
      phone: { $regex: new RegExp(phone) },
    });
  }

  async findByEmail(email) {
    return await this.find({
      email: email,
    });
  }

  async findById(id) {
    return await this.Staff.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractStaffData(payload);
    const result = await this.Staff.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.Staff.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async auth(email, password) {
    return await this.find({
      email: email,
      password: password,
    });
  }
}

module.exports = Staff_Service;
