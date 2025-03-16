// 账单类型
export const BILL_TYPES = {
  EXPENSE: '支出',
  INCOME: '收入'
}

// 默认分类
export const DEFAULT_CATEGORIES = {
  // 支出分类
  expense: [
    { id: 1, name: '餐饮', icon: 'restaurant' },
    { id: 2, name: '交通', icon: 'car' },
    { id: 3, name: '购物', icon: 'shopping-cart' },
    { id: 4, name: '娱乐', icon: 'film' },
    { id: 5, name: '居家', icon: 'home' },
    { id: 6, name: '医疗', icon: 'plus-square' },
    { id: 7, name: '教育', icon: 'book' },
    { id: 8, name: '其他', icon: 'more-horizontal' }
  ],
  // 收入分类
  income: [
    { id: 101, name: '工资', icon: 'briefcase' },
    { id: 102, name: '奖金', icon: 'award' },
    { id: 103, name: '兼职', icon: 'clock' },
    { id: 104, name: '投资', icon: 'trending-up' },
    { id: 105, name: '其他', icon: 'more-horizontal' }
  ]
}

// 将todos转换为记账数据
export const convertTodoToBill = (todo, detail = null, comments = []) => {
  // 随机金额，真实应用中这部分会来自用户输入
  const amount = parseFloat((Math.random() * 1000).toFixed(2))
  // 随机类型
  const type = Math.random() > 0.5 ? BILL_TYPES.EXPENSE : BILL_TYPES.INCOME
  // 获取对应类型的随机分类
  const categories = type === BILL_TYPES.EXPENSE ? DEFAULT_CATEGORIES.expense : DEFAULT_CATEGORIES.income
  const category = categories[Math.floor(Math.random() * categories.length)]
  
  return {
    id: todo.id,
    userId: todo.userId,
    title: todo.title,
    amount: amount,
    type: type,
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
    date: new Date().toISOString().split('T')[0],
    isSettled: todo.completed,
    detail: detail || null,
    comments: comments || []
  }
}

// 生成一天的随机账单
export const generateDailyBills = (todos = [], posts = [], comments = []) => {
  if (!todos.length) return []
  
  return todos.map(todo => {
    // 查找对应的详情
    const detail = posts.find(post => post.id === todo.id)
    // 查找对应的评论
    const billComments = comments.filter(comment => comment.postId === todo.id)
    
    return convertTodoToBill(todo, detail, billComments)
  })
}

// 计算收支总额
export const calculateTotals = (bills = []) => {
  return bills.reduce((result, bill) => {
    if (bill.type === BILL_TYPES.INCOME) {
      result.income += bill.amount
    } else {
      result.expense += bill.amount
    }
    result.balance = result.income - result.expense
    return result
  }, { income: 0, expense: 0, balance: 0 })
}

// 按分类汇总账单
export const summarizeByCategory = (bills = []) => {
  const result = {
    [BILL_TYPES.EXPENSE]: {},
    [BILL_TYPES.INCOME]: {}
  }
  
  bills.forEach(bill => {
    const type = bill.type
    const categoryId = bill.categoryId
    
    if (!result[type][categoryId]) {
      result[type][categoryId] = {
        categoryId,
        categoryName: bill.categoryName,
        categoryIcon: bill.categoryIcon,
        amount: 0,
        count: 0
      }
    }
    
    result[type][categoryId].amount += bill.amount
    result[type][categoryId].count += 1
  })
  
  return result
}

// 按日期汇总账单
export const summarizeByDate = (bills = []) => {
  const result = {}
  
  bills.forEach(bill => {
    const date = bill.date
    
    if (!result[date]) {
      result[date] = {
        date,
        bills: [],
        income: 0,
        expense: 0,
        balance: 0
      }
    }
    
    result[date].bills.push(bill)
    
    if (bill.type === BILL_TYPES.INCOME) {
      result[date].income += bill.amount
    } else {
      result[date].expense += bill.amount
    }
    
    result[date].balance = result[date].income - result[date].expense
  })
  
  return result
} 