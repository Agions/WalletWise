import { saveBudget, getBudget } from '@/utils/storage'

const state = {
  budget: getBudget(),
  currentMonthExpense: 0
}

const mutations = {
  SET_BUDGET(state, budget) {
    state.budget = budget
    saveBudget(budget)
  },
  SET_MONTHLY_BUDGET(state, amount) {
    state.budget.monthly = amount
    saveBudget(state.budget)
  },
  SET_CATEGORY_BUDGET(state, { categoryId, amount }) {
    if (!state.budget.categories) {
      state.budget.categories = {}
    }
    state.budget.categories[categoryId] = amount
    saveBudget(state.budget)
  },
  DELETE_CATEGORY_BUDGET(state, categoryId) {
    if (state.budget.categories && state.budget.categories[categoryId]) {
      delete state.budget.categories[categoryId]
      saveBudget(state.budget)
    }
  },
  SET_CURRENT_MONTH_EXPENSE(state, amount) {
    state.currentMonthExpense = amount
  }
}

const actions = {
  // 获取预算数据
  fetchBudget({ commit }) {
    const budget = getBudget()
    commit('SET_BUDGET', budget)
    return budget
  },
  
  // 设置月度总预算
  setMonthlyBudget({ commit }, amount) {
    commit('SET_MONTHLY_BUDGET', amount)
    return { success: true }
  },
  
  // 设置分类预算
  setCategoryBudget({ commit }, { categoryId, amount }) {
    commit('SET_CATEGORY_BUDGET', { categoryId, amount })
    return { success: true }
  },
  
  // 删除分类预算
  deleteCategoryBudget({ commit }, categoryId) {
    commit('DELETE_CATEGORY_BUDGET', categoryId)
    return { success: true }
  },
  
  // 计算当月支出并更新
  calculateCurrentMonthExpense({ commit, rootGetters }) {
    const bills = rootGetters['bill/allBills']
    
    // 获取当前月份
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    
    // 筛选当月支出账单
    const currentMonthBills = bills.filter(bill => {
      if (bill.type !== '支出') return false
      
      const billDate = new Date(bill.date)
      return billDate.getMonth() + 1 === currentMonth && 
             billDate.getFullYear() === currentYear
    })
    
    // 计算总支出
    const totalExpense = currentMonthBills.reduce((sum, bill) => sum + bill.amount, 0)
    
    // 更新状态
    commit('SET_CURRENT_MONTH_EXPENSE', totalExpense)
    
    return totalExpense
  }
}

const getters = {
  // 获取月度总预算
  monthlyBudget: state => state.budget.monthly || 0,
  
  // 获取所有分类预算
  categoryBudgets: state => state.budget.categories || {},
  
  // 获取指定分类预算
  getCategoryBudget: state => categoryId => {
    return state.budget.categories?.[categoryId] || 0
  },
  
  // 获取当月总支出
  currentMonthExpense: state => state.currentMonthExpense,
  
  // 计算总预算剩余金额
  remainingBudget: state => state.budget.monthly - state.currentMonthExpense,
  
  // 计算总预算使用比例
  budgetUsagePercent: state => {
    if (!state.budget.monthly) return 0
    return Math.min(100, Math.round((state.currentMonthExpense / state.budget.monthly) * 100))
  },
  
  // 获取分类预算使用情况
  categoryBudgetUsage: (state, getters, rootState, rootGetters) => {
    const categoryBudgets = state.budget.categories || {}
    const bills = rootGetters['bill/allBills']
    
    // 获取当前月份
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    
    const result = {}
    
    // 计算每个分类的支出
    Object.keys(categoryBudgets).forEach(categoryId => {
      const budget = categoryBudgets[categoryId]
      
      // 筛选当月该分类的支出账单
      const categoryBills = bills.filter(bill => {
        if (bill.type !== '支出' || bill.categoryId != categoryId) return false
        
        const billDate = new Date(bill.date)
        return billDate.getMonth() + 1 === currentMonth && 
               billDate.getFullYear() === currentYear
      })
      
      // 计算分类总支出
      const spent = categoryBills.reduce((sum, bill) => sum + bill.amount, 0)
      
      result[categoryId] = {
        budget,
        spent,
        remaining: budget - spent,
        usagePercent: budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0
      }
    })
    
    return result
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 