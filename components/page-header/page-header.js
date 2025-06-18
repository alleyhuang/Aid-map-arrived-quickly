Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    subtitle: {
      type: String,
      value: ''
    }
  },

  data: {
    statusBarHeight: 0
  },

  lifetimes: {
    attached() {
      const windowInfo = wx.getWindowInfo();
      this.setData({
        statusBarHeight: windowInfo.statusBarHeight
      });
    }
  }
}) 