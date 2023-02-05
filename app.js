// app.js
App({
  // 全局共享数据
  globalData: {
    screenWidth: 375,
    screenHeight: 667,

    statusHeight: 20,

    contentHeight: 0
  },

  onLaunch() {
    // 1.获取设备信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.screenWidth = res.screenWidth
        this.globalData.screenHeight = res.screenHeight
        this.globalData.statusHeight = res.statusBarHeight
        this.globalData.contentHeight = res.screenHeight - res.statusBarHeight - 44
      }
    })
  }
})
