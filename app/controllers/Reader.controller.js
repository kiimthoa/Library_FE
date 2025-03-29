const ReaderService = require("../services/Reader.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.name) {
    return next(new ApiError(400, "Tên không được để trống"));
  }
  if (!req.body?.birth) {
    return next(new ApiError(400, "Năm sinh không được để trống"));
  }

  if (!req.body?.gender) {
    return next(new ApiError(400, "Giới tính không được để trống"));
  }

  if (!req.body?.phone) {
    return next(new ApiError(400, "Số điện thoại không được để trống"));
  }

  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(req.body.phone)) {
    return next(new ApiError(400, "Số điện thoại không hợp lệ"));
  }

  if (!req.body?.address) {
    return next(new ApiError(400, "Địa chỉ không được để trống"));
  }

  if (!req.body?.password) {
    return next(new ApiError(400, "Địa chỉ không được để trống"));
  }

  if (req.body?.password.length < 8) {
    return next(new ApiError(400, "Mật khẩu phải hơn 8 ký tự"));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra trong quá trình tạo mới"));
  }
};

exports.getAll = async (req, res, next) => {
  let documents = [];

  try {
    const readerService = new ReaderService(MongoDB.client);
    documents = await readerService.find({});
    if (!documents) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }
    return res.send(documents);
  } catch (error) {
    console.error("Lỗi lấy thông tin độc giả:", error.message);
    console.error("Stack trace:", error.stack);
    return next(
      new ApiError(500, "Có lỗi xảy ra trong quá trình lấy thông tin độc giả")
    );
  }
};

exports.getById = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi lấy độc giả có id=${req.params.id}`));
  }
};

exports.getByPhone = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.findByPhone(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi lấy độc giả có phone=${req.params.id}`));
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không thể để rỗng"));
  }

  if (!req.body?.name) {
    return next(new ApiError(400, "Tên không được để trống"));
  }
  if (!req.body?.birth) {
    return next(new ApiError(400, "Năm sinh không được để trống"));
  }

  if (!req.body?.gender) {
    return next(new ApiError(400, "Giới tính không được để trống"));
  }

  if (!req.body?.phone) {
    return next(new ApiError(400, "Số điện thoại không được để trống"));
  }

  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(req.body.phone)) {
    return next(new ApiError(400, "Số điện thoại không hợp lệ"));
  }

  if (!req.body?.address) {
    return next(new ApiError(400, "Địa chỉ không được để trống"));
  }

  if (!req.body?.password) {
    return next(new ApiError(400, "Địa chỉ không được để trống"));
  }

  if (req.body?.password.length < 8) {
    return next(new ApiError(400, "Mật khẩu phải hơn 8 ký tự"));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.update(req.params.id, req.body);

    if (!document) {
      console.error(`độc giả có ID ${req.params.id} không tìm thấy`);
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }

    return res.send({ message: "Cập nhật độc giả thành công" });
  } catch (error) {
    console.error(
      `Lỗi cập nhật độc giả có ID ${req.params.id}:`,
      error.message
    );
    console.error(error.stack);

    return next(
      new ApiError(500, `Lỗi cập nhật độc giả có id=${req.params.id}`)
    );
  }
};

exports.changeState = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.changeState(
      req.params.id,
      req.body.state
    );
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Không tìm thấy độc giả trang thái id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }
    return res.send({ message: "Xóa độc giả thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa độc giả có id=${req.params.id}`)
    );
  }
};
