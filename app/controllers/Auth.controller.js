const StaffService = require("../services/Staff.service");
const ReaderService = require("../services/Reader.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

//Nhân viên đăng nhập

exports.staffLogin = async (req, res, next) => {
  if (!req.body?.email) {
    return next(new ApiError(400, "email không được để trống"));
  }

  if (!req.body?.password) {
    return next(new ApiError(400, "Mật khẩu không được để trống"));
  }

  if (req.body?.password.length < 8) {
    return next(new ApiError(400, "Mật khẩu không được nhỏ hơn 8 ký tự"));
  }

  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.auth(req.body.email, req.body.password);
    if (!document) {
      return next(new ApiError(404, "Sai mật khẩu hoặc email"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi đăng nhập nhân viên có email=${req.body.email}`)
    );
  }
};

//độc giả đăng nhập

exports.readerLogin = async (req, res, next) => {
  if (!req.body?.phone) {
    return next(new ApiError(400, "Số điện thoại không được để trống"));
  }

  if (!req.body?.password) {
    return next(new ApiError(400, "Mật khẩu không được để trống"));
  }

  if (req.body?.password.length < 8) {
    return next(new ApiError(400, "Mật khẩu không được nhỏ hơn 8 ký tự"));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.auth(
      req.body.phone,
      req.body.password
    );
    if (!document) {
      return next(new ApiError(404, "Sai mật khẩu hoặc số điện thoại"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi đăng nhập độc giả có phone=${req.body.phone}`)
    );
  }
};
