const BookService = require("../services/Book.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Xác định thư mục lưu file.
    cb(null, "app/uploads/images"); // callback chỉ định thư mục lưu trữ.
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file với timestamp
  },
});

const upload = multer({ storage: storage }); //Tạo middleware upload để sử dụng trong các route xử lý upload file.

// Hàm để xử lý khi tạo sách mới
exports.create = [
  upload.single("img"), //xử lý việc upload một file đơn lẻ từ form dữ liệu có một trường nhất định.
  async (req, res, next) => {
    const { title, category, quantity, year, price, publisherId } = req.body;
    const img = req.file ? req.file.filename : null;
    if (!title) {
      return next(new ApiError(400, "Tựa đề không được để trống"));
    }
    if (!category) {
      return next(new ApiError(400, "Loại sách không được để trống"));
    }
    if (!img) {
      return next(new ApiError(400, "Hình ảnh không được để trống"));
    }
    if (quantity <= 0) {
      return next(new ApiError(400, "Số lượng phải là số lớn hơn 0"));
    }
    if (!price) {
      return next(new ApiError(400, "Giá tiền không được để trống"));
    }
    if (!publisherId) {
      return next(new ApiError(400, "Nhà xuất bản không được để trống"));
    }
    const currentYear = new Date().getFullYear();
    if (year >= currentYear + 1) {
      return next(new ApiError(400, "Năm xuất bản không hợp lệ"));
    }

    try {
      const bookService = new BookService(MongoDB.client);
      const document = await bookService.create({ ...req.body, img });
      return res.send(document);
    } catch (error) {
      return next(new ApiError(500, "Có lỗi xảy ra trong quá trình tạo mới"));
    }
  },
];

// Hàm để lấy danh sách tất cả sách
exports.getAll = async (req, res, next) => {
  let documents = [];

  try {
    const bookService = new BookService(MongoDB.client);
    const { title } = req.query;

    if (title) {
      documents = await bookService.findByTitle(title);
    } else {
      documents = await bookService.find({});
    }
  } catch (error) {
    console.error("Lỗi lấy sách:", error.message);
    console.error("Stack trace:", error.stack);
    return next(new ApiError(500, "Có lỗi xảy ra trong quá trình lấy sách"));
  }

  return res.send(documents);
};

exports.findBooksByCurrentYear = async (req, res, next) => {
  const currentYear = new Date().getFullYear().toString();

  try {
    const bookService = new BookService(MongoDB.client);
    const latestBooks = await bookService.findByYear(currentYear);
    if (!latestBooks || latestBooks.length === 0) {
      return res.send([]);
    }
    return res.send(latestBooks);
  } catch (error) {
    console.log("Error: ", error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi tìm kiếm sách"));
  }
};

// Hàm để lấy thông tin chi tiết của một cuốn sách theo ID
exports.getById = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi lấy sách có id=${req.params.id}`));
  }
};

// Hàm để cập nhật thông tin một cuốn sách
exports.update = [
  upload.single("img"),
  async (req, res, next) => {
    if (Object.keys(req.body).length === 0 && !req.file) {
      return next(new ApiError(400, "Dữ liệu cập nhật không thể để rỗng"));
    }

    const { title, category, quantity, year, price, publisherId } = req.body;
    const img = req.file ? req.file.filename : req.body.img;

    if (!req.body?.title) {
      return next(new ApiError(400, "Tựa đề không được để trống"));
    }
    if (!category) {
      return next(new ApiError(400, "Loại sách không được để trống"));
    }
    if (!img) {
      return next(new ApiError(400, "Hình ảnh không được để trống"));
    }
    if (quantity <= 0 && quantity !== undefined) {
      return next(new ApiError(400, "Số lượng phải là số lớn hơn 0"));
    }
    if (!price) {
      return next(new ApiError(400, "Giá tiền không được để trống"));
    }
    if (!publisherId) {
      return next(new ApiError(400, "Nhà xuất bản không được để trống"));
    }
    const currentYear = new Date().getFullYear();
    if (year >= currentYear + 1) {
      return next(new ApiError(400, "Năm xuất bản không hợp lệ"));
    }

    try {
      const bookService = new BookService(MongoDB.client);
      const updatedData = {
        title,
        category,
        quantity,
        year,
        price,
        img,
        publisherId,
      };
      const document = await bookService.update(req.params.id, updatedData);
      if (!document) {
        return next(new ApiError(404, "Không tìm thấy sách"));
      }
      if (req.file) {
        const oldImagePath = path.join(
          __dirname,
          "app/uploads/images",
          req.body.img
        );

        // Kiểm tra nếu file cũ tồn tại và xóa nó
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Xóa file cũ
        }
      }
      return res.send({ message: "Cập nhật sách thành công" });
    } catch (error) {
      console.error(`Lỗi cập nhật sách có ID ${req.params.id}:`, error.message);
      return next(
        new ApiError(500, `Lỗi cập nhật sách có id=${req.params.id}`)
      );
    }
  },
];

// Hàm để xóa một cuốn sách
exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }
    const imagePath = path.join("app/uploads/images", document.img);
    fs.unlinkSync(imagePath); // Xóa file ảnh
    return res.send({ message: "Xóa sách thành công" });
  } catch (error) {
    return next(new ApiError(500, `Không thể xóa sách có id=${req.params.id}`));
  }
};
