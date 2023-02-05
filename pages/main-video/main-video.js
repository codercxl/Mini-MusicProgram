import { getTopMv } from "../../services/video"

// pages/main-video/main-video.js
Page({
  data: {
    videoList: [],
    offset: 0,
    hasMore: true
  },
  onLoad() {
    // 发送网络请求
    this.fetchTopMv()
  },

  // 发送网络请求方法
  async fetchTopMv() {
    // getTopMv().then(res => {
    //   this.setData({videoList: res.data})
    // })
    // 1.获取数据
    const res = await getTopMv(this.data.offset) // 可传参数：limit offset
    // 2.将新的数据追加到原来数据的后面
    const newVideoList = [...this.data.videoList, ...res.data]
    // 3.设置全新的数据
    this.setData({videoList: newVideoList})
    this.data.offset = this.data.videoList.length
    this.data.hasMore = res.hasMore

  },

  // 监听上拉/下拉加载更多
  onReachBottom() {
    // 1.判断是否有更多的数据
    if (!this.data.hasMore) return
    // 2.若有则请求新数据
    this.fetchTopMv()
  },
  async onPullDownRefresh() {
    // 1.清空之前的数据
    this.setData({ videoList: [] })
    this.data.offset =  0
    this.data.hasMore = true

    // 2.重新请求新的数据 (await请求完成后执行下一行)
    await this.fetchTopMv()

    // 3.请求成功停止下拉刷新
    wx.stopPullDownRefresh()
  },

  // 界面事件监听方法
  onVideoTap(event) {
    // 跳转方式一 监听video-item组件点击
    // const item = event.currentTarget.dataset.item
    // wx.navigateTo({
    //   url: `/pages/detail-video/detail-video?id=${item.id}`,
    // })
    // 方式二：video-item组件内 
  }
})