"use strict";
const api_request = require("./request.js");
const sendCode = (email) => {
  return api_request.post("/api/v1/user/send-code", { email });
};
const register = (data) => {
  return api_request.post("/api/v1/user/register", data);
};
const login = (data) => {
  return api_request.post("/api/v1/user/login", data);
};
exports.login = login;
exports.register = register;
exports.sendCode = sendCode;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
