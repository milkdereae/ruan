"use strict";
const common_vendor = require("../../common/vendor.js");
const api_category = require("../../api/category.js");
const _sfc_main = {
  __name: "category",
  setup(__props) {
    const categoryList = common_vendor.ref([]);
    const searchKeyword = common_vendor.ref("");
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
      "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
    ];
    const icons = ["📱", "💻", "☕", "🔧", "📊", "🎨", "🔐", "🌐"];
    const filteredCategoryList = common_vendor.computed(() => {
      if (!searchKeyword.value.trim()) {
        return categoryList.value;
      }
      return categoryList.value.filter(
        (item) => item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
      );
    });
    const loadCategoryList = async () => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_category.getCategoryList();
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          categoryList.value = (res.data || []).map((item, index) => ({
            ...item,
            questionCount: item.question_count || 0,
            // 等后端添加 question_count 字段后会自动显示
            gradient: gradients[index % gradients.length],
            icon: icons[index % icons.length],
            progress: Math.floor(Math.random() * 100)
          }));
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/category/category.vue:103", "获取分类失败:", error);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    };
    const handleSearch = () => {
      if (!searchKeyword.value.trim()) {
        common_vendor.index.showToast({ title: "请输入搜索关键词", icon: "none" });
        return;
      }
    };
    const goToQuestion = (item) => {
      common_vendor.index.navigateTo({
        url: `/subpkg/question/question?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name)}`
      });
    };
    common_vendor.onShow(() => {
      loadCategoryList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch, "bf"),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value, "f8"),
        d: common_vendor.f(filteredCategoryList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.icon || "📖"),
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.questionCount || 0),
            d: item.progress > 0
          }, item.progress > 0 ? {
            e: item.progress + "%",
            f: common_vendor.t(item.progress)
          } : {}, {
            g: item.id,
            h: item.gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            i: common_vendor.o(($event) => goToQuestion(item), item.id)
          });
        }),
        e: filteredCategoryList.value.length === 0
      }, filteredCategoryList.value.length === 0 ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8145b772"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/category/category.js.map
