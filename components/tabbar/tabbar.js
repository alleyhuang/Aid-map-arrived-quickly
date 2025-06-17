Component({
  properties: {
    active: String
  },
  methods: {
    onTab(e) {
      const page = e.currentTarget.dataset.page;
      const app = getApp();
      const hasEvent = app.globalData && typeof app.globalData.hasEvent !== 'undefined' ? app.globalData.hasEvent : false;
      
      if (page === 'chat') {
        if (!hasEvent) {
          wx.showModal({
            title: '提示',
            content: '当前无发布求助事件或无正在参与的帮助事件，快看看周围是否有人需要帮助吧！',
            showCancel: false
          });
          return;
        }
        wx.navigateTo({ url: `/pages/chat/chat` });
      } else if (page === 'index' || page === 'profile') {
        wx.reLaunch({ url: `/pages/${page}/${page}` });
      }
    }
  }
}); 