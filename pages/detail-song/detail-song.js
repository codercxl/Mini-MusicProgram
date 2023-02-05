import rankingStore from "../../store/rankingStore";
import recommendStore from "../../store/recommendStore";
import { getPlayListDetail } from "../../services/music"
import playerStore from "../../store/playerStore";

// pages/detail-song/detail-song.js
Page({
  data: {
    type: "",
    key: "",
    id: "",

    songInfo: {}
  },

  onLoad(options) {
    // 1.确定获取数据的类型
    // type: ranking -> 榜单数据
    // type: recommend -> 推荐数据
    const type = options.type
    this.setData({ type })

    // 2.从Store中获取数据
    if (type === "ranking") {
      const key = options.key
      this.data.key = key
      rankingStore.onState(key, this.handleRanking)
    } else if (type === "recommend") {
      recommendStore.onState("recommendInfo", this.handleRanking)
    } else if (type === "menu") {
      const id = options.id
      this.data.id = id
      this.fetchMenuSongInfo()
    }
  },

  async fetchMenuSongInfo() {
    const res = await getPlayListDetail(this.data.id)
    this.setData({ songInfo: res.playlist })
  },

  // ================== store共享数据 ==================
  handleRanking(value) {
    this.setData({ songInfo: value })
    wx.setNavigationBarTitle({
      title: value.name,
    })
  },
  // ================== 事件监听 ==================
  onSongItemTap(event) {
    const index = event.currentTarget.dataset.index
    playerStore.setState("playSongList", this.data.songInfo.tracks)
    playerStore.setState("playSongIndex", index)
  },


  onUnload() {
    if (this.data.type === "ranking") {
      rankingStore.offState(this.data.key, this.handleRanking)
    } else if (this.data.type === "recommend") {
      recommendStore.offState("recommendInfo", this.handleRanking)
    }
  }
})