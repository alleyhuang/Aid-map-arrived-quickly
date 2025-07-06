// index.js
const app = getApp();

Page({
  data: {
    latitude: 39.9928,
    longitude: 116.3975,
    poiType: "help",
    markers: [],
    scale: 13,
    locationAuthorized: false,
    helpBtnPressing: false,
    helpBtnProgress: 0,
    helpBtnTimer: null,
    touchStartTime: 0,
    isLongPress: false,
    hasEvent: false,
    openid: "",
  },
  onLoad() {
    this.authorizeLocation();
  },

  onShow() {
    this.getPointInfo();
  },

  getData(keyword, iconPath) {
    // 定义请求的 URL
    const url = "https://apis.map.qq.com/ws/place/v1/search";
    const lat = this.data.latitude;
    const lgt = this.data.longitude;
    const distance = 1000;
    const page_size = 10;
    const page_index = 1;
    const key = "PE6BZ-37BC7-CGQXD-H3G3Z-22MOT-6DB2P";

    const data = {
      boundary: `nearby(${lat},${lgt},${distance})`,
      keyword,
      page_size,
      page_index,
      key,
    };

    wx.request({
      url,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      data,
      success: (res) => {
        console.log("res", res.data);
        this.getMarkers(res, iconPath);
      },
    });
  },

  getMarkers(res, iconPath) {
    const { data: hospital } = res.data;
    const markers = [];
    hospital.forEach((h) => {
      const { id, title, location } = h;
      const { lat, lng } = location;
      const marker = {
        id,
        latitude: lat,
        longitude: lng,
        title,
        iconPath,
        width: 40,
        height: 40,
      };
      markers.push(marker);
    });
    this.setData({ markers });
  },

  authorizeLocation() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting["scope.userLocation"]) {
          wx.authorize({
            scope: "scope.userLocation",
            success: () => {
              this.getUserLocation();
            },
            fail: () => {
              wx.showToast({ title: "请授权定位", icon: "none" });
            },
          });
        } else {
          this.getUserLocation();
        }
      },
    });
  },

  getUserLocation() {
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          locationAuthorized: true,
        });
        this.setMarkers(this.data.poiType);
      },
      fail: () => {
        wx.showToast({ title: "定位失败", icon: "none" });
      },
    });
  },

  // 验证用户是否注册
  checkRegister(e) {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "checkRegister",
      },
      success: (res) => {
        const { data } = res.result;
        if (data.length === 0) {
          wx.showModal({
            title: "提示",
            content: "请先注册",
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: "/pages/register/register",
                });
              }
            },
          });
          return;
        }
        console.log("用户注册信息:", res);
        this.getPoint(e);
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      },
    });
  },

  getPoint(e) {
    const { markerId } = e.detail;
    const needhelp = this.data.markers.find((item) => item.id === markerId);
    debugger;
    const addressinfo = {
      latitude: needhelp.latitude,
      longitude: needhelp.longitude,
    };
    wx.navigateTo({
      url: `/pages/help-detail/index?addressinfo=${JSON.stringify(
        addressinfo
      )}`,
    });
  },

  async onMarkerTap(e) {
    this.checkRegister(e);
  },

  getPointInfo() {
    wx.showLoading({
      title: "加载中",
    });
    // 这里查 poi 帮助信息的话可能的用经纬度查询
    // 现在默认是查询所有返回，使用第一个
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "getActiveEvents",
      },
      success: (res) => {
        console.log("获取的用户上传信息:", res);
        const { data } = res.result;
        const getMarkers = data?.map((item, index) => {
          return {
            id: index,
            latitude: item.location?.latitude,
            longitude: item.location?.longitude,
            title: "我需要帮助",
            iconPath:
              "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><polygon points='24,8 29,20 42,20 32,28 36,40 24,32 12,40 16,28 6,20 19,20' fill='%23ff9900'/></svg>",
            width: 40,
            height: 40,
          };
        });

        this.setData({
          markers: [...getMarkers],
        });

        console.log(11111);

        // this.formatData(res);
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      },
    });

    wx.hideLoading();
  },

  setMarkers(type) {
    const lat = this.data.latitude;
    const lng = this.data.longitude;
    let markers = [];
    if (type === "help") {
      this.getPointInfo();
      return;
    } else if (type === "hospital") {
      const iconPath =
        "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><rect x='20' y='8' width='8' height='32' fill='%23e60012'/><rect x='8' y='20' width='32' height='8' fill='%23e60012'/></svg>";
      const keyword = "医院";
      this.getData(keyword, iconPath);
    } else if (type === "aed") {
      const iconPath =
        "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><circle cx='24' cy='24' r='20' fill='%2300C37D'/></svg>";
      const keyword = "AED";
      this.getData(keyword, iconPath);
    } else if (type === "shelter") {
      const iconPath =
        "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><polygon points='24,8 44,40 4,40' fill='%232a6ae9'/></svg>";
      const keyword = "避难所";
      this.getData(keyword, iconPath);
    }
    this.setData({ markers });
  },

  onTab(e) {
    const page = e.currentTarget.dataset.page;
    if (page === "chat") {
      // 假设有全局变量判断是否有事件
      if (!getApp().globalData.hasEvent) {
        wx.showModal({
          title: "提示",
          content:
            "当前无发布求助事件或无正在参与的帮助事件，快看看周围是否有人需要帮助吧！",
          showCancel: false,
        });
        return;
      }
    }
    wx.navigateTo({ url: `/pages/${page}/${page}` });
  },

  sendMsgTohelper() {
    /**
     * grant_type: "client_credential",
        appid: "wx5cf87678079c02a6",
        secret: "d2bfe18629354620c89215166d755fa4",
     */
    wx.cloud.callFunction({
      name: "subscribe",
      data: {
        type: "sendMsg",
      },
      success: (res) => {
        debugger;
        console.log(res);
      },
      fail: (res) => {
        debugger;
      }
    });
  },

  getActiveEventByUser() {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "getActiveEventsByUser",
      },
      success: (res) => {
        const { data } = res.result;
        if (data.length !== 0) {
          this.setData({
            hasEvent: true,
          });
          wx.showModal({
            title: "提示",
            content: "您有发布的帮助信息还未结束",
          });
        }
        if (!this.data.hasEvent) {
          wx.navigateTo({
            url: "/pages/help/help",
          });
        }
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      },
    });
  },

  // 推送消息
  getTemplateMsg() {
    debugger;
    wx.cloud.callFunction({
      name: "subscribe",
      data: {
        type: "testSub",
      },
      success: (res) => {
        console.log(res);
      },
      fail: (res) => {
        debugger;
        console.log(res);
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

  onHelp() {
    this.getActiveEventByUser();
  },

  onHelpTouchStart() {
    this.setData({
      touchStartTime: Date.now(),
      isLongPress: false,
    });

    if (this.data.helpBtnTimer) {
      clearInterval(this.data.helpBtnTimer);
    }

    this.setData({
      helpBtnPressing: true,
      helpBtnProgress: 0,
    });

    let progress = 0;
    const timer = setInterval(() => {
      progress += 2;
      if (progress > 100) {
        clearInterval(timer);
        this.setData({
          helpBtnTimer: null,
          helpBtnPressing: false,
          helpBtnProgress: 0,
        });
        return;
      }

      this.setData({ helpBtnProgress: progress });

      if (progress >= 100) {
        clearInterval(timer);
        this.setData({
          helpBtnTimer: null,
          helpBtnPressing: false,
          isLongPress: true,
        });

        wx.showModal({
          title: "紧急呼救确认",
          content: "您正在选择进行紧急呼救，请问是否确认？",
          confirmText: "确认",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              wx.showToast({
                title: "已发送呼救",
                icon: "success",
              });
              setTimeout(() => {
                wx.navigateTo({
                  url: "/pages/chat/chat",
                  fail: (err) => {
                    console.error("导航失败：", err);
                    wx.showToast({
                      title: "页面跳转失败",
                      icon: "none",
                    });
                  },
                });
              }, 800);
            }
          },
        });
      }
    }, 50);

    this.setData({ helpBtnTimer: timer });
  },
  onHelpTouchEnd() {
    const touchDuration = Date.now() - this.data.touchStartTime;

    if (touchDuration >= 2000) {
      this.setData({ isLongPress: true });
    }

    if (this.data.helpBtnTimer) {
      clearInterval(this.data.helpBtnTimer);
      this.setData({
        helpBtnTimer: null,
        helpBtnPressing: false,
        helpBtnProgress: 0,
      });
    }
  },
  onShowHospitals() {
    wx.showToast({
      title: "展示附近医院",
      icon: "none",
    });
  },
  onShowAEDs() {
    wx.showToast({
      title: "展示附近AED",
      icon: "none",
    });
  },
  onRegister() {
    wx.navigateTo({
      url: "/pages/register/register",
    });
  },
  onTabChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ poiType: type });
    this.setMarkers(type);
  },
  // 测试数据库连接
  async testDBConnection() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection("users").limit(1).get();
      console.log("数据库连接成功", res);
      return true;
    } catch (err) {
      console.error("数据库连接失败：", err);
      return false;
    }
  },
});
