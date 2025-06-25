Page({
  data: {
    info: {},
  },

  onLoad(options) {
    const eventData = JSON.parse(decodeURIComponent(options.eventData));
    console.log("Received event data:", eventData);

    // 获取用户上传数据
    this.getPointInfo(options);
  },

  getPointInfo(options) {
    console.log("获取用户上传信息");

    wx.cloud.callFunction({
      name: "login",
      data: {
        type: "selectRecord",
        data: {
          pointId: options.pointId, // 假设通过 URL 参数传递 pointId
        },
      },
      success: (res) => {
        console.log("获取的用户上传信息:", res);
        const { data } = res.result;
        this.setData({
          info: JSON.stringify(data, null, 2),
        });
        this.formatData(res);
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      },
    });
  },

  // 处理数据
  formatData(data) {
    // 处理数据

    return data;
  },
});
