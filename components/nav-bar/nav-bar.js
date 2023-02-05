// components/nav-bar/nav-bar.js
const app = getApp()

Component({
  options: {
    multipleSlots: true
  },
  properties: {
    title: {
      type: String,
      value: "导航标题"
    }
  },
  data: {
    statusHeight: 20
  },
  lifetimes: {
    attached() {
      const statusHeight = app.globalData.statusHeight
      this.setData({ statusHeight })
    }
  },
  methods: {
    onLeftClick() {
      this.triggerEvent("leftclick")
    }
  }
})
