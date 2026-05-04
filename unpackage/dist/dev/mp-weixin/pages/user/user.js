"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_record = require("../../api/record.js");
const _sfc_main = {
  __name: "user",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const userStats = common_vendor.ref({
      wrongCount: 0,
      favoriteCount: 0,
      studyDays: 1,
      totalAnswered: 0
    });
    const isVip = common_vendor.ref(false);
    const cacheSize = common_vendor.ref("0MB");
    const loadUserStats = async () => {
      var _a, _b, _c;
      if (!userStore.isLoggedIn)
        return;
      try {
        const [statsRes, favRes] = await Promise.all([
          api_record.getStatistics(),
          api_record.getCollectList({ page: 1, page_size: 1 })
        ]);
        if (statsRes.code === 200) {
          const stats = statsRes.data || {};
          userStats.value = {
            wrongCount: stats.wrongCount || 0,
            favoriteCount: ((_a = favRes.data) == null ? void 0 : _a.total) || 0,
            studyDays: stats.studyDays || 1,
            totalAnswered: stats.totalAnswered || 0
          };
        }
        if (favRes.code === 200) {
          userStats.value.favoriteCount = ((_b = favRes.data) == null ? void 0 : _b.total) || (((_c = favRes.data) == null ? void 0 : _c.list) || []).length || 0;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:172", "加载用户统计失败:", error);
      }
    };
    const calculateCacheSize = () => {
      try {
        const info = common_vendor.index.getStorageInfoSync();
        const size = (info.currentSize / 1024).toFixed(2);
        cacheSize.value = size + "KB";
      } catch {
        cacheSize.value = "0MB";
      }
    };
    const goToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/subpkg/login/login"
      });
    };
    const goToWrongBook = () => {
      common_vendor.index.navigateTo({
        url: "/subpkg/wrong/wrong"
      });
    };
    const goToFavorite = () => {
      common_vendor.index.navigateTo({
        url: "/subpkg/favorite/favorite"
      });
    };
    const goToHistory = () => {
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    };
    const goToSettings = () => {
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    };
    const goToAbout = () => {
      common_vendor.index.showModal({
        title: "关于刷题小程序",
        content: "刷题小程序是一款专为面试准备的学习工具，提供丰富的题库资源和便捷的刷题体验。",
        showCancel: false
      });
    };
    const clearCache = () => {
      common_vendor.index.showModal({
        title: "清除缓存",
        content: "确定要清除所有缓存数据吗？",
        success: (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.clearStorageSync();
              common_vendor.index.showToast({ title: "清除成功", icon: "success" });
              cacheSize.value = "0MB";
              loadUserStats();
            } catch {
              common_vendor.index.showToast({ title: "清除失败", icon: "none" });
            }
          }
        }
      });
    };
    const checkUpdate = () => {
      common_vendor.index.showLoading({ title: "检查中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          title: "检查更新",
          content: "当前已是最新版本",
          showCancel: false
        });
      }, 1e3);
    };
    const handleLogout = () => {
      userStore.logout();
    };
    common_vendor.onShow(() => {
      userStore.initUserState();
      loadUserStats();
      calculateCacheSize();
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.unref(userStore).avatar,
        b: isVip.value
      }, isVip.value ? {} : {}, {
        c: common_vendor.t(common_vendor.unref(userStore).username),
        d: (_a = common_vendor.unref(userStore).userInfo) == null ? void 0 : _a.email
      }, ((_b = common_vendor.unref(userStore).userInfo) == null ? void 0 : _b.email) ? {
        e: common_vendor.t(common_vendor.unref(userStore).userInfo.email)
      } : {}, {
        f: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        g: common_vendor.t(userStats.value.wrongCount || 0),
        h: common_vendor.o(goToWrongBook, "a1"),
        i: common_vendor.t(userStats.value.favoriteCount || 0),
        j: common_vendor.o(goToFavorite, "45"),
        k: common_vendor.t(userStats.value.studyDays || 1),
        l: common_vendor.t(userStats.value.totalAnswered || 0)
      } : {
        m: common_vendor.o(goToLogin, "01")
      }, {
        n: common_vendor.o(goToWrongBook, "66"),
        o: common_vendor.o(goToFavorite, "e0"),
        p: common_vendor.o(goToHistory, "f4"),
        q: common_vendor.o(goToSettings, "b1"),
        r: common_vendor.t(cacheSize.value),
        s: common_vendor.o(clearCache, "9d"),
        t: common_vendor.o(checkUpdate, "ef"),
        v: common_vendor.o(goToAbout, "12"),
        w: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        x: common_vendor.o(handleLogout, "e2")
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f7520f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
