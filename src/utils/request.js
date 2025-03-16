export default {
  get(url, data = {}) {
    return new Promise((resolve, reject) => {
      uni.request({
        url,
        data,
        method: 'GET',
        success: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },
  post(url, data = {}) {
    return new Promise((resolve, reject) => {
      uni.request({
        url,
        data,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },
  put(url, data = {}) {
    return new Promise((resolve, reject) => {
      uni.request({
        url,
        data,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },
  delete(url) {
    return new Promise((resolve, reject) => {
      uni.request({
        url,
        method: 'DELETE',
        success: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
} 