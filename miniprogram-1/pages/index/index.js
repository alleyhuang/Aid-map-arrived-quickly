// index.js
const app = getApp()

Page({
  data: {
    latitude: 39.9928,
    longitude: 116.3975,
    poiType: 'help',
    markers: [],
    scale: 13,
    locationAuthorized: false,
    helpBtnPressing: false,
    helpBtnProgress: 0,
    helpBtnTimer: null,
    touchStartTime: 0,
    isLongPress: false
  },
  onLoad() {
    this.authorizeLocation();
    this.testDBConnection().then(res => { console.log('数据库连接结果:', res); }).catch(err => { console.error('数据库连接错误:', err); });
  },
  authorizeLocation() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => { this.getUserLocation(); },
            fail: () => { wx.showToast({ title: '请授权定位', icon: 'none' }); }
          });
        } else {
          this.getUserLocation();
        }
      }
    });
  },
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          locationAuthorized: true
        });
        this.setMarkers(this.data.poiType);
      },
      fail: () => {
        wx.showToast({ title: '定位失败', icon: 'none' });
      }
    });
  },
  setMarkers(type) {
    const lat = this.data.latitude;
    const lng = this.data.longitude;
    let markers = [];
    if (type === 'help') {
      markers = [
        { id: 100, latitude: lat + 0.005, longitude: lng + 0.004, title: '求助者A', iconPath: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><polygon points='24,8 29,20 42,20 32,28 36,40 24,32 12,40 16,28 6,20 19,20' fill='%23ff9900'/></svg>", width: 40, height: 40 },
        { id: 101, latitude: lat - 0.006, longitude: lng - 0.003, title: '求助者B', iconPath: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><polygon points='24,8 29,20 42,20 32,28 36,40 24,32 12,40 16,28 6,20 19,20' fill='%23ff9900'/></svg>", width: 40, height: 40 }
      ];
      if (markers.length === 0) {
        markers = [{ id: 999, latitude: lat, longitude: lng, title: '我', iconPath: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><polygon points='24,8 29,20 42,20 32,28 36,40 24,32 12,40 16,28 6,20 19,20' fill='%23ff9900'/></svg>", width: 40, height: 40 }];
      }
    } else if (type === 'hospital') {
      markers = [
        { id: 1, latitude: lat + 0.01, longitude: lng + 0.01, title: '医院A', iconPath: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><rect x='20' y='8' width='8' height='32' fill='%23e60012'/><rect x='8' y='20' width='32' height='8' fill='%23e60012'/></svg>", width: 36, height: 36 },
        { id: 2, latitude: lat - 0.012, longitude: lng - 0.008, title: '医院B', iconPath: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><rect x='20' y='8' width='8' height='32' fill='%23e60012'/><rect x='8' y='20' width='32' height='8' fill='%23e60012'/></svg>", width: 36, height: 36 }
      ];
    } else if (type === 'aed') {
      markers = [
        { id: 3, latitude: lat + 0.008, longitude: lng - 0.01, title: 'AED设备1', iconPath: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><circle cx='24' cy='24' r='20' fill='%2300C37D'/></svg>", width: 36, height: 36 },
        { id: 4, latitude: lat - 0.01, longitude: lng + 0.012, title: 'AED设备2', iconPath: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><circle cx='24' cy='24' r='20' fill='%2300C37D'/></svg>", width: 36, height: 36 }
      ];
    } else if (type === 'shelter') {
      markers = [
        { id: 5, latitude: lat + 0.015, longitude: lng, title: '避难所A', iconPath: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><polygon points='24,8 44,40 4,40' fill='%232a6ae9'/></svg>", width: 36, height: 36 },
        { id: 6, latitude: lat - 0.015, longitude: lng, title: '避难所B', iconPath: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><polygon points='24,8 44,40 4,40' fill='%232a6ae9'/></svg>", width: 36, height: 36 }
      ];
    }
    this.setData({ markers });
  },
  onTab(e) {
    const page = e.currentTarget.dataset.page;
    if (page === 'chat') {
      // 假设有全局变量判断是否有事件
      if (!getApp().globalData.hasEvent) {
        wx.showModal({
          title: '提示',
          content: '当前无发布求助事件或无正在参与的帮助事件，快看看周围是否有人需要帮助吧！',
          showCancel: false
        });
        return;
      }
    }
    wx.navigateTo({ url: `/pages/${page}/${page}` });
  },
  onHelp() {
    if (this.data.isLongPress) {
      return;
    }
    
    wx.navigateTo({ 
      url: '/pages/help/help',
      fail: (err) => {
        console.error('导航失败：', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },
  onHelpTouchStart() {
    this.setData({
      touchStartTime: Date.now(),
      isLongPress: false
    });

    if (this.data.helpBtnTimer) {
      clearInterval(this.data.helpBtnTimer);
    }
    
    this.setData({ 
      helpBtnPressing: true, 
      helpBtnProgress: 0 
    });
    
    let progress = 0;
    const timer = setInterval(() => {
      progress += 2;
      if (progress > 100) {
        clearInterval(timer);
        this.setData({ 
          helpBtnTimer: null, 
          helpBtnPressing: false,
          helpBtnProgress: 0
        });
        return;
      }
      
      this.setData({ helpBtnProgress: progress });
      
      if (progress >= 100) {
        clearInterval(timer);
        this.setData({ 
          helpBtnTimer: null, 
          helpBtnPressing: false,
          isLongPress: true
        });
        
        wx.showModal({
          title: '紧急呼救确认',
          content: '您正在选择进行紧急呼救，请问是否确认？',
          confirmText: '确认',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              wx.showToast({ 
                title: '已发送呼救', 
                icon: 'success' 
              });
              setTimeout(() => {
                wx.navigateTo({ 
                  url: '/pages/chat/chat',
                  fail: (err) => {
                    console.error('导航失败：', err);
                    wx.showToast({
                      title: '页面跳转失败',
                      icon: 'none'
                    });
                  }
                });
              }, 800);
            }
          }
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
        helpBtnProgress: 0
      });
    }
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
  }
});
