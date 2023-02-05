import { getMusicBanner, getSongMenuList } from "../../services/music"
import recommendStore from "../../store/recommendStore"
import rankingStore from "../../store/rankingStore"
import querySelect from "../../utils/query-select"
// import throttle from "../../utils/throttle"
import { throttle } from "underscore"
import playerStore from "../../store/playerStore"
// 轮播图节流
const querySelectThrottle = throttle(querySelect, 100)
const app = getApp()

// pages/main-music/main-music.js
Page({
  data: {
    searchValue: "",
    banners: [],
    bannerHeight: 0,
    screenWidth: 375,
    // 推荐歌曲
    recommendSongs: [],
    // 热门歌单
    hotMenuList: [],
    recMenuList: [],
    // 排行榜
    isRankingData: false,
    rankingInfos: []
  },
  onLoad() {
    this.fetchMusicBanner()
    this.fetchSongMenuList()
    // this.fetchRecommendList()
    // 数据共享  监听数据变化
    recommendStore.onState("recommendInfo", this.handleRecommendSongs)
    // 发起网络请求
    recommendStore.dispatch("fetchRecommendAction")
    rankingStore.onState("newRanking", this.handleNewRanking)
    rankingStore.onState("originRanking", this.handleOriginRanking)
    rankingStore.onState("upRanking", this.handleUpRanking)
    rankingStore.dispatch("fetchRankingAction")

    // 获取设备信息
    this.setData({ screenWidth: app.globalData.screenWidth })
  },

  // 网络请求方法封装
  async fetchMusicBanner() {
    const res = await getMusicBanner()
    this.setData({ banners: res.banners })
  },
  // async fetchRecommendList() {
  //   const res = await getPlayListDetail(3778678)
  //   const playlist = res.playlist
  //   const recommendList = playlist.tracks.splice(0, 6)
  //   this.setData({ recommendList })
  // },
  async fetchSongMenuList() {
    getSongMenuList().then(res => {
      this.setData({ hotMenuList: res.playlists })
    }),
    getSongMenuList("华语").then(res => {
      this.setData({ recMenuList: res.playlists })
    })
  },

  // ============ 界面事件的监听方法 ============ 
  onSearchClick() {
    wx.navigateTo({url: '/pages/detail-search/detail-search'})
  },
  onBannerImageLoad() {
    querySelectThrottle(".banner-image").then(res => {
      this.setData({ bannerHeight: res[0].height })
    })
  },
  onMoreClick() {
    wx.navigateTo({
      url: '/pages/detail-song/detail-song?type=recommend',
    })
  },
  onItemTap(event) {
    const index = event.currentTarget.dataset.index
    playerStore.setState("playSongList", this.data.recommendSongs)
    playerStore.setState("playSongIndex", index)
  },

  // ====================== 从Store中获取数据 ======================
  handleRecommendSongs(value) {
    // console.log(value);
    if (!value.tracks) return
    this.setData({ recommendSongs: value.tracks.slice(0, 6) })
  },
  
  handleNewRanking(value) {
    // console.log("新歌榜:", value);
    if (!value.name) return
    this.setData({ isRankingData: true })
    const newRankingInfos = { ...this.data.rankingInfos, newRanking: value }
    this.setData({ rankingInfos: newRankingInfos })
  },
  handleOriginRanking(value) {
    // console.log("原创榜:", value);
    if (!value.name) return
    this.setData({ isRankingData: true })
    const newRankingInfos = { ...this.data.rankingInfos, originRanking: value }
    this.setData({ rankingInfos: newRankingInfos })
  },
  handleUpRanking(value) {
    // console.log("飙升榜:", value);
    if (!value.name) return
    this.setData({ isRankingData: true })
    const newRankingInfos = { ...this.data.rankingInfos, upRanking: value }
    this.setData({ rankingInfos: newRankingInfos })
  },

  onUnload() {
    recommendStore.offState("recommendSongs", this.handleRecommendSongs)
    rankingStore.offState("newRanking", this.handleNewRanking)
    rankingStore.offState("originRanking", this.handleOriginRanking)
    rankingStore.offState("upRanking", this.handleUpRanking)
  }
})