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
      var _a, _b;
      if (!userStore.isLoggedIn || !((_a = userStore.userInfo) == null ? void 0 : _a.id)) {
        list.value = [];
        return;
      }
      const res = await api_record.getCollectList({ user_id: userStore.userInfo.id, page: 1, page_size: 100 });
      if (res.code === 200) {
        list.value = ((_b = res.data) == null ? void 0 : _b.list) || [];
      }
    };
    const goLogin = () => {
      common_vendor.index.navigateTo({ url: "/pages/login/login" });
    };
    const goQuestion = (item) => {
      const questionId = item.question_id || item.id;
      if (!questionId)
        return;
      common_vendor.index.navigateTo({ url: `/pages/question/question?question_id=${questionId}` });
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
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8850f19c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/favorite/favorite.js.map
