import { hyRequest } from "./index";

export function getTopMv(offset = 0, limit = 20) {
  return hyRequest.get({
    url: '/top/mv',
    data: {
      limit,
      offset
    }
  })
}

export function getMvUrl(id) {
  return hyRequest.get({
    url: '/mv/url',
    data: {
      id
    }
  })
}

export function getMvInfo(mvid) {
  return hyRequest.get({
    url: '/mv/detail',
    data: {
      mvid
    }
  })
}

export function getMvRelated(id) {
  return hyRequest.get({
    url: '/related/allvideo',
    data: {
      id
    }
  })
}