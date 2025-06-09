Component({
  properties: {
    active: {
      type: String,
      value: 'index'
    }
  },
  methods: {
    onTab(e) {
      const page = e.currentTarget.dataset.page;
      if (page === 'index') {
        wx.reLaunch({url:'/pages/index/index'});
      } else if (page === 'profile') {
        wx.reLaunch({url:'/pages/profile/profile'});
      }
    }
  }
}); 