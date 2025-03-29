const { ObjectId } = require("mongodb");
const moment = require("moment");

class BorrowedBook_Service {
  constructor(client) {
    this.BorrowedBook = client.db().collection("borrowed_books");
    this.Reader = client.db().collection("readers");
    this.Staff = client.db().collection("staffs");
    this.Book = client.db().collection("books");
  }

  extractBorrowedBookData(payload) {
    const borrowedBook = {
      bookId: payload.bookId ? new ObjectId(payload.bookId) : undefined,
      staffId: payload.staffId ? new ObjectId(payload.staffId) : undefined,
      readerId: payload.readerId ? new ObjectId(payload.readerId) : undefined,
      borrowDate: payload.borrowDate,
      dueDate: payload.dueDate,
      state: payload.state,
    };

    Object.keys(borrowedBook).forEach(
      (key) => borrowedBook[key] === undefined && delete borrowedBook[key]
    );
    return borrowedBook;
  }

  async create(payload) {
    const borrowedBook = this.extractBorrowedBookData(payload);
    borrowedBook.state = "pending";
    const result = await this.BorrowedBook.insertOne(borrowedBook);
    return result;
  }

  async findByState(state) {
    const borrowedBooks = await this.BorrowedBook.aggregate([
      {
        $match: { state: state },
      },
      {
        $lookup: {
          from: "readers",
          localField: "readerId",
          foreignField: "_id",
          as: "readerDetails",
        },
      },
      {
        $unwind: "$readerDetails",
      },
      {
        $lookup: {
          from: "staffs",
          localField: "staffId",
          foreignField: "_id",
          as: "staffDetails",
        },
      },
      {
        $unwind: {
          path: "$staffDetails",
          preserveNullAndEmptyArrays: true, // `staffDetails` là `null` nếu không có `staffId`
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $project: {
          _id: 1,
          state: 1,
          borrowDate: 1,
          dueDate: 1,
          readerDetails: 1,
          staffDetails: 1,
          bookDetails: 1,
        },
      },
    ]).toArray();

    return borrowedBooks;
  }

  async updateState(id, newState, staffId) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = {
      $set: {
        state: newState,
        staffId: staffId ? new ObjectId(staffId) : null,
      },
    };
    const result = await this.BorrowedBook.findOneAndUpdate(filter, update, {
      returnDocument: "after",
    });
    return result;
  }

