// app.js
App({
    onLaunch: function() {
      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      } else {
        wx.cloud.init({
          env: 'cloudbase-0gl4nb7m872c6379', // 使用你的云环境ID
          traceUser: true,
        })
      }
    },
    globalData: {
      openid: '', // 用户openid
      // 你可以在这里添加其他全局变量
    }
})

// 测试数据库连接
const testDB = async () => {
  try {
    const db = wx.cloud.database()
    // 测试查询用户
    const userResult = await db.collection('users').limit(1).get()
    console.log('用户数据：', userResult)
    
    // 测试查询POI
    const poiResult = await db.collection('map_pois').limit(1).get()
    console.log('POI数据：', poiResult)
    
    wx.showToast({
      title: '数据库连接成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('数据库连接失败：', error)
    wx.showToast({
      title: '数据库连接失败',
      icon: 'error'
    })
  }
}
