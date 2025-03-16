import { getUser, getUsers } from '@/api/index'
import { saveUserInfo, getUserInfo, clearUserInfo } from '@/utils/storage'

const state = {
  currentUser: getUserInfo(),
  users: []
}

const mutations = {
  SET_CURRENT_USER(state, user) {
    state.currentUser = user
    saveUserInfo(user)
  },
  SET_USERS(state, users) {
    state.users = users
  },
  CLEAR_USER(state) {
    state.currentUser = null
    clearUserInfo()
  }
}

const actions = {
  // 获取所有用户
  async getUsers({ commit }) {
    try {
      const users = await getUsers()
      commit('SET_USERS', users)
      return users
    } catch (error) {
      console.error('获取用户列表失败:', error)
      return []
    }
  },
  
  // 获取单个用户
  async getUser({ commit }, userId) {
    try {
      const user = await getUser(userId)
      return user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  },
  
  // 登录
  async login({ commit, dispatch }, { username, password }) {
    try {
      // 由于JSONPlaceholder没有真正的登录API，这里模拟登录过程
      // 获取所有用户
      const users = await dispatch('getUsers')
      // 查找匹配的用户 (这里简单地用username当作id)
      const user = users.find(u => u.username === username)
      
      if (user) {
        // 模拟登录成功
        commit('SET_CURRENT_USER', user)
        return { success: true, user }
      } else {
        // 模拟登录失败
        return { success: false, message: '用户名或密码错误' }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: '登录失败，请稍后再试' }
    }
  },
  
  // 退出登录
  logout({ commit }) {
    commit('CLEAR_USER')
    return { success: true }
  }
}

const getters = {
  isLoggedIn: state => !!state.currentUser,
  currentUser: state => state.currentUser || {}
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 