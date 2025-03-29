const BorrowedBookService = require("../services/BorrowedBook.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    const document = await borowedBookService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra trong quá trình tạo mới"));
  }
};

exports.updateState = async (req, res, next) => {
  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    const document = await borowedBookService.updateState(
      req.params.id,
      req.body.state,
      req.body.staffId
    );
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn sách"));
    }
    return res.send({
      message: "Cập nhật trạng thái phiếu mượn thành công",
    });
  } catch (error) {
    console.error(
      `Lỗi cập nhật phiếu mượn sách có ID ${req.params.id}:`,
      error.message
    );
    return next(
      new ApiError(
        500,
        `Lỗi cập nhật phiếu mượn trạng sách có id=${req.params.id}`
      )
    );
  }
};

exports.getByState = async (req, res, next) => {
  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    const document = await borowedBookService.findByState(req.params.state);
    if (!document) {
      return next(
        new ApiError(404, `Không có thẻ nào ở trạng thái = ${req.params.state}`)
      );
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy các thẻ mượn có trang thái =${req.params.state}`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    const document = await borowedBookService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thẻ mượn"));
    }
    return res.send({ message: "Đã xóa thẻ mượn sách thành công" });
  } catch (error) {
    return next(new ApiError(500, `Không thể xóa thẻ có id= ${req.params.id}`));
  }
};

exports.getAll = async (req, res, next) => {
  let documents = [];

  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    documents = await borowedBookService.find({});
    if (!documents) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn nào"));
    }
    return res.send(documents);
  } catch (error) {
    console.error("Lỗi lấy phiếu mượn:", error.message);
    console.error("Stack trace:", error.stack);
    return next(
      new ApiError(500, "Có lỗi xảy ra trong quá trình lấy phiếu mượn")
    );
  }
};

exports.getAllOfReader = async (req, res, next) => {
  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    const document = await borowedBookService.findBorrowOfReader(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn của độc giả"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi lấy phiếu mượn của độc giả có id=${req.params.id}`)
    );
  }
};

exports.getOverDueBorrows = async (req, res, next) => {
  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    const overdueDocuments = await borowedBookService.findOverDueBorrows();
    if (!overdueDocuments || overdueDocuments.length === 0) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn nào quá hạn"));
    }
    return res.send(overdueDocuments);
  } catch (error) {
    return next(new ApiError(500, `Lỗi lấy phiếu mượn quá hạn`));
  }
};

exports.getRejectedBorrows = async (req, res, next) => {
  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    const rejectedDocuments = await borowedBookService.findRejectedBorrows();
    if (!rejectedDocuments || rejectedDocuments.length === 0) {
      return next(
        new ApiError(404, "Không tìm thấy phiếu mượn nào bị từ chối")
      );
    }
    return res.send(rejectedDocuments);
  } catch (error) {
    return next(new ApiError(500, `Lỗi lấy phiếu mượn bị từ chối`));
  }
};

exports.getOutOfStockBooks = async (req, res, next) => {
  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    const documents = await borowedBookService.findOutOfStockBooks();
    if (!documents || documents.length === 0) {
      return next(new ApiError(404, "Không có sách nào hết hàng"));
    }
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, `Lỗi lấy sách hết hàng`));
  }
};

exports.renewBorrow = async (req, res, next) => {
  try {
    const borowedBookService = new BorrowedBookService(MongoDB.client);
    const documents = await borowedBookService.updateDueDate(req.params.id);
    if (!documents) {
      return next(new ApiError(404, "Gia hạn sách thất bại"));
    }
    return res.send({ message: "Gia hạn sách thành công" });
  } catch (error) {
    return next(new ApiError(500, `Lỗi lấy gia hạn phiếu mượn`));
  }
};