  async updateStateWithouStaff(id, newState) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = {
      $set: {
        state: newState,
      },
    };
    const result = await this.BorrowedBook.findOneAndUpdate(filter, update, {
      returnDocument: "after",
    });
    return result;
  }

  async delete(id) {
    const result = await this.BorrowedBook.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async find() {
    const borrowedBooks = await this.BorrowedBook.aggregate([
      {
        $lookup: {
          from: "readers",
          localField: "readerId",
          foreignField: "_id",
          as: "readerDetails",
        },
      },
      {
        $unwind: "$readerDetails",
      },
      {
        $lookup: {
          from: "staffs",
          localField: "staffId",
          foreignField: "_id",
          as: "staffDetails",
        },
      },
      {
        $unwind: {
          path: "$staffDetails",
          preserveNullAndEmptyArrays: true, // `staffDetails` là `null` nếu không có `staffId`
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $project: {
          _id: 1,
          state: 1,
          borrowDate: 1,
          dueDate: 1,
          readerDetails: 1,
          staffDetails: 1,
          bookDetails: 1,
        },
      },
    ]).toArray();

    return borrowedBooks;
  }

  async findBorrowOfReader(readerId) {
    if (!ObjectId.isValid(readerId)) {
      throw new Error("Invalid reader ID");
    }

    const borrowedBooks = await this.BorrowedBook.aggregate([
      {
        $match: { readerId: new ObjectId(readerId) }, // Chỉ tìm phiếu mượn của độc giả
      },
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $project: {
          _id: 1,
          state: 1,
          borrowDate: 1,
          dueDate: 1,
          bookDetails: 1,
        },
      },
    ]).toArray();
    return borrowedBooks;
  }

  async findOverDueBorrows() {
    const currentDate = new Date();

    const overdueDocuments = await this.BorrowedBook.aggregate([
      {
        // Chuyển đổi `dueDate` từ chuỗi sang kiểu Date
        $addFields: {
          dueDateAsDate: { $dateFromString: { dateString: "$dueDate" } },
        },
      },
      {
        // Lọc các phiếu mượn quá hạn có `dueDate` nhỏ hơn ngày hiện tại và trạng thái là "borrowed"
        $match: {
          $or: [
            {
              state: "borrowed",
              dueDateAsDate: { $lt: currentDate },
            },
            {
              state: "overdue",
            },
          ],
        },
      },

      {
        $lookup: {
          from: "readers",
          localField: "readerId",
          foreignField: "_id",
          as: "readerDetails",
        },
      },
      {
        $unwind: "$readerDetails",
      },
      {
        $lookup: {
          from: "staffs",
          localField: "staffId",
          foreignField: "_id",
          as: "staffDetails",
        },
      },
      {
        $unwind: {
          path: "$staffDetails",
          preserveNullAndEmptyArrays: true, // `staffDetails` là `null` nếu không có `staffId`
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $project: {
          _id: 1,
          state: 1,
          borrowDate: 1,
          dueDate: 1,
          readerDetails: 1,
          staffDetails: 1,
          bookDetails: 1,
        },
      },
    ]).toArray();

    const updatedDocuments = await Promise.all(
      overdueDocuments.map(async (element) => {
        await this.updateStateWithouStaff(element._id, "overdue");
        element.state = "overdue"; // Cập nhật trạng thái trong `element` sau khi cập nhật CSDL
        return element;
      })
    );

    return updatedDocuments;
  }

  async findRejectedBorrows() {
    const currentDate = new Date();

    const rejectedDocuments = await this.BorrowedBook.aggregate([
      {
        // Chuyển đổi `dueDate` từ chuỗi sang kiểu Date
        $addFields: {
          dueDateAsDate: { $dateFromString: { dateString: "$dueDate" } },
        },
      },
      {
        $match: {
          $or: [
            {
              state: "pending",
              dueDateAsDate: { $lt: currentDate },
            },
            {
              state: "rejected",
            },
          ],
        },
      },

      {
        $lookup: {
          from: "readers",
          localField: "readerId",
          foreignField: "_id",
          as: "readerDetails",
        },
      },
      {
        $unwind: "$readerDetails",
      },
      {
        $lookup: {
          from: "staffs",
          localField: "staffId",
          foreignField: "_id",
          as: "staffDetails",
        },
      },
      {
        $unwind: {
          path: "$staffDetails",
          preserveNullAndEmptyArrays: true, // `staffDetails` là `null` nếu không có `staffId`
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $project: {
          _id: 1,
          state: 1,
          borrowDate: 1,
          dueDate: 1,
          readerDetails: 1,
          bookDetails: 1,
          staffDetails: 1,
        },
      },
    ]).toArray();

    const updatedDocuments = await Promise.all(
      rejectedDocuments.map(async (element) => {
        await this.updateStateWithouStaff(element._id, "rejected");
        element.state = "rejected"; // Cập nhật trạng thái trong `element` sau khi cập nhật CSDL
        return element;
      })
    );

    return updatedDocuments;
  }

  async findOutOfStockBooks() {
    const outOfStockBooks = await this.Book.aggregate([
      //Lookup để nối dữ liệu từ bảng "borrowedBooks" dựa trên bookId
      {
        $lookup: {
          from: "borrowed_books",
          localField: "_id",
          foreignField: "bookId",
          as: "borrows",
        },
      },
      // Lọc các phiếu mượn có trạng thái "borrowed" hoặc "overdue"
      {
        $addFields: {
          activeBorrows: {
            $filter: {
              input: "$borrows", //duyệt qua từng phần tử của một mảng
              as: "borrow", //biến tạm
              //cond toán tử điều kiện (if-then-else) ,eq là toán tử so sánh bằng,
              cond: {
                $or: [
                  { $eq: ["$$borrow.state", "borrowed"] },
                  { $eq: ["$$borrow.state", "overdue"] },
                  { $eq: ["$$borrow.state", "pending"] },
                ],
              },
            },
          },
        },
      },
      // Đếm số phiếu mượn "borrowed","pending" và "overdue" cho mỗi quyển sách
      {
        $addFields: {
          activeBorrowCount: { $size: "$activeBorrows" },
        },
      },
      /// Chuyển quantity thành kiểu số
      {
        $addFields: {
          quantityAsNumber: { $toInt: "$quantity" }, // hoặc $toDouble nếu cần thiết
        },
      },
      {
        $match: {
          $expr: { $eq: ["$quantityAsNumber", "$activeBorrowCount"] },
        },
      },

      {
        $project: {
          _id: 1,
        },
      },
    ]).toArray();
    return outOfStockBooks;
  }

  async updateDueDate(id) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    // Lấy và chuyển đổi `dueDate` từ string sang Date
    const currentRecord = await this.BorrowedBook.findOne(filter);
    let dueDate = new Date(currentRecord.dueDate);
    // Cộng thêm 10 ngày vào `dueDate`
    dueDate.setDate(dueDate.getDate() + 10);

    // Chuyển `dueDate` thành chuỗi "yyyy-mm-dd"
    const updatedDueDateString = dueDate.toISOString().split("T")[0];

    // Thực hiện cập nhật
    const update = {
      $set: {
        dueDate: updatedDueDateString,
      },
    };
    const result = await this.BorrowedBook.findOneAndUpdate(filter, update, {
      returnDocument: "after",
    });
    return result;
  }
}

module.exports = BorrowedBook_Service;
