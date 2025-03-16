import Request from '@/utils/request'

const BASE_URL = 'https://jsonplaceholder.typicode.com'

// 用户相关API
export const getUsers = () => {
  return Request.get(`${BASE_URL}/users`)
}

export const getUser = (id) => {
  return Request.get(`${BASE_URL}/users/${id}`)
}

// 记账相关API (使用todos作为记账条目)
export const getBills = (userId) => {
  return Request.get(`${BASE_URL}/todos`, { userId })
}

export const getBill = (id) => {
  return Request.get(`${BASE_URL}/todos/${id}`)
}

export const addBill = (data) => {
  return Request.post(`${BASE_URL}/todos`, data)
}

export const updateBill = (id, data) => {
  return Request.put(`${BASE_URL}/todos/${id}`, data)
}

export const deleteBill = (id) => {
  return Request.delete(`${BASE_URL}/todos/${id}`)
}

// 记账详情API (使用posts作为详情)
export const getBillDetails = (userId) => {
  return Request.get(`${BASE_URL}/posts`, { userId })
}

export const getBillDetail = (id) => {
  return Request.get(`${BASE_URL}/posts/${id}`)
}

export const addBillDetail = (data) => {
  return Request.post(`${BASE_URL}/posts`, data)
}

// 记账备注API (使用comments作为备注)
export const getBillComments = (postId) => {
  return Request.get(`${BASE_URL}/comments`, { postId })
}

export const addBillComment = (data) => {
  return Request.post(`${BASE_URL}/comments`, data)
} 