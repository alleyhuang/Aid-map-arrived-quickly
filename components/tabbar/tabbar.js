Component({
  properties: {
    active: String,
  },
  methods: {
    onTab(e) {
      const page = e.currentTarget.dataset.page;

      if (page === "chat") {
        wx.cloud.callFunction({
          name: "login",
          data: {
            type: "getActiveEventsByUser",
          },
          success: (res) => {
            const { data } = res.result;
            if (data.length === 0) {
              wx.showModal({
                title: "提示",
                content:
                  "当前无发布求助事件或无正在参与的帮助事件，快看看周围是否有人需要帮助吧！",
                showCancel: false,
              });
              return;
            }
            this.toActiveEvent();
          },
          fail: (err) => {
            console.error("调用云函数失败:", err);
          },
        });
      } else if (page === "index" || page === "profile") {
        wx.reLaunch({ url: `/pages/${page}/${page}` });
      }
    },

    toActiveEvent() {
      wx.navigateTo({ url: `/pages/help-detail/index?active=true` });
    },
  },
});
