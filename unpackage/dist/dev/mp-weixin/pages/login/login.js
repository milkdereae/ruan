"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const isRegister = common_vendor.ref(false);
    const loginForm = common_vendor.ref({
      username: "",
      password: ""
    });
    const registerForm = common_vendor.ref({
      email: "",
      code: "",
      password: "",
      nickname: ""
    });
    const loading = common_vendor.ref(false);
    const sending = common_vendor.ref(false);
    const countdown = common_vendor.ref(0);
    const isAgree = common_vendor.ref(false);
    let countdownTimer = null;
    const handleSendCode = async () => {
      var _a;
      if (!registerForm.value.email.trim()) {
        common_vendor.index.showToast({ title: "请输入邮箱", icon: "none" });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerForm.value.email)) {
        common_vendor.index.showToast({ title: "请输入有效的邮箱地址", icon: "none" });
        return;
      }
      sending.value = true;
      try {
        const res = await api_user.sendCode(registerForm.value.email.trim());
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
          startCountdown(60);
        } else if (res.code === 400 && ((_a = res.data) == null ? void 0 : _a.remaining)) {
          common_vendor.index.showToast({ title: res.message, icon: "none" });
          startCountdown(res.data.remaining);
        } else {
          common_vendor.index.showToast({ title: res.message || "发送失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:209", "发送验证码失败:", error);
        common_vendor.index.showToast({ title: "发送失败，请检查网络", icon: "none" });
      } finally {
        sending.value = false;
      }
    };
    const startCountdown = (seconds) => {
      countdown.value = seconds;
      countdownTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(countdownTimer);
        }
      }, 1e3);
    };
    const handleLogin = async () => {
      if (!loginForm.value.username.trim()) {
        common_vendor.index.showToast({ title: "请输入用户名", icon: "none" });
        return;
      }
      if (!loginForm.value.password.trim()) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      loading.value = true;
      try {
        const res = await api_user.login({
          username: loginForm.value.username.trim(),
          password: loginForm.value.password
        });
        const { token: tk, ...userInfo } = res.data || {};
        userStore.setToken(tk || "");
        userStore.setUserInfo(userInfo);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.reLaunch({ url: "/pages/index/index" });
        }, 800);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:254", "登录失败:", error);
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "登录失败，请重试", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    const handleRegister = async () => {
      if (!registerForm.value.email.trim()) {
        common_vendor.index.showToast({ title: "请输入邮箱", icon: "none" });
        return;
      }
      if (!registerForm.value.code.trim() || registerForm.value.code.trim().length !== 6) {
        common_vendor.index.showToast({ title: "请输入6位验证码", icon: "none" });
        return;
      }
      if (!registerForm.value.password || registerForm.value.password.length < 6) {
        common_vendor.index.showToast({ title: "密码至少6位", icon: "none" });
        return;
      }
      if (!isAgree.value) {
        common_vendor.index.showToast({ title: "请先同意用户协议", icon: "none" });
        return;
      }
      loading.value = true;
      try {
        await api_user.register({
          email: registerForm.value.email.trim(),
          code: registerForm.value.code.trim(),
          password: registerForm.value.password,
          nickname: registerForm.value.nickname || ""
        });
        common_vendor.index.showToast({ title: "注册成功，请登录", icon: "success" });
        setTimeout(() => {
          isRegister.value = false;
        }, 800);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:294", "注册失败:", error);
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "注册失败，请重试", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    const switchToRegister = () => {
      isRegister.value = true;
    };
    const switchToLogin = () => {
      isRegister.value = false;
    };
    const handleAgreeChange = (e) => {
      isAgree.value = e.detail.value.length > 0;
    };
    common_vendor.onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(isRegister.value ? "注册新账号" : "登录后开始刷题之旅"),
        b: !isRegister.value
      }, !isRegister.value ? {
        c: loginForm.value.username,
        d: common_vendor.o(($event) => loginForm.value.username = $event.detail.value, "eb"),
        e: loginForm.value.password,
        f: common_vendor.o(($event) => loginForm.value.password = $event.detail.value, "6e"),
        g: common_vendor.t(loading.value ? "登录中..." : "登 录"),
        h: loading.value ? 1 : "",
        i: loading.value,
        j: common_vendor.o(handleLogin, "11"),
        k: common_vendor.o(switchToRegister, "76")
      } : {
        l: registerForm.value.email,
        m: common_vendor.o(($event) => registerForm.value.email = $event.detail.value, "9f"),
        n: registerForm.value.code,
        o: common_vendor.o(($event) => registerForm.value.code = $event.detail.value, "51"),
        p: common_vendor.t(countdown.value > 0 ? `${countdown.value}s后重试` : sending.value ? "发送中..." : "获取验证码"),
        q: countdown.value > 0 || sending.value ? 1 : "",
        r: countdown.value > 0 || sending.value,
        s: common_vendor.o(handleSendCode, "50"),
        t: registerForm.value.password,
        v: common_vendor.o(($event) => registerForm.value.password = $event.detail.value, "32"),
        w: registerForm.value.nickname,
        x: common_vendor.o(($event) => registerForm.value.nickname = $event.detail.value, "ce"),
        y: common_vendor.t(loading.value ? "注册中..." : "注 册"),
        z: loading.value ? 1 : "",
        A: loading.value,
        B: common_vendor.o(handleRegister, "4d"),
        C: common_vendor.o(switchToLogin, "0e")
      }, {
        D: isRegister.value
      }, isRegister.value ? {
        E: isAgree.value,
        F: common_vendor.o(handleAgreeChange, "37")
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
