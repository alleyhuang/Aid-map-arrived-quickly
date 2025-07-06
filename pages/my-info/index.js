Page({
  data: {
    openid: "",
    userinfo: {},
  },

  onLoad: function () {
    // 获取用户信息
    this.getMyInfo();
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

  getMyInfo() {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "getRegisterInfo",
      },
      success: (res) => {
        console.log("获取的用户信息:", res);
        const { data } = res.result;
        this.setData({
          userData: JSON.stringify(data, null, 2),
          userInfo: data[0],
        });
      },
    });
  },
});
