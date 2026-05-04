"use strict";
const common_vendor = require("../../common/vendor.js");
const api_record = require("../../api/record.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = {
  __name: "wrong",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const wrongList = common_vendor.ref([]);
    const statistics = common_vendor.ref({
      total: 0,
      thisWeek: 0,
      reviewed: 0
    });
    const loadWrongList = async () => {
      var _a;
      if (!userStore.isLoggedIn) {
        loadLocalWrongList();
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_record.getWrongList({ page: 1, page_size: 100 });
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          wrongList.value = (((_a = res.data) == null ? void 0 : _a.list) || []).map((item) => ({
            ...item,
            id: item.id,
            questionId: item.question_id,
            questionTitle: item.title,
            userAnswer: item.user_answer,
            correctAnswer: item.answer,
            categoryName: item.category_name,
            wrongTime: item.update_time,
            isReviewed: false
            // 本地状态，默认未复习
          }));
          updateStatistics();
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at subpkg/wrong/wrong.vue:118", "加载错题失败:", error);
        loadLocalWrongList();
      }
    };
    const loadLocalWrongList = () => {
      const list = [];
      const keys = common_vendor.index.getStorageInfoSync().keys || [];
      keys.forEach((key) => {
        if (key.startsWith("question_")) {
          const record = common_vendor.index.getStorageSync(key);
          if (record && !record.isCorrect) {
            list.push({
              id: record.questionId,
              questionId: record.questionId,
              questionTitle: "本地错题 " + record.questionId,
              userAnswer: record.answer,
              correctAnswer: "?",
              wrongTime: record.timestamp,
              isReviewed: false,
              categoryName: "本地记录"
            });
          }
        }
      });
      wrongList.value = list.sort((a, b) => b.wrongTime - a.wrongTime);
      updateStatistics();
    };
    const updateStatistics = () => {
      const now = /* @__PURE__ */ new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      statistics.value = {
        total: wrongList.value.length,
        thisWeek: wrongList.value.filter((item) => item.wrongTime >= weekStart.getTime()).length,
        reviewed: wrongList.value.filter((item) => item.isReviewed).length
      };
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 36e5)
        return "刚刚";
      if (diff < 864e5)
        return Math.floor(diff / 36e5) + "小时前";
      if (diff < 6048e5)
        return Math.floor(diff / 864e5) + "天前";
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    const goToQuestion = (item) => {
      common_vendor.index.navigateTo({
        url: `/subpkg/question/question?id=${item.id}&from=wrong`
      });
    };
    const markReviewed = async (id) => {
      const index = wrongList.value.findIndex((item2) => item2.id === id);
      if (index === -1)
        return;
      const item = wrongList.value[index];
      item.isReviewed = !item.isReviewed;
      updateStatistics();
      common_vendor.index.showToast({
        title: item.isReviewed ? "已标记复习" : "取消标记",
        icon: "success"
      });
    };
    const deleteWrongItem = async (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这道错题吗？",
        success: async (res) => {
          if (res.confirm) {
            if (userStore.isLoggedIn) {
              try {
                await api_record.deleteWrong({ question_id: id });
              } catch (error) {
                common_vendor.index.__f__("error", "at subpkg/wrong/wrong.vue:215", "删除失败:", error);
              }
            } else {
              common_vendor.index.removeStorageSync(`question_${id}`);
            }
            wrongList.value = wrongList.value.filter((item) => item.id !== id);
            updateStatistics();
            common_vendor.index.showToast({ title: "已删除", icon: "success" });
          }
        }
      });
    };
    const clearAllWrong = () => {
      common_vendor.index.showModal({
        title: "确认清空",
        content: "确定要清空所有错题吗？此操作不可恢复",
        confirmColor: "#ff4d4f",
        success: (res) => {
          if (res.confirm) {
            wrongList.value = [];
            updateStatistics();
            common_vendor.index.showToast({ title: "已清空", icon: "success" });
          }
        }
      });
    };
    const goToPractice = () => {
      common_vendor.index.switchTab({
        url: "/pages/category/category"
      });
    };
    common_vendor.onShow(() => {
      loadWrongList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(statistics.value.total || 0),
        b: common_vendor.t(statistics.value.thisWeek || 0),
        c: common_vendor.t(statistics.value.reviewed || 0),
        d: wrongList.value.length > 0
      }, wrongList.value.length > 0 ? {
        e: common_vendor.o(clearAllWrong, "76")
      } : {}, {
        f: common_vendor.f(wrongList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.categoryName || "综合"),
            b: common_vendor.t(formatTime(item.wrongTime)),
            c: common_vendor.t(item.questionTitle),
            d: common_vendor.t(item.userAnswer),
            e: common_vendor.t(item.correctAnswer),
            f: common_vendor.t(item.isReviewed ? "已复习" : "标记已复习"),
            g: common_vendor.o(($event) => markReviewed(item.id), item.id),
            h: common_vendor.o(($event) => deleteWrongItem(item.id), item.id),
            i: item.id,
            j: common_vendor.o(($event) => goToQuestion(item), item.id)
          };
        }),
        g: wrongList.value.length === 0
      }, wrongList.value.length === 0 ? {
        h: common_vendor.o(goToPractice, "14")
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-995587de"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subpkg/wrong/wrong.js.map
