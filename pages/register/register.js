Page({
  data: {
    regType: 'pro', // 'pro' or 'help'
    proTypes: ['医疗急救类', '消防救援类', '工程技术类', '灾害应对类', '心理援助类', '其他'],
    helpTypes: ['交通运输类', '物资供给类', '其他'],
    selectedProType: 0,
    selectedHelpType: 0,
    showProOther: false,
    showHelpOther: false,
    range: 5,
    shareLocation: false,
    agree: false
  },
  onSelectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ regType: type });
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
        wx.showToast({ title: '已选择: ' + res.name, icon: 'none' });
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
  onSubmit(e) {
    if (!this.data.agree) {
      wx.showToast({ title: '请同意协议', icon: 'none' });
      return;
    }
    wx.showToast({ title: '注册成功', icon: 'success' });
    // 这里可提交表单数据到后台
  }
}); 