// pages/profile/profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeightRpx: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeightRpx: systemInfo.statusBarHeight * 2,
    });
  },

  toHistory() {
    wx.navigateTo({
      url: "/pages/help-history/index",
    });
  },

  toDeclaration() {
    wx.navigateTo({
      url: "/pages/declaration/index",
    });
  },

  toProfile() {
    wx.navigateTo({
      url: "../my-info-list/index",
    });
  },
});
