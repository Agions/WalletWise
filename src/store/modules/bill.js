import {
  getBills,
  getBill,
  addBill,
  updateBill,
  deleteBill,
  getBillDetails,
  getBillDetail,
  addBillDetail,
  getBillComments,
  addBillComment
} from '@/api/index'
import { saveBills, getBills as getStoredBills } from '@/utils/storage'
import {
  convertTodoToBill,
  generateDailyBills,
  calculateTotals,
  summarizeByCategory,
  summarizeByDate
} from '@/utils/dataAdapter'

const state = {
  bills: getStoredBills(),
  dailyBills: {},
  categoryBills: {},
  totals: { income: 0, expense: 0, balance: 0 }
}

const mutations = {
  SET_BILLS(state, bills) {
    state.bills = bills
    saveBills(bills)
  },
  ADD_BILL(state, bill) {
    state.bills.push(bill)
    saveBills(state.bills)
  },
  UPDATE_BILL(state, updatedBill) {
    const index = state.bills.findIndex(bill => bill.id === updatedBill.id)
    if (index !== -1) {
      state.bills.splice(index, 1, updatedBill)
      saveBills(state.bills)
    }
  },
  DELETE_BILL(state, billId) {
    state.bills = state.bills.filter(bill => bill.id !== billId)
    saveBills(state.bills)
  },
  SET_DAILY_BILLS(state, dailyBills) {
    state.dailyBills = dailyBills
  },
  SET_CATEGORY_BILLS(state, categoryBills) {
    state.categoryBills = categoryBills
  },
  SET_TOTALS(state, totals) {
    state.totals = totals
  }
}

const actions = {
  // 获取账单列表
  async fetchBills({ commit, rootGetters }) {
    try {
      const currentUser = rootGetters['user/currentUser']
      if (!currentUser || !currentUser.id) {
        throw new Error('用户未登录')
      }
      
      // 从JSONPlaceholder获取数据
      const todos = await getBills(currentUser.id)
      const posts = await getBillDetails(currentUser.id)
      
      // 获取所有评论 (由于JSONPlaceholder没有按用户过滤评论的API，这里获取所有)
      let comments = []
      if (posts && posts.length) {
        // 只获取前5个post的评论，避免请求过多
        const limitedPosts = posts.slice(0, 5)
        for (const post of limitedPosts) {
          const postComments = await getBillComments(post.id)
          comments = [...comments, ...postComments]
        }
      }
      
      // 转换为账单数据
      const bills = generateDailyBills(todos, posts, comments)
      
      // 保存到store
      commit('SET_BILLS', bills)
      
      // 计算汇总数据
      dispatch('calculateSummary')
      
      return bills
    } catch (error) {
      console.error('获取账单失败:', error)
      return []
    }
  },
  
  // 添加账单
  async addBill({ commit, rootGetters }, billData) {
    try {
      const currentUser = rootGetters['user/currentUser']
      if (!currentUser || !currentUser.id) {
        throw new Error('用户未登录')
      }
      
      // 构造待提交数据
      const todoData = {
        userId: currentUser.id,
        title: billData.title || `${billData.type}：${billData.amount}`,
        completed: billData.isSettled || false
      }
      
      // 提交到JSONPlaceholder
      const result = await addBill(todoData)
      
      // 如果有详情，添加详情
      let detail = null
      if (billData.detail) {
        const detailData = {
          userId: currentUser.id,
          id: result.id, // 使用相同ID，方便关联
          title: billData.title,
          body: billData.detail
        }
        detail = await addBillDetail(detailData)
      }
      
      // 转换为完整账单数据
      const newBill = {
        ...billData,
        id: result.id,
        userId: currentUser.id,
        detail
      }
      
      // 保存到store
      commit('ADD_BILL', newBill)
      
      // 重新计算汇总数据
      dispatch('calculateSummary')
      
      return newBill
    } catch (error) {
      console.error('添加账单失败:', error)
      return null
    }
  },
  
  // 更新账单
  async updateBill({ commit, dispatch }, { id, data }) {
    try {
      const result = await updateBill(id, data)
      commit('UPDATE_BILL', { ...data, id })
      dispatch('calculateSummary')
      return result
    } catch (error) {
      console.error('更新账单失败:', error)
      return null
    }
  },
  
  // 删除账单
  async deleteBillItem({ commit, dispatch }, id) {
    try {
      await deleteBill(id)
      commit('DELETE_BILL', id)
      dispatch('calculateSummary')
      return true
    } catch (error) {
      console.error('删除账单失败:', error)
      return false
    }
  },
  
  // 计算汇总数据
  calculateSummary({ commit, state }) {
    const bills = state.bills || []
    
    // 按日期汇总
    const dailyBills = summarizeByDate(bills)
    commit('SET_DAILY_BILLS', dailyBills)
    
    // 按分类汇总
    const categoryBills = summarizeByCategory(bills)
    commit('SET_CATEGORY_BILLS', categoryBills)
    
    // 计算总收支
    const totals = calculateTotals(bills)
    commit('SET_TOTALS', totals)
    
    return {
      dailyBills,
      categoryBills,
      totals
    }
  }
}

const getters = {
  // 获取所有账单
  allBills: state => state.bills || [],
  
  // 获取按日期分组的账单
  billsByDate: state => state.dailyBills || {},
  
  // 获取按分类分组的账单
  billsByCategory: state => state.categoryBills || {},
  
  // 获取收支统计
  billTotals: state => state.totals || { income: 0, expense: 0, balance: 0 },
  
  // 获取指定日期的账单
  getBillsByDate: state => date => {
    return (state.dailyBills[date] || { bills: [] }).bills
  },
  
  // 获取指定ID的账单
  getBillById: state => id => {
    return state.bills.find(bill => bill.id === id) || null
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 