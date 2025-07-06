// pages/help-history/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    eventList: [],
    isPress: -1,
  },

  onLoad() {
    wx.showLoading({
      title: "加载中",
    });
    // 获取用户上传数据
    this.getHelpHistory();
  },

  onShow() {
    this.getHelpHistory();
  },

  getHelpHistory() {
    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "getEventByOpenId",
      },
      success: (res) => {
        console.log("获取的用户帮助信息:", res);
        const { data } = res.result;
        this.setData({
          eventList: data,
          info: JSON.stringify(data, null, 2),
        });
        wx.hideLoading();
        // this.formatData(res);
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      },
    });
  },

  touchEnd() {
    this.setData({
      isPress: -1,
    });
  },

  touchStart(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      isPress: index,
    });
  },

  toDetail(event) {
    const help = event.currentTarget.dataset.help;
    wx.navigateTo({
      url: `../help-detail/index?help=${JSON.stringify(help)}`,
    });
  },

  formatData(res) {
    return res;
  },
});
