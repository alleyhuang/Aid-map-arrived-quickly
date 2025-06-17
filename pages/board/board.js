Page({
  data: {
    currentType: 'all',
    messages: [],
    messageContent: '',
    loading: false
  },

  onLoad() {
    this.loadMessages();
  },

  // 切换消息类型
  onTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    if (wx.vibrateShort) {
      wx.vibrateShort();
    }
    this.setData({
      currentType: type
    });
    this.loadMessages();
  },

  // 发送消息
  async onSendMessage() {
    if (!this.data.messageContent.trim()) {
      wx.showToast({
        title: '请输入消息内容',
        icon: 'none'
      });
      return;
    }

    if (wx.vibrateShort) {
      wx.vibrateShort();
    }

    try {
      const db = app.globalData.db;
      const messageData = {
        content: this.data.messageContent,
        type: this.data.currentType,
        _openid: app.globalData.openid,
        createTime: db.serverDate()
      };

      await db.collection('messages').add({
        data: messageData
      });

      this.setData({
        messageContent: ''
      });

      this.loadMessages();
    } catch (error) {
      console.error('发送消息失败：', error);
      wx.showToast({
        title: '发送失败，请重试',
        icon: 'error'
      });
    }
  },

  // 删除消息
  async onDeleteMessage(e) {
    const messageId = e.currentTarget.dataset.id;
    
    if (wx.vibrateShort) {
      wx.vibrateShort();
    }

    try {
      const db = app.globalData.db;
      await db.collection('messages').doc(messageId).remove();
      this.loadMessages();
    } catch (error) {
      console.error('删除消息失败：', error);
      wx.showToast({
        title: '删除失败，请重试',
        icon: 'error'
      });
    }
  },

  // 刷新消息
  onRefresh() {
    if (wx.vibrateShort) {
      wx.vibrateShort();
    }
    this.loadMessages();
  },

  // 加载消息
  async loadMessages() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const db = app.globalData.db;
      const query = db.collection('messages')
        .orderBy('createTime', 'desc')
        .limit(50);

      if (this.data.currentType !== 'all') {
        query.where({
          type: this.data.currentType
        });
      }

      const res = await query.get();
      this.setData({
        messages: res.data
      });
    } catch (error) {
      console.error('加载消息失败：', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
}); 