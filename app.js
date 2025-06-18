// app.js
App({
    onLaunch: function() {
      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      } else {
        wx.cloud.init({
          env: 'cloud1-0gqaia6j7d5e2f00', // 使用你的云环境ID
          traceUser: true,
        })
        // 初始化数据库
        this.globalData.db = wx.cloud.database()
      }

      // 获取用户openid
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          this.globalData.openid = res.result.openid
          // 检查用户是否已存在
          this.checkUserExists()
        },
        fail: err => {
          console.error('获取openid失败：', err)
        }
      })
    },

    // 检查用户是否存在，不存在则创建
    async checkUserExists() {
      try {
        const db = this.globalData.db
        // 使用where查询替代doc查询
        const userResult = await db.collection('users')
          .where({
            openid: this.globalData.openid
          })
          .get()
        
        if (userResult.data.length === 0) {
          // 用户不存在，创建新用户
          await db.collection('users').add({
            data: {
              openid: this.globalData.openid,
              status: '在线',
              createTime: new Date(),
              lastActiveTime: new Date()
            }
          })
          console.log('新用户创建成功')
        } else {
          console.log('用户已存在')
        }
      } catch (error) {
        console.error('检查用户失败：', error)
      }
    },

    globalData: {
      openid: '', // 用户openid
      db: null, // 数据库实例
      userInfo: null // 用户信息
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
