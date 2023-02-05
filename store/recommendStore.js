import { HYEventStore } from "hy-event-store"
import { getPlayListDetail } from "../services/music"

const recommendStore = new HYEventStore({
  state: {
    recommendInfo: {}
  },
  actions: {
    fetchRecommendAction(ctx) {
      getPlayListDetail(3778678).then(res => {
        ctx.recommendInfo = res.playlist
        // console.log(res.playlist.tracks);
      })
    }
  }
})

export default recommendStore