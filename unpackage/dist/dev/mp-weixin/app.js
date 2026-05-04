"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_user = require("./stores/user.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/category/category.js";
  "./pages/user/user.js";
  "./subpkg/login/login.js";
  "./subpkg/question/question.js";
  "./subpkg/wrong/wrong.js";
  "./subpkg/favorite/favorite.js";
}
const _sfc_main = {
  onLaunch() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Launch");
    const userStore = stores_user.useUserStore();
    userStore.initUserState();
  },
  onShow() {
    common_vendor.index.__f__("log", "at App.vue:16", "App Show");
  },
  onHide() {
    common_vendor.index.__f__("log", "at App.vue:19", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  return {
    app,
    pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
