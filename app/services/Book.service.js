const { ObjectId } = require("mongodb");

class Book_Service {
  constructor(client) {
    this.Book = client.db().collection("books");
  }

  extractBookData(payload) {
    const book = {
      title: payload.title,
      author: payload.author,
      category: payload.category,
      quantity: payload.quantity,
      year: payload.year,
      price: payload.price,
      img: payload.img,
      publisherId: payload.publisherId
        ? new ObjectId(payload.publisherId)
        : undefined,
    };
    Object.keys(book).forEach(
      (key) => book[key] === undefined && delete book[key]
    );
    return book;
  }

  async create(payload) {
    const book = this.extractBookData(payload);
    const result = await this.Book.findOneAndUpdate(
      { title: book.title, author: book.author },
      { $set: book },
      { returnDocument: "after", upsert: true } // Neu khong tim thay thi se tao moi
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.Book.aggregate([
      //Aggregation Pipeline là một chuỗi các giai đoạn
      { $match: filter }, // Kết hợp với bộ lọc
      {
        $lookup: {
          //join
          from: "publishers",
          localField: "publisherId",
          foreignField: "_id",
          as: "publisherDetails",
        },
      },
      { $unwind: "$publisherDetails" }, // Làm phẳng mảng publisherDetails
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          category: 1,
          quantity: 1,
          year: 1,
          price: 1,
          img: 1,
          publisherDetails: 1,
        },
      },
    ]);

    return await cursor.toArray(); // Chuyển đổi con trỏ thành mảng
  }

  async findByName(name) {
    return await this.Book.aggregate([
      { title: { $regex: new RegExp(name), $options: "i" } }, // Kết hợp với bộ lọc
      {
        $lookup: {
          from: "publishers",
          localField: "publisherId",
          foreignField: "_id",
          as: "publisherDetails",
        },
      },
      { $unwind: "$publisherDetails" }, // Làm phẳng mảng publisherDetails
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          category: 1,
          quantity: 1,
          year: 1,
          price: 1,
          img: 1,
          publisherDetails: 1,
        },
      },
    ]).toArray();
  }
  async findById(id) {
    const result = await this.Book.aggregate([
      { $match: { _id: ObjectId.isValid(id) ? new ObjectId(id) : null } },
      {
        $lookup: {
          from: "publishers",
          localField: "publisherId",
          foreignField: "_id",
          as: "publisherDetails",
        },
      },
      { $unwind: "$publisherDetails" },
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          category: 1,
          quantity: 1,
          year: 1,
          price: 1,
          img: 1,
          publisherDetails: 1,
        },
      },
    ]).toArray();

    return result[0] || null; // Lấy phần tử đầu tiên hoặc null nếu không có kết quả
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractBookData(payload);
    const result = await this.Book.findOneAndUpdate(
      filter,
      { $set: update }, // chỉ cập nhật các doc trong updtate
      { returnDocument: "after" }
    );
    return result; // chứa doc được update success còn không thì là null
  }

  async delete(id) {
    const result = await this.Book.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async findByYear(currentyear) {
    return await this.Book.aggregate([
      { $match: { year: currentyear } },
      {
        $lookup: {
          from: "publishers",
          localField: "publisherId",
          foreignField: "_id",
          as: "publisherDetails",
        },
      },
      { $unwind: "$publisherDetails" },
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          category: 1,
          quantity: 1,
          year: 1,
          price: 1,
          img: 1,
          publisherDetails: 1,
        },
      },
    ]).toArray();
  }
}

module.exports = Book_Service;
