"use strict";
const api_request = require("./request.js");
const submitAnswer = (data) => {
  return api_request.post("/api/v1/record/answer", data);
};
const getWrongList = (params) => {
  return api_request.get("/api/v1/record/wrong-list", params);
};
const deleteWrong = (params) => {
  const payload = typeof params === "number" ? { question_id: params } : params || {};
  return api_request.del("/api/v1/record/wrong-delete", payload);
};
const toggleCollect = (data) => {
  return api_request.post("/api/v1/record/collect", data);
};
const getCollectList = (params) => {
  return api_request.get("/api/v1/record/collect-list", params);
};
const getStatistics = () => {
  return api_request.get("/api/v1/record/stat");
};
exports.deleteWrong = deleteWrong;
exports.getCollectList = getCollectList;
exports.getStatistics = getStatistics;
exports.getWrongList = getWrongList;
exports.submitAnswer = submitAnswer;
exports.toggleCollect = toggleCollect;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/record.js.map
