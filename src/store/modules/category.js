import { saveCategories, getCategories } from '@/utils/storage'
import { DEFAULT_CATEGORIES } from '@/utils/dataAdapter'

const state = {
  categories: getCategories(DEFAULT_CATEGORIES)
}

const mutations = {
  SET_CATEGORIES(state, categories) {
    state.categories = categories
    saveCategories(categories)
  },
  ADD_CATEGORY(state, { type, category }) {
    const categoryList = state.categories[type] || []
    // 生成新ID
    const maxId = Math.max(0, ...categoryList.map(c => c.id))
    const newCategory = {
      ...category,
      id: maxId + 1
    }
    
    state.categories[type].push(newCategory)
    saveCategories(state.categories)
  },
  UPDATE_CATEGORY(state, { type, id, data }) {
    const categoryList = state.categories[type] || []
    const index = categoryList.findIndex(c => c.id === id)
    
    if (index !== -1) {
      categoryList[index] = { ...categoryList[index], ...data }
      saveCategories(state.categories)
    }
  },
  DELETE_CATEGORY(state, { type, id }) {
    const categoryList = state.categories[type] || []
    state.categories[type] = categoryList.filter(c => c.id !== id)
    saveCategories(state.categories)
  },
  RESET_CATEGORIES(state) {
    state.categories = DEFAULT_CATEGORIES
    saveCategories(DEFAULT_CATEGORIES)
  }
}

const actions = {
  // 获取所有分类
  fetchCategories({ commit }) {
    const categories = getCategories(DEFAULT_CATEGORIES)
    commit('SET_CATEGORIES', categories)
    return categories
  },
  
  // 添加分类
  addCategory({ commit }, { type, category }) {
    commit('ADD_CATEGORY', { type, category })
    return { success: true }
  },
  
  // 更新分类
  updateCategory({ commit }, { type, id, data }) {
    commit('UPDATE_CATEGORY', { type, id, data })
    return { success: true }
  },
  
  // 删除分类
  deleteCategory({ commit }, { type, id }) {
    commit('DELETE_CATEGORY', { type, id })
    return { success: true }
  },
  
  // 重置分类
  resetCategories({ commit }) {
    commit('RESET_CATEGORIES')
    return { success: true }
  }
}

const getters = {
  // 获取所有分类
  allCategories: state => state.categories,
  
  // 获取支出分类
  expenseCategories: state => state.categories.expense || [],
  
  // 获取收入分类
  incomeCategories: state => state.categories.income || [],
  
  // 根据ID获取分类
  getCategoryById: state => (type, id) => {
    const categories = state.categories[type] || []
    return categories.find(c => c.id === id) || null
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 