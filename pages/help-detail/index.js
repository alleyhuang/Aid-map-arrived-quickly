Page({
  data: {
    eventInfo: {},
    isPress: false,
    openid: "",
  },

  onLoad(options) {
    this.getUserInfo();
    if (options.eventId) {
      console.log("eventId:", options.eventId);
      this.getEventByEventId(options.eventId);
      return;
    }

    if (options.active) {
      wx.showLoading({
        title: "加载中",
      });
      this.getActiveEventByUser();
      return;
    }

    if (options.addressinfo) {
      const addressinfo = JSON.parse(options.addressinfo);
      this.getDetailByll(addressinfo);
      return;
    }

    if (!options.help) {
      // 获取用户上传数据
      this.getPointInfo();
      return;
    }

    wx.showLoading({
      title: "加载中",
    });

    const eventData = JSON.parse(options.help);
    this.setData({
      eventInfo: eventData,
    });

    wx.hideLoading();
  },

  getEventByEventId(eventId) {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "getEventByEventId",
        eventId
      },
      success: (res) => {
        console.log("getEventByEventId", res);

        const { data } = res.result;
        const info = {
          ...data[0],
          eventNewId: data[0].eventId.slice(0, 28),
        };
        this.setData({
          eventInfo: info,
        });
        wx.hideLoading();
        return;
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      },
    });

    wx.hideLoading();
  },

  getActiveEventByUser() {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "getActiveEventsByUser",
      },
      success: (res) => {
        const { data } = res.result;
        const info = {
          ...data[0],
          eventNewId: data[0].eventId.slice(0, 28),
        };
        this.setData({
          eventInfo: info,
        });
        wx.hideLoading();
        return;
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      },
    });

    wx.hideLoading();
  },

  getDetailByll(addressinfo) {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "getDetailByll",
        data: addressinfo,
        database: "help_requests",
      },
      success: (res) => {
        console.log("获取的用户上传信息:", res);
        const { data } = res.result;
        const info = {
          ...data[0],
          eventNewId: data[0].eventId.slice(0, 28),
        };
        this.setData({
          eventInfo: info,
          info: JSON.stringify(data, null, 2),
        });
        // this.formatData(res);
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      },
    });
  },

  touchStart() {
    this.setData({
      isPress: true,
    });
  },

  touchEnd() {
    this.setData({
      isPress: false,
    });
  },

  contactHim() {
    wx.makePhoneCall({
      phoneNumber: this.data.eventInfo.phone,
    });
  },

  onCloseEvent() {
    wx.showModal({
      title: "确认关闭",
      content: "是否确认关闭该事件",
      success: (res) => {
        if (res.confirm) {
          this.closeEvent();
        }
      },
    });
  },

  closeEvent() {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "updateRecord",
        data: {
          ...this.data.eventInfo,
          resolve: true,
        },
        database: "help_requests",
      },
      success: (res) => {
        console.log("更新成功:", res);
        const { data } = res.result;
        this.setData({
          eventInfo: data,
        });
        // this.getPointInfo();
        // wx.navigateBack({
        //   delta: 1,
        // });
      },
      fail: (err) => {
        console.error("更新失败:", err);
      },
    });
  },

  getUserInfo() {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "getOpenId",
      },
      success: (res) => {
        console.log("获取用户信息成功:", res);
        const { openid } = res.result;
        this.setData({
          openid,
        });
      },
      fail: (err) => {
        console.error("获取用户信息失败:", err);
      },
    });
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
        type: "selectRecord",
      },
      success: (res) => {
        console.log("获取的用户上传信息:", res);
        const { data } = res.result;
        this.setData({
          eventInfo: data[0],
          // eventInfo: JSON.stringify(data[0], null, 2),
          info: JSON.stringify(data, null, 2),
        });
        // this.formatData(res);
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      },
    });

    wx.hideLoading();
  },

  // 处理数据
  formatData(data) {
    // 处理数据

    return data;
  },
});
