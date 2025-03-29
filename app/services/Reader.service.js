const { ObjectId } = require("mongodb");

class Reader_Service {
  constructor(client) {
    this.Reader = client.db().collection("readers");
  }

  extractReaderData(payload) {
    const reader = {
      name: payload.name,
      birth: payload.birth,
      gender: payload.gender,
      phone: payload.phone,
      password: payload.password,
      address: payload.address,
      state: payload.state,
    };

    Object.keys(reader).forEach(
      (key) => reader[key] === undefined && delete reader[key]
    );
    return reader;
  }

  async create(payload) {
    const reader = this.extractReaderData(payload);
    reader.state = "active";
    const result = await this.Reader.findOneAndUpdate(
      reader,
      { $set: reader },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.Reader.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findByPhone(phone) {
    return await this.find({
      phone: { $regex: new RegExp(`^${phone}$`) },
    });
  }

  async findById(id) {
    return await this.Reader.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractReaderData(payload);
    const result = await this.Reader.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async changeState(id, state) {
    const reader = await this.findById(id);
    const result = await this.Reader.findOneAndUpdate(
      reader,
      { $set: { state: state } },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.Reader.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async auth(phone, password) {
    return await this.find({
      phone: { $regex: new RegExp(phone) },
      password: password,
    });
  }
}

module.exports = Reader_Service;
