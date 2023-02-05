import { min } from "underscore"

// [01:41.156]逆着光行走 任风吹雨打
const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

export function parseLyric(lrcString) {
  const lyricInfos = []

  const lyricLines = lrcString.split("\n")
  for (const lineString of lyricLines) {
    const results = timeReg.exec(lineString)

    if (!results) continue
    const minute = results[1] * 60 * 1000
    const second = results[2] * 1000
    const mSecond = results[3].length === 2 ? results[3] * 10: results[3] * 1
    const time = minute + second + mSecond
    const text = lineString.replace(timeReg, "")
    if (text) {
      lyricInfos.push({ time, text })
    }
  }
  return lyricInfos
}