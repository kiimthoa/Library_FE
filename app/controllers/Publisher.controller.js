const PublisherService = require("../services/Publisher.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.name) {
    return next(new ApiError(400, "Tên không được để trống"));
  }

  if (!req.body?.email) {
    return next(new ApiError(400, "Email không được để trống"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return next(new ApiError(400, "Email không hợp lệ"));
  }

  if (!req.body?.address) {
    return next(new ApiError(400, "Địa chỉ không được để trống"));
  }

  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra trong quá trình tạo mới"));
  }
};

exports.getAll = async (req, res, next) => {
  let documents = [];

  try {
    const publisherService = new PublisherService(MongoDB.client);
    documents = await publisherService.find({});

    if (!documents) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }
    return res.send(documents);
  } catch (error) {
    console.error("Lỗi lấy thông tin nhà xuất bản:", error.message);
    console.error("Stack trace:", error.stack);
    return next(
      new ApiError(
        500,
        "Có lỗi xảy ra trong quá trình lấy thông tin nhà xuất bản"
      )
    );
  }

  return res.send(documents);
};

exports.getById = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi lấy nhà xuất bản có id=${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không thể để rỗng"));
  }

  if (!req.body?.name) {
    return next(new ApiError(400, "Tên không được để trống"));
  }

  if (!req.body?.email) {
    return next(new ApiError(400, "Email không được để trống"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return next(new ApiError(400, "Email không hợp lệ"));
  }

  if (!req.body?.address) {
    return next(new ApiError(400, "Địa chỉ không được để trống"));
  }

  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.update(req.params.id, req.body);

    if (!document) {
      console.error(`Nhà xuất bản có ID ${req.params.id} không tìm thấy`);
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }

    return res.send({ message: "Cập nhật nhà xuất bản thành công" });
  } catch (error) {
    console.error(
      `Lỗi cập nhật nhà xuất bản có ID ${req.params.id}:`,
      error.message
    );
    console.error(error.stack);

    return next(
      new ApiError(500, `Lỗi cập nhật nhà xuất bản có id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }
    return res.send({ message: "Xóa nhà xuất bản thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa nhà xuất bản có id=${req.params.id}`)
    );
  }
};
