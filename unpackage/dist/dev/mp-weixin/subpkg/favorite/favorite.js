"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_record = require("../../api/record.js");
const _sfc_main = {
  __name: "favorite",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const list = common_vendor.ref([]);
    const load = async () => {
      var _a;
      common_vendor.index.__f__("log", "at subpkg/favorite/favorite.vue:34", "收藏页加载，登录状态:", userStore.isLoggedIn);
      if (!userStore.isLoggedIn) {
        list.value = [];
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_record.getCollectList({ page: 1, page_size: 100 });
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at subpkg/favorite/favorite.vue:43", "收藏列表响应:", res);
        if (res.code === 200) {
          list.value = ((_a = res.data) == null ? void 0 : _a.list) || [];
          common_vendor.index.__f__("log", "at subpkg/favorite/favorite.vue:46", "收藏列表数据:", list.value);
        } else {
          common_vendor.index.showToast({ title: res.message || "加载失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at subpkg/favorite/favorite.vue:52", "加载收藏列表失败:", error);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    };
    const goLogin = () => {
      common_vendor.index.navigateTo({ url: "/subpkg/login/login" });
    };
    const goQuestion = (item) => {
      const questionId = item.question_id || item.id;
      if (!questionId)
        return;
      common_vendor.index.navigateTo({ url: `/subpkg/question/question?id=${questionId}` });
    };
    common_vendor.onShow(() => {
      load();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !common_vendor.unref(userStore).isLoggedIn
      }, !common_vendor.unref(userStore).isLoggedIn ? {
        b: common_vendor.o(goLogin, "c1")
      } : common_vendor.e({
        c: common_vendor.f(list.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.title || "题目ID：" + item.id),
            b: item.id,
            c: common_vendor.o(($event) => goQuestion(item), item.id)
          };
        }),
        d: list.value.length === 0
      }, list.value.length === 0 ? {} : {}));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c0af6414"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subpkg/favorite/favorite.js.map
