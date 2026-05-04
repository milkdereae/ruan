"use strict";
const common_vendor = require("../../common/vendor.js");
const api_question = require("../../api/question.js");
const api_record = require("../../api/record.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = {
  __name: "question",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const optionLabels = ["A", "B", "C", "D", "E", "F"];
    const categoryId = common_vendor.ref(0);
    const categoryName = common_vendor.ref("");
    const questionList = common_vendor.ref([]);
    const currentIndex = common_vendor.ref(0);
    const selectedOption = common_vendor.ref("");
    const showResult = common_vendor.ref(false);
    const isFavorited = common_vendor.ref(false);
    const favoriteIds = common_vendor.ref([]);
    const currentQuestion = common_vendor.computed(() => {
      return questionList.value[currentIndex.value] || {
        title: "",
        options: [],
        answer: "",
        analysis: ""
      };
    });
    const isCorrect = common_vendor.computed(() => {
      return selectedOption.value === currentQuestion.value.answer;
    });
    const isLastQuestion = common_vendor.computed(() => {
      return currentIndex.value >= questionList.value.length - 1;
    });
    const progressPercent = common_vendor.computed(() => {
      if (questionList.value.length === 0)
        return 0;
      return (currentIndex.value + 1) / questionList.value.length * 100;
    });
    common_vendor.onLoad((options) => {
      if (options.categoryId) {
        categoryId.value = parseInt(options.categoryId);
        categoryName.value = options.categoryName ? decodeURIComponent(options.categoryName) : "刷题";
        const startIndex = parseInt(options.index) || 0;
        loadQuestionList(startIndex);
        loadFavoriteList();
      } else if (options.id) {
        categoryName.value = options.from === "wrong" ? "错题回顾" : "收藏题目";
        loadQuestionDetail(parseInt(options.id));
        loadFavoriteList();
      }
    });
    const loadQuestionList = async (startIndex = 0) => {
      var _a;
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_question.getQuestionList({
          cate_id: categoryId.value,
          page: 1,
          page_size: 50
        });
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          questionList.value = (((_a = res.data) == null ? void 0 : _a.list) || []).map((item) => ({
            ...item,
            options: [
              { value: "A", text: item.option_a || "" },
              { value: "B", text: item.option_b || "" },
              { value: "C", text: item.option_c || "" },
              { value: "D", text: item.option_d || "" }
            ].filter((opt) => opt.text)
            // 过滤掉空选项
          }));
          if (questionList.value.length === 0) {
            common_vendor.index.showToast({ title: "该分类暂无题目", icon: "none" });
            setTimeout(() => common_vendor.index.navigateBack(), 1500);
            return;
          }
          if (startIndex > 0 && startIndex < questionList.value.length) {
            currentIndex.value = startIndex;
          }
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at subpkg/question/question.vue:203", "加载题目失败:", error);
        useMockData();
      }
    };
    const loadQuestionDetail = async (questionId) => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await getQuestionDetail(questionId);
        common_vendor.index.hideLoading();
        if (res.code === 200 && res.data) {
          const item = res.data;
          questionList.value = [{
            ...item,
            options: [
              { value: "A", text: item.option_a || "" },
              { value: "B", text: item.option_b || "" },
              { value: "C", text: item.option_c || "" },
              { value: "D", text: item.option_d || "" }
            ].filter((opt) => opt.text)
          }];
          currentIndex.value = 0;
        } else {
          common_vendor.index.showToast({ title: "题目加载失败", icon: "none" });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at subpkg/question/question.vue:235", "加载题目详情失败:", error);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
    };
    const loadFavoriteList = async () => {
      var _a;
      if (!userStore.isLoggedIn)
        return;
      try {
        const res = await api_record.getCollectList({ page: 1, page_size: 100 });
        if (res.code === 200) {
          favoriteIds.value = (((_a = res.data) == null ? void 0 : _a.list) || []).map((item) => item.id);
          checkIsFavorited();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subpkg/question/question.vue:252", "加载收藏失败:", error);
      }
    };
    const checkIsFavorited = () => {
      if (!currentQuestion.value.id)
        return;
      isFavorited.value = favoriteIds.value.includes(currentQuestion.value.id);
    };
    const useMockData = () => {
      questionList.value = [
        {
          id: 1,
          title: "Vue3 中 Composition API 的核心优势是什么？",
          options: [
            { value: "A", text: "更好的性能优化" },
            { value: "B", text: "更好的逻辑复用和代码组织" },
            { value: "C", text: "更小的打包体积" },
            { value: "D", text: "更好的浏览器兼容性" }
          ],
          answer: "B",
          analysis: "Composition API 最大的优势在于提供了更好的逻辑复用机制和代码组织能力，通过组合式函数(composables)可以将相关逻辑抽取到可复用的函数中。"
        },
        {
          id: 2,
          title: "以下哪个不是 JavaScript 的基本数据类型？",
          options: [
            { value: "A", text: "String" },
            { value: "B", text: "Number" },
            { value: "C", text: "Array" },
            { value: "D", text: "Boolean" }
          ],
          answer: "C",
          analysis: "Array（数组）是 JavaScript 的引用数据类型，不是基本数据类型。基本数据类型包括：String、Number、Boolean、Null、Undefined、Symbol、BigInt。"
        },
        {
          id: 3,
          title: "CSS 中，以下哪个属性用于设置元素的层级关系？",
          options: [
            { value: "A", text: "position" },
            { value: "B", text: "z-index" },
            { value: "C", text: "display" },
            { value: "D", text: "float" }
          ],
          answer: "B",
          analysis: "z-index 属性用于设置定位元素的层级关系，数值越大层级越高。注意：z-index 只对 position 值为 relative、absolute、fixed 或 sticky 的元素有效。"
        }
      ];
      categoryName.value = "前端面试题";
    };
    const selectOption = (value) => {
      if (showResult.value)
        return;
      selectedOption.value = value;
    };
    const handleSubmitAnswer = async () => {
      if (!selectedOption.value) {
        common_vendor.index.showToast({ title: "请选择答案", icon: "none" });
        return;
      }
      showResult.value = true;
      if (userStore.isLoggedIn && currentQuestion.value.id) {
        try {
          await api_record.submitAnswer({
            question_id: currentQuestion.value.id,
            user_answer: selectedOption.value
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at subpkg/question/question.vue:328", "提交答案失败:", error);
        }
      } else {
        saveLocalRecord();
      }
      saveProgress();
    };
    const saveLocalRecord = () => {
      const key = `question_${currentQuestion.value.id}`;
      common_vendor.index.setStorageSync(key, {
        questionId: currentQuestion.value.id,
        answer: selectedOption.value,
        isCorrect: isCorrect.value,
        timestamp: Date.now()
      });
    };
    const saveProgress = () => {
      if (categoryId.value && questionList.value.length > 0) {
        common_vendor.index.setStorageSync("lastPractice", {
          categoryId: categoryId.value,
          questionIndex: currentIndex.value,
          categoryName: categoryName.value,
          totalQuestions: questionList.value.length
        });
      }
    };
    const nextQuestion = () => {
      if (isLastQuestion.value) {
        common_vendor.index.showModal({
          title: "恭喜完成",
          content: "已完成本分类所有题目",
          showCancel: false,
          success: () => {
            common_vendor.index.removeStorageSync("lastPractice");
            common_vendor.index.navigateBack();
          }
        });
      } else {
        currentIndex.value++;
        selectedOption.value = "";
        showResult.value = false;
        checkIsFavorited();
        saveProgress();
      }
    };
    const handleToggleFavorite = async () => {
      if (!userStore.checkLogin())
        return;
      if (!currentQuestion.value.id) {
        common_vendor.index.showToast({ title: "无法收藏", icon: "none" });
        return;
      }
      try {
        const newStatus = !isFavorited.value;
        const res = await api_record.toggleCollect({
          question_id: currentQuestion.value.id,
          is_collect: newStatus ? 1 : 0
        });
        if (res.code === 200) {
          isFavorited.value = newStatus;
          common_vendor.index.showToast({
            title: newStatus ? "收藏成功" : "取消收藏",
            icon: "success"
          });
          if (newStatus) {
            favoriteIds.value.push(currentQuestion.value.id);
          } else {
            favoriteIds.value = favoriteIds.value.filter((id) => id !== currentQuestion.value.id);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subpkg/question/question.vue:418", "收藏操作失败:", error);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      }
    };
    const showAnalysis = () => {
      if (!selectedOption.value) {
        common_vendor.index.showToast({ title: "请先选择答案", icon: "none" });
        return;
      }
      showResult.value = true;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(currentIndex.value + 1),
        b: common_vendor.t(questionList.value.length),
        c: common_vendor.t(categoryName.value),
        d: progressPercent.value + "%",
        e: common_vendor.t(currentQuestion.value.type || "单选题"),
        f: common_vendor.t(currentQuestion.value.title),
        g: common_vendor.f(currentQuestion.value.options, (option, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(optionLabels[index]),
            b: common_vendor.t(option.text)
          }, showResult.value ? common_vendor.e({
            c: option.value === currentQuestion.value.answer
          }, option.value === currentQuestion.value.answer ? {} : selectedOption.value === option.value && option.value !== currentQuestion.value.answer ? {} : {}, {
            d: selectedOption.value === option.value && option.value !== currentQuestion.value.answer
          }) : {}, {
            e: index,
            f: selectedOption.value === option.value ? 1 : "",
            g: showResult.value && option.value === currentQuestion.value.answer ? 1 : "",
            h: showResult.value && selectedOption.value === option.value && option.value !== currentQuestion.value.answer ? 1 : "",
            i: common_vendor.o(($event) => selectOption(option.value), index)
          });
        }),
        h: showResult.value,
        i: showResult.value
      }, showResult.value ? {
        j: common_vendor.t(isCorrect.value ? "回答正确" : "回答错误"),
        k: common_vendor.n(isCorrect.value ? "tag-correct" : "tag-wrong"),
        l: common_vendor.t(currentQuestion.value.answer),
        m: common_vendor.t(currentQuestion.value.analysis || "暂无解析")
      } : {}, {
        n: common_vendor.t(isFavorited.value ? "★" : "☆"),
        o: isFavorited.value ? 1 : "",
        p: common_vendor.t(isFavorited.value ? "已收藏" : "收藏"),
        q: common_vendor.o(handleToggleFavorite, "e7"),
        r: !showResult.value
      }, !showResult.value ? {
        s: common_vendor.o(showAnalysis, "79")
      } : {}, {
        t: !showResult.value
      }, !showResult.value ? {
        v: !selectedOption.value,
        w: common_vendor.o(handleSubmitAnswer, "cc")
      } : {
        x: common_vendor.t(isLastQuestion.value ? "完成" : "下一题"),
        y: common_vendor.o(nextQuestion, "f3")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-81532367"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subpkg/question/question.js.map
