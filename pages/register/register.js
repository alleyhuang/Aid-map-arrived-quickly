const app = getApp()

Page({
  data: {
    proTypes: ['医疗急救类', '消防救援类', '工程技术类', '灾害应对类', '心理援助类', '其他'],
    helpTypes: ['交通运输类', '物资供给类', '其他'],
    selectedProType: 0,
    selectedHelpType: 0,
    showProOther: false,
    showHelpOther: false,
    range: 5,
    shareLocation: false,
    agree: false,
    location: null,
    statusBarHeight: 0,
    regType: 'helper'
  },

  onLoad() {
    this.setData({
      statusBarHeight: wx.getSystemInfoSync().statusBarHeight
    });
  },

  onSelectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      regType: type
    });
  },

  onSelectProType(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({ selectedProType: idx });
    if (this.data.proTypes[idx] === '其他') {
      this.setData({ showProOther: true });
    } else {
      this.setData({ showProOther: false });
    }
  },

  onSelectHelpType(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({ selectedHelpType: idx });
    if (this.data.helpTypes[idx] === '其他') {
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
            address: res.address
          }
        })
        wx.showToast({ 
          title: '已选择: ' + res.name, 
          icon: 'none' 
        })
      }
    });
  },

  onRequestLocationAuth() {
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        wx.showToast({ title: '授权成功', icon: 'success' });
        this.onChooseLocation();
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    });
  },

  onUploadCert() {
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      success: (res) => {
        wx.showToast({ title: '已上传', icon: 'success' });
      }
    });
  },

  async onSubmit(e) {
    if (!this.data.agree) {
      wx.showToast({ title: '请同意协议', icon: 'none' });
      return;
    }

    if (!this.data.location) {
      wx.showToast({ title: '请选择位置', icon: 'none' });
      return;
    }

    try {
      const db = app.globalData.db;
      const helperInfo = {
        isHelper: true,
        helpRange: this.data.range,
        helpType: this.data.proTypes[this.data.selectedProType],
        helpDetail: e.detail.value.helpDetail || '',
        certificates: [], // 后续可添加上传功能
        registerTime: new Date()
      };

      // 更新用户信息，添加帮助者信息
      await db.collection('users').doc(app.globalData.openid).update({
        data: {
          phone: e.detail.value.phone,
          location: this.data.location,
          helperInfo: helperInfo,
          lastActiveTime: new Date()
        }
      });

      wx.showToast({ 
        title: '注册成功', 
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    } catch (error) {
      console.error('注册失败：', error);
      wx.showToast({ 
        title: '注册失败，请重试', 
        icon: 'error' 
      });
    }
  }
}); 