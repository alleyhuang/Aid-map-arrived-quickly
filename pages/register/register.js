const app = getApp();

Page({
  data: {
    regType: "pro", // 'pro' or 'help'
    proTypes: [
      "医疗急救类",
      "消防救援类",
      "工程技术类",
      "灾害应对类",
      "心理援助类",
      "其他",
    ],
    helpTypes: ["交通运输类", "物资供给类", "其他"],
    selectedProType: 0,
    selectedHelpType: 0,
    showProOther: false,
    showHelpOther: false,
    range: 5,
    shareLocation: false,
    agree: false,
    location: null,
    statusBarHeight: 0,
  },

  onLoad() {
    this.setData({
      statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    });
  },

  onSelectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ regType: type });
  },

  onSelectProType(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({ selectedProType: idx });
    if (this.data.proTypes[idx] === "其他") {
      this.setData({ showProOther: true });
    } else {
      this.setData({ showProOther: false });
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onRangeChange(e) {
    this.setData({ range: e.detail.value });
  },

  onChangeHelpDetail(e) {
    this.setData({ helpDetail: e.detail.value });
  },

  onSelectHelpType(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({ selectedHelpType: idx });
    if (this.data.helpTypes[idx] === "其他") {
      this.setData({ showHelpOther: true });
    } else {
      this.setData({ showHelpOther: false });
    }
  },

  onChooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
            address: res.address,
          },
        });
        wx.showToast({
          title: "已选择: " + res.name,
          icon: "none",
        });
      },
      fail: (err) => {
        console.error("选择位置失败:", err);
        wx.showToast({
          title: "选择位置失败",
          icon: "none",
        });
      },
    });
  },

  onRequestLocationAuth() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting["scope.userLocation"]) {
          wx.authorize({
            scope: "scope.userLocation",
            success: () => {
              wx.showToast({ title: "授权成功", icon: "success" });
              this.onChooseLocation();
            },
            fail: () => {
              wx.showToast({ title: "授权失败", icon: "none" });
            },
          });
        } else {
          this.onChooseLocation();
        }
      },
    });
  },

  onUploadCert() {
    wx.chooseMessageFile({
      count: 1,
      type: "all",
      success: (res) => {
        wx.showToast({ title: "已上传", icon: "success" });
      },
    });
  },

  getUserOpenid() {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "getOpenId",
      },
      success: (res) => {
        console.log("获取用户openid成功:", res);
        const { openid } = res.result;
        this.setData({
          openid,
        });
      },
      fail: (err) => {
        console.error("获取用户openid失败:", err);
      },
    });
  },

  insertData(data) {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "insertRecord",
        data,
        database: "users",
      },
      success: (res) => {
        debugger;
        console.log("插入数据成功:", res);
      },
      fail: (err) => {
        console.error("插入数据失败:", err);
      },
    });
  },

  async onSubmit() {
    if (!this.data.agree) {
      wx.showToast({ title: "请同意协议", icon: "none" });
      return;
    }

    if (!this.data.location) {
      wx.showToast({ title: "请选择位置", icon: "none" });
      return;
    }

    // 获取用户 openid
    this.getUserOpenid();

    try {
      const userData = {
        _id: this.data.openid,
        name: this.data.name,
        phone: this.data.phone,
        location: this.data.location,
        helpRange: this.data.range,
        helpType:
          this.data.regType === "pro"
            ? this.data.proTypes[this.data.selectedProType]
            : this.data.helpTypes[this.data.selectedHelpType],
        helpDetail: this.data.helpDetail || "",
        certificates: [], // 后续可添加上传功能
        isProfessional: this.data.regType === "pro",
        status: "在线",
        registerTime: new Date(),
        lastActiveTime: new Date(),
      };

      this.insertData(userData);

      wx.showToast({
        title: "注册成功",
        icon: "success",
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        },
      });
    } catch (error) {
      console.error("注册失败：", error);
      wx.showToast({
        title: "注册失败，请重试",
        icon: "error",
      });
    }
  },

  onAgreeChange(e) {
    console.log(e.detail.value);

    if (e.detail.value.includes("agree")) {
      this.setData({
        agree: true,
      });
      return;
    }
    this.setData({
      agree: false,
    });
  },
});
