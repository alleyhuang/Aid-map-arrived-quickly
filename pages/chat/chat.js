const app = getApp()

Page({
  data: {
    messages: [],
    inputValue: '',
    helpRequestId: null, // 关联的求助ID
    helpRequest: null,   // 求助请求信息
    announcement: '该求助为紧急呼救，无更多信息，若有，求助者可在此沟通页面补充信息。'
  },

  onLoad(options) {
    if (options.helpRequestId) {
      this.setData({ helpRequestId: options.helpRequestId });
      this.loadHelpRequest();
    }
    
    if (options.type || options.desc) {
      let ann = '求助类型：' + (options.type || '紧急呼救');
      if (options.desc) ann += '，情况：' + options.desc;
      this.setData({ announcement: ann });
    }
    
    // 获取消息列表
    this.getMessages();
  },

  // 加载求助请求信息
  async loadHelpRequest() {
    try {
      const db = app.globalData.db;
      const result = await db.collection('help_requests')
        .doc(this.data.helpRequestId)
        .get();
      
      if (result.data) {
        this.setData({ helpRequest: result.data });
      }
    } catch (error) {
      console.error('获取求助信息失败：', error);
    }
  },

  // 获取消息列表
  async getMessages() {
    try {
      const db = app.globalData.db;
      const result = await db.collection('messages')
        .where({
          helpRequestId: this.data.helpRequestId
        })
        .orderBy('createTime', 'asc')
        .limit(50)
        .get();
      
      this.setData({
        messages: result.data
      });
    } catch (error) {
      console.error('获取消息失败：', error);
    }
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 发送消息
  async onSend() {
    if (!this.data.inputValue.trim()) return;

    try {
      const db = app.globalData.db;
      const messageData = {
        helpRequestId: this.data.helpRequestId,
        senderId: app.globalData.openid,
        content: this.data.inputValue,
        type: 'help',
        status: '正常',
        createTime: new Date()
      };

      await db.collection('messages').add({
        data: messageData
      });

      // 清空输入框
      this.setData({
        inputValue: ''
      });

      // 重新获取消息列表
      this.getMessages();
    } catch (error) {
      console.error('发送消息失败：', error);
      wx.showToast({
        title: '发送失败，请重试',
        icon: 'error'
      });
    }
  }
}); 