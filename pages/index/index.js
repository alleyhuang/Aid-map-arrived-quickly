// index.js
Page({
  data: {
    latitude: 39.9928, // 默认北京奥林匹克公园
    longitude: 116.3975,
    markers: [
      {
        id: 1,
        latitude: 39.9928,
        longitude: 116.3975,
        title: '奥运村消防救援站',
        iconPath: '/resources/fire.png',
        width: 32,
        height: 32
      },
      {
        id: 2,
        latitude: 39.9938,
        longitude: 116.4015,
        title: 'AED（奥林匹克森林公园南园）',
        iconPath: '/resources/aed.png',
        width: 32,
        height: 32
      },
      {
        id: 3,
        latitude: 39.9918,
        longitude: 116.3995,
        title: '北京市第一中西医结合医院',
        iconPath: '/resources/hospital.png',
        width: 32,
        height: 32
      }
    ]
  },
  onLoad() {
    // 获取当前位置
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      }
    });
  },
  onHelp() {
    wx.showToast({
      title: '已发出求助',
      icon: 'success'
    });
  },
  onShowHospitals() {
    wx.showToast({
      title: '展示附近医院',
      icon: 'none'
    });
  },
  onShowAEDs() {
    wx.showToast({
      title: '展示附近AED',
      icon: 'none'
    });
  },
  onRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
});
