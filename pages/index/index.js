// index.js
Page({
  data: {
    latitude: 39.9928, // 默认北京奥林匹克公园
    longitude: 116.3975,
    poiType: 'hospital',
    markers: []
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
        this.setMarkers('hospital');
      }
    });
  },
  setMarkers(type) {
    let markers = [];
    if (type === 'hospital') {
      markers = [
        { id: 1, latitude: 39.9928, longitude: 116.3975, title: '北京市第一医院', iconPath: '/resources/hospital.png', width: 36, height: 36 },
        { id: 2, latitude: 39.994, longitude: 116.398, title: '奥林匹克诊所', iconPath: '/resources/hospital.png', width: 36, height: 36 }
      ];
    } else if (type === 'aed') {
      markers = [
        { id: 3, latitude: 39.9935, longitude: 116.397, title: 'AED设备1', iconPath: '/resources/aed.png', width: 36, height: 36 },
        { id: 4, latitude: 39.991, longitude: 116.399, title: 'AED设备2', iconPath: '/resources/aed.png', width: 36, height: 36 }
      ];
    } else if (type === 'shelter') {
      markers = [
        { id: 5, latitude: 39.992, longitude: 116.396, title: '应急避难所A', iconPath: '/resources/shelter.png', width: 36, height: 36 },
        { id: 6, latitude: 39.995, longitude: 116.400, title: '应急避难所B', iconPath: '/resources/shelter.png', width: 36, height: 36 }
      ];
    }
    this.setData({ markers });
  },
  onTabChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ poiType: type });
    this.setMarkers(type);
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
