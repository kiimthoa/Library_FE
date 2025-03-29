const SatffService = require("../services/Staff.service");
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

  if (!req.body?.position) {
    return next(new ApiError(400, "Chức vụ không được để trống"));
  }

  if (!req.body?.email) {
    return next(new ApiError(400, "Email không được để trống"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return next(new ApiError(400, "Email không hợp lệ"));
  }

  try {
    const staffService = new SatffService(MongoDB.client);
    const document = await staffService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra trong quá trình tạo mới"));
  }
};

exports.getAll = async (req, res, next) => {
  let documents = [];

  try {
    const staffService = new SatffService(MongoDB.client);
    documents = await staffService.find({});
    if (!documents) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send(documents);
  } catch (error) {
    console.error("Lỗi lấy thông tin nhân viên:", error.message);
    console.error("Stack trace:", error.stack);
    return next(
      new ApiError(500, "Có lỗi xảy ra trong quá trình lấy thông tin nhân viên")
    );
  }
};

exports.getById = async (req, res, next) => {
  try {
    const staffService = new SatffService(MongoDB.client);
    const document = await staffService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi lấy nhân viên có id=${req.params.id}`));
  }
};

exports.getByEmail = async (req, res, next) => {
  try {
    const staffService = new SatffService(MongoDB.client);
    const document = await staffService.findByEmail(req.params.email);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi lấy nhân viên có id=${req.params.id}`));
  }
};

exports.update = async (req, res, next) => {
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

  if (!req.body?.position) {
    return next(new ApiError(400, "Chức vụ không được để trống"));
  }

  if (!req.body?.email) {
    return next(new ApiError(400, "Email không được để trống"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return next(new ApiError(400, "Email không hợp lệ"));
  }

  try {
    const staffService = new SatffService(MongoDB.client);
    const document = await staffService.update(req.params.id, req.body);

    if (!document) {
      console.error(`nhân viên có ID ${req.params.id} không tìm thấy`);
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }

    return res.send({ message: "Cập nhật nhân viên thành công" });
  } catch (error) {
    console.error(
      `Lỗi cập nhật nhân viên có ID ${req.params.id}:`,
      error.message
    );
    console.error(error.stack);

    return next(
      new ApiError(500, `Lỗi cập nhật nhân viên có id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const staffService = new SatffService(MongoDB.client);
    const document = await staffService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa nhân viên có id=${req.params.id}`)
    );
  }
};
