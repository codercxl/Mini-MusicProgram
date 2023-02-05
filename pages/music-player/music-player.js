// pages/music-player/music-player.js
import { getSongDetail, getSongLyric } from "../../services/player"
import { parseLyric } from "../../utils/parse-lyric"
import { throttle } from "underscore"
import playerStore from "../../store/playerStore"

const app = getApp()
// 创建播放器
const audioContext = wx.createInnerAudioContext()

const modeNames = ["order", "repeat", "random"]

Page({
  data: {
    id: -1,
    currentSong: {},
    currentTime: 0,
    durationTime: 0,
    lyricInfos: [],
    currentLyricText: "",
    currentLyricIndex: -1,

    isPlaying: true,

    playSongList: [],
    playSongIndex: 0,
    isFirstPlay: true,

    playModeIndex: 0, // 0:顺序播放 1:循环播放 2:随机播放
    playModeName: "order",

    NavTitles: ["歌曲", "歌词"],
    currentPage: 0,
    contentHeight: 0,

    sliderValue: 0,
    isSliderChanging: false,
    isWaiting: false,

    lyricScrollTop: 0
  },

  onLoad(options) {
    // 0.获取content高度
    this.setData({ contentHeight: app.globalData.contentHeight })

    // 1.获取传入的id
    const id = options.id
    this.setupPlaySong(id)

    // 5.获取Store中的共享数据
    playerStore.onStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
  }, 

  // ===================== 播放歌曲逻辑 =======================
  setupPlaySong(id) {
    this.setData({ id })

    // 2.发送网络请求
    // 2.1 根据id获取歌曲的详情
    getSongDetail(id).then(res => {
      this.setData({ currentSong: res.songs[0] })
      this.setData({ durationTime: res.songs[0].dt })
    })

    // 2.2 根据id获取歌曲的歌词
    getSongLyric(id).then(res => {
      const lrcString = res.lrc.lyric
      const lyricInfos = parseLyric(lrcString)
      this.setData({ lyricInfos })
    })

    // 3.播放当前歌曲
    audioContext.stop()
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    audioContext.autoplay = true
    

    // 4.监听播放进度
    if (this.data.isFirstPlay) {
      this.data.isFirstPlay = false
      const throttleProgress = throttle(this.throttleProgress, 500, { 
        leading: false,
        trailing: false 
      })
      audioContext.onTimeUpdate(() => {
        // 1.更新歌曲进度条
        if (!this.data.isSliderChanging && !this.data.isWaiting) {
          throttleProgress()
        }
  
        // 2.匹配对应歌词
        if (!this.data.lyricInfos.length) return
        let index = this.data.lyricInfos.length - 1
        for (let i = 0; i < this.data.lyricInfos.length; i++) {
          const info = this.data.lyricInfos[i]
          if (info.time > audioContext.currentTime * 1000) {
            index = i - 1
            break
          }
        }
        if (index === this.data.currentLyricIndex) return
        const currentLyricText = this.data.lyricInfos[index].text
        this.setData({ 
          currentLyricText, 
          currentLyricIndex: index,
          lyricScrollTop: index * 35
        })
        // console.log(index, this.data.lyricInfos[index].text);
      })
      // 解决点击滑块不再监听进度的问题
      audioContext.onWaiting(() => {
        audioContext.pause()
      })
      audioContext.onCanplay(() => {
        audioContext.play()
      })
      // 自动播放下一首
      audioContext.onEnded(() => {
        // 若是单曲循环 不要切换
        if (audioContext.loop) return
        // 切换下一首
        this.changeNewSong()
      })
    }
  },

  throttleProgress() {
    // 1.记录当前播放时间 毫秒 = 秒 * 1000
    // 2.修改进度条sliderValue  百分比
    const sliderValue = this.data.currentTime / this.data.durationTime * 100
    this.setData({ 
      currentTime: audioContext.currentTime * 1000,
      sliderValue
    })
  },
  // ============= 获取store数据 =============
  getPlaySongInfosHandler({ playSongList, playSongIndex }) {
    if (playSongList) {
      this.setData({ playSongList })
    }
    if (playSongIndex !== undefined) {
      this.setData({ playSongIndex })
    }
  },

  onUnload() {
    playerStore.offStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
  },

  // ============= 事件监听 ============= 
  onSwiperChange(event) {
    this.setData({ currentPage: event.detail.current })
  },

  onNavTap(event) {
    const index = event.currentTarget.dataset.index
    this.setData({ currentPage: index })
  },

  onSliderChange(event) {
    this.data.isWaiting = true
    setTimeout(() => {
      this.data.isWaiting = false
    }, 1500)
    // 1.获取点击滑块时的位置对应值
    const value = event.detail.value

    // 2.计算出要播放的位置时间 毫秒
    const currentTime = value / 100 * this.data.durationTime

    // 3.设置播放器 播放计算出的时间 秒
    audioContext.seek(currentTime / 1000)
    this.setData({ currentTime, isSliderChanging: false, sliderValue: value })

    this.setData({ isPlaying: true })
  },

  onSliderChanging: throttle(function(event) {
    // 1.获取滑动滑块时的位置对应值
    const value = event.detail.value

    // 2.根据当前值计算出播放时间
    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime })

    // 3.当前正在滑动
    this.setData({ isSliderChanging: true })
  }, 100),

  onPlayTap() {
    if (this.data.isPlaying) {
      audioContext.pause()
      this.setData({ isPlaying: false })
    } else {
      audioContext.play()
      this.setData({ isPlaying: true })
    }
  },

  onPrevBtnTap() {
    this.changeNewSong(false)
    this.setData({ isPlaying: true })
  },

  onNextBtnTap() {
    this.changeNewSong()
    this.setData({ isPlaying: true })
  },

  changeNewSong(isNext = true) {
    // 1.获取正在播放歌曲的索引
    const length = this.data.playSongList.length
    let index = this.data.playSongIndex

    // 2.根据之前索引计算下一首索引
    switch (this.data.playModeIndex) {
      case 1:
      case 0: // 顺序播放
        index = isNext ? index + 1 : index - 1
        if (index === length) index = 0
        if (index === -1) index = length - 1
        break
      // case 1: // 循环播放
      //   break
      case 2: // 随机播放
        index = Math.floor(Math.random() * length)
        break
    } 

    // 3.根据新的索引获取下一首歌曲信息
    const newSong = this.data.playSongList[index]
    // console.log(newSong.id);
    // 将数据初始化
    this.setData({ currentSong: {}, sliderValue: 0, currentTime: 0, durationTime: 0 })
    this.setupPlaySong(newSong.id)

    // 4.保存最新的索引值
    playerStore.setState("playSongIndex", index)
  },

  onModeBtnTap() {
    // 1.播放模式的切换
    let index = this.data.playModeIndex
    index = index + 1
    if (index === 3) index = 0

    // 是否循环播放
    if (index === 1) {
      audioContext.loop = true
    } else {
      audioContext.loop = false
    }
    // 2.保存当前模式
    this.setData({ playModeIndex: index, playModeName: modeNames[index] })
  },

  onBackClick() {
    wx.navigateBack()
  }
})