"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_category = require("../../api/category.js");
const api_record = require("../../api/record.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const categoryList = common_vendor.ref([]);
    const statistics = common_vendor.ref({
      totalCount: 0,
      answeredCount: 0,
      correctRate: "0%",
      wrongCount: 0
    });
    const loadCategoryList = async () => {
      try {
        const res = await api_category.getCategoryList();
        if (res.code === 200) {
          const colors = ["#2979ff", "#19be6b", "#ff9900", "#ff5722", "#9c27b0", "#00bcd4"];
          categoryList.value = (res.data || []).map((item, index) => ({
            ...item,
            color: colors[index % colors.length],
            questionCount: item.question_count || 0
            // 等后端添加 question_count 字段后会自动显示
          }));
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:117", "获取分类失败:", error);
      }
    };
    const loadStatistics = async () => {
      if (!userStore.isLoggedIn) {
        const localStats = common_vendor.index.getStorageSync("localStatistics");
        if (localStats) {
          statistics.value = JSON.parse(localStats);
        }
        return;
      }
      try {
        const res = await api_record.getStatistics();
        if (res.code === 200) {
          statistics.value = res.data || statistics.value;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:138", "获取统计失败:", error);
      }
    };
    const goToWrongBook = () => {
      if (!userStore.checkLogin())
        return;
      common_vendor.index.navigateTo({
        url: "/subpkg/wrong/wrong"
      });
    };
    const goToFavorite = () => {
      if (!userStore.checkLogin())
        return;
      common_vendor.index.navigateTo({
        url: "/subpkg/favorite/favorite"
      });
    };
    const continuePractice = () => {
      const progress = common_vendor.index.getStorageSync("lastPractice");
      if (progress && progress.categoryId) {
        const category = categoryList.value.find((c) => c.id === progress.categoryId);
        if (category) {
          common_vendor.index.navigateTo({
            url: `/subpkg/question/question?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}&index=${progress.questionIndex || 0}`
          });
          return;
        }
      }
      if (categoryList.value.length > 0) {
        goToQuestion(categoryList.value[0]);
      } else {
        common_vendor.index.showToast({ title: "暂无题库", icon: "none" });
      }
    };
    const randomPractice = () => {
      if (categoryList.value.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryList.value.length);
        goToQuestion(categoryList.value[randomIndex]);
      } else {
        common_vendor.index.showToast({ title: "暂无题库", icon: "none" });
      }
    };
    const goToCategory = () => {
      common_vendor.index.switchTab({
        url: "/pages/category/category"
      });
    };
    const goToQuestion = (category) => {
      common_vendor.index.navigateTo({
        url: `/subpkg/question/question?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`
      });
    };
    common_vendor.onShow(() => {
      loadCategoryList();
      loadStatistics();
    });
    common_vendor.onMounted(() => {
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(statistics.value.totalCount || 0),
        b: common_vendor.t(statistics.value.answeredCount || 0),
        c: common_vendor.t(statistics.value.correctRate || "0%"),
        d: common_vendor.t(statistics.value.wrongCount || 0),
        e: common_vendor.o(goToWrongBook, "8f"),
        f: common_vendor.o(goToFavorite, "e7"),
        g: common_vendor.o(continuePractice, "c4"),
        h: common_vendor.o(randomPractice, "5d"),
        i: common_vendor.o(goToCategory, "e6"),
        j: common_vendor.f(categoryList.value, (item, k0, i0) => {
          var _a;
          return {
            a: common_vendor.t(((_a = item.name) == null ? void 0 : _a.charAt(0)) || "?"),
            b: item.color || "#2979ff",
            c: common_vendor.t(item.name),
            d: common_vendor.t(item.questionCount || 0),
            e: item.id,
            f: common_vendor.o(($event) => goToQuestion(item), item.id)
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
