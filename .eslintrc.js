const globals = require("globals");
const pluginJs = require("@eslint/js");
const pluginReact = require("eslint-plugin-react");

module.exports = {
  env: {
    node: true, // Sử dụng môi trường Node.js
    browser: true, // Nếu có code chạy trên trình duyệt (phần frontend)
    es6: true, // Hỗ trợ các cú pháp ES6
  },
  extends: [
    "eslint:recommended", // Sử dụng quy tắc ESLint cơ bản
    "plugin:react/recommended", // Sử dụng quy tắc React
    "prettier", // Tích hợp Prettier để format code
  ],
  parserOptions: {
    ecmaVersion: 2020, // Cho phép cú pháp ES6 trở lên
    sourceType: "module", // Để hỗ trợ import/export
  },
  rules: {
    // Thêm quy tắc tùy chỉnh của bạn ở đây (nếu cần)
  },
  globals: {
    ...globals.browser, // Thêm các biến toàn cục cho trình duyệt
    ...globals.node, // Thêm các biến toàn cục cho Node.js
  },
};