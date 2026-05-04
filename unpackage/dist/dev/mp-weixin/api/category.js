"use strict";
const api_request = require("./request.js");
const getCategoryList = () => {
  return api_request.get("/api/v1/category/list");
};
exports.getCategoryList = getCategoryList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/category.js.map
