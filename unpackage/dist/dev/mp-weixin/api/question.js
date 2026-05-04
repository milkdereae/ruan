"use strict";
const api_request = require("./request.js");
const getQuestionList = (params) => {
  return api_request.get("/api/v1/question/list", params);
};
exports.getQuestionList = getQuestionList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/question.js.map
