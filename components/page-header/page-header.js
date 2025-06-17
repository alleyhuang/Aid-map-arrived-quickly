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
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      });
    }
  }
}) 