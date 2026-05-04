"use strict";
const common_vendor = require("../common/vendor.js");
const api_request = require("../api/request.js");
const useUserStore = common_vendor.defineStore("user", () => {
  const userInfo = common_vendor.ref(null);
  const token = common_vendor.ref("");
  const isLoggedIn = common_vendor.computed(() => !!token.value && !!userInfo.value);
  const username = common_vendor.computed(() => {
    var _a;
    return ((_a = userInfo.value) == null ? void 0 : _a.username) || "未登录";
  });
  const avatar = common_vendor.computed(() => {
    var _a;
    return ((_a = userInfo.value) == null ? void 0 : _a.avatar) || "/static/images/default-avatar.png";
  });
  const setUserInfo = (info) => {
    userInfo.value = info;
    common_vendor.index.setStorageSync("userInfo", JSON.stringify(info));
  };
  const setToken = (tk) => {
    token.value = tk;
    common_vendor.index.setStorageSync("token", tk);
  };
  const initUserState = () => {
    try {
      const storedToken = common_vendor.index.getStorageSync("token");
      const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (storedToken) {
        token.value = storedToken;
      }
      if (storedUserInfo) {
        userInfo.value = JSON.parse(storedUserInfo);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at stores/user.js:60", "初始化用户状态失败:", error);
    }
  };
  const logout = () => {
    userInfo.value = null;
    token.value = "";
    common_vendor.index.removeStorageSync("token");
    common_vendor.index.removeStorageSync("userInfo");
    api_request.clearRequestCache();
    common_vendor.index.showToast({
      title: "已退出登录",
      icon: "success"
    });
    setTimeout(() => {
      common_vendor.index.reLaunch({
        url: "/subpkg/login/login"
      });
    }, 1500);
  };
  const checkLogin = () => {
    if (!isLoggedIn.value) {
      common_vendor.index.showToast({
        title: "请先登录",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: "/subpkg/login/login"
        });
      }, 1500);
      return false;
    }
    return true;
  };
  return {
    // State
    userInfo,
    token,
    // Getters
    isLoggedIn,
    username,
    avatar,
    // Actions
    setUserInfo,
    setToken,
    initUserState,
    logout,
    checkLogin
  };
});
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/user.js.map
