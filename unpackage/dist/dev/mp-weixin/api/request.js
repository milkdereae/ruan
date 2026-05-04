"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://localhost:8000";
const TIMEOUT = 1e4;
const CACHE_TIME = 3e4;
const requestCache = /* @__PURE__ */ new Map();
const getToken = () => {
  return common_vendor.index.getStorageSync("token") || "";
};
const requestInterceptor = (options) => {
  if (!options.url.startsWith("http")) {
    options.url = BASE_URL + options.url;
  }
  options.header = {
    ...options.header,
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
  };
  options.timeout = TIMEOUT;
  return options;
};
const handleError = (code, message) => {
  const errorMap = {
    400: "请求参数错误",
    401: "登录已过期，请重新登录",
    403: "没有权限访问",
    404: "请求的资源不存在",
    405: "请求方法不允许",
    408: "请求超时",
    500: "服务器内部错误",
    502: "网关错误",
    503: "服务不可用",
    504: "网关超时"
  };
  const errorMsg = message || errorMap[code] || `未知错误: ${code}`;
  if (code === 401) {
    common_vendor.index.removeStorageSync("token");
    common_vendor.index.removeStorageSync("userInfo");
    common_vendor.index.showToast({
      title: "登录已过期",
      icon: "none"
    });
    setTimeout(() => {
      common_vendor.index.navigateTo({
        url: "/subpkg/login/login"
      });
    }, 1500);
    return;
  }
  common_vendor.index.showToast({
    title: errorMsg,
    icon: "none",
    duration: 2e3
  });
};
const generateCacheKey = (url, params) => {
  const sortedParams = Object.keys(params || {}).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {});
  return `${url}:${JSON.stringify(sortedParams)}`;
};
const request = (options) => {
  options = requestInterceptor(options);
  const isGetRequest = options.method === "GET" || !options.method;
  if (isGetRequest && !options.noCache) {
    const cacheKey = generateCacheKey(options.url, options.data);
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TIME) {
      common_vendor.index.__f__("log", "at api/request.js:118", "[Request Cache] Hit:", cacheKey);
      return Promise.resolve(cached.data);
    }
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...options,
      success: (res) => {
        const { statusCode, data } = res;
        if (statusCode === 200) {
          if (data.code === 200) {
            if (isGetRequest && !options.noCache) {
              const cacheKey = generateCacheKey(options.url, options.data);
              requestCache.set(cacheKey, { data, time: Date.now() });
              common_vendor.index.__f__("log", "at api/request.js:137", "[Request Cache] Store:", cacheKey);
            }
            resolve(data);
          } else {
            common_vendor.index.showToast({
              title: data.message || "请求失败",
              icon: "none"
            });
            reject(data);
          }
        } else {
          handleError(statusCode, data == null ? void 0 : data.message);
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at api/request.js:155", "请求失败:", err);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
        reject(err);
      }
    });
  });
};
const get = (url, params = {}, options = {}) => {
  return request({
    url,
    method: "GET",
    data: params,
    ...options
  });
};
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: "POST",
    data,
    ...options
  });
};
const del = (url, params = {}, options = {}) => {
  return request({
    url,
    method: "DELETE",
    data: params,
    ...options
  });
};
const clearRequestCache = () => {
  requestCache.clear();
  common_vendor.index.__f__("log", "at api/request.js:232", "[Request Cache] Cleared");
};
exports.clearRequestCache = clearRequestCache;
exports.del = del;
exports.get = get;
exports.post = post;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/request.js.map
