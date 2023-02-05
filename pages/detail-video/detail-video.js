import { getMvUrl, getMvInfo, getMvRelated } from "../../services/video"

// pages/detail-video/detail-video.js
Page({
  data: {
    id: 0,
    mvUrl: "",
    mvInfo: {},
    relatedVideo: [],
    danmuList: [
      { text: "hahaha", color: "#ff0000", time: 3 },
      { text: "太棒了", color: "#ff00ff", time: 10 },
      { text: "嘿嘿嘿", color: "#ffff00", time: 15 },
    ]
  },
  onLoad(options) {
    // 1.获取id
    const id = options.id
    this.setData({ id })
    // 2.请求数据
    this.fetchMvUrl()
    this.fetchMvInfo()
    this.fetchMvRelated()
  },

  async fetchMvUrl() {
    const res = await getMvUrl(this.data.id)
    this.setData({ mvUrl: res.data.url })
  },
  async fetchMvInfo() {
    const res = await getMvInfo(this.data.id)
    this.setData({ mvInfo: res.data })
  }, 
  async fetchMvRelated() {
    const res = await getMvRelated(this.data.id)
    this.setData({ relatedVideo: res.data })
  } 
})