const { ObjectId } = require("mongodb");

class Publisher_Service {
  constructor(client) {
    this.Publisher = client.db().collection("publishers");
  }

  extractPublisherData(payload) {
    const publisher = {
      name: payload.name,
      email: payload.email,
      address: payload.address,
    };

    Object.keys(publisher).forEach(
      (key) => publisher[key] === undefined && delete publisher[key]
    );
    return publisher;
  }

  async create(payload) {
    const publisher = this.extractPublisherData(payload);
    const result = await this.Publisher.findOneAndUpdate(
      { name: publisher.name, email: publisher.email },
      { $set: publisher },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.Publisher.find(filter); // sử dụng method .find(filter) của mongodb để tìm và trả về con trỏ
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $options: "i" }, //toán tử regex-trong MongoDB cho phép tìm doc mà name chứa chuổi con khớp với biểu thức chính quy được tạo bởi new RegExp(name), op i ko phân biệt hoa thường
    });
  }

  async findById(id) {
    return await this.Publisher.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null, // kiểm tra xem id có hợp lệ hay không nếu có nó sẽ tạo ra và tìm kiếm bằng _id
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractPublisherData(payload);
    const result = await this.Publisher.findOneAndUpdate(
      filter,
      { $set: update }, // chỉ cập nhật các doc trong updtate
      { returnDocument: "after" }
    );
    return result; // chứa doc được update success còn không thì là null
  }

  async delete(id) {
    const result = await this.Publisher.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = Publisher_Service;
