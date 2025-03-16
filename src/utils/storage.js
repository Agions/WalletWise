// 存储键名常量
export const STORAGE_KEYS = {
  USER: 'bill_app_user',
  BILLS: 'bill_app_bills',
  CATEGORIES: 'bill_app_categories',
  BUDGET: 'bill_app_budget'
}

// 保存数据到本地存储
export const saveData = (key, data) => {
  try {
    uni.setStorageSync(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('保存数据失败', e)
    return false
  }
}

// 从本地存储获取数据
export const getData = (key, defaultValue = null) => {
  try {
    const data = uni.getStorageSync(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (e) {
    console.error('获取数据失败', e)
    return defaultValue
  }
}

// 清除本地存储中的数据
export const removeData = (key) => {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除数据失败', e)
    return false
  }
}

// 清除所有本地存储数据
export const clearAll = () => {
  try {
    uni.clearStorageSync()
    return true
  } catch (e) {
    console.error('清除所有数据失败', e)
    return false
  }
}

// 保存用户信息
export const saveUserInfo = (userInfo) => {
  return saveData(STORAGE_KEYS.USER, userInfo)
}

// 获取用户信息
export const getUserInfo = () => {
  return getData(STORAGE_KEYS.USER, null)
}

// 清除用户信息 (退出登录)
export const clearUserInfo = () => {
  return removeData(STORAGE_KEYS.USER)
}

// 保存账单数据
export const saveBills = (bills) => {
  return saveData(STORAGE_KEYS.BILLS, bills)
}

// 获取账单数据
export const getBills = () => {
  return getData(STORAGE_KEYS.BILLS, [])
}

// 保存分类数据
export const saveCategories = (categories) => {
  return saveData(STORAGE_KEYS.CATEGORIES, categories)
}

// 获取分类数据
export const getCategories = (defaultCategories) => {
  return getData(STORAGE_KEYS.CATEGORIES, defaultCategories)
}

// 保存预算数据
export const saveBudget = (budget) => {
  return saveData(STORAGE_KEYS.BUDGET, budget)
}

// 获取预算数据
export const getBudget = () => {
  return getData(STORAGE_KEYS.BUDGET, {
    monthly: 0,
    categories: {}
  })
} 