<template>
  <view class="statistics-container">
    <view class="header">
      <text class="title">统计分析</text>
    </view>
    
    <!-- 时间选择器 -->
    <view class="time-selector">
      <view class="selector-item" :class="{ active: timeRange === 'week' }" @click="selectTimeRange('week')">
        <text>本周</text>
      </view>
      <view class="selector-item" :class="{ active: timeRange === 'month' }" @click="selectTimeRange('month')">
        <text>本月</text>
      </view>
      <view class="selector-item" :class="{ active: timeRange === 'year' }" @click="selectTimeRange('year')">
        <text>本年</text>
      </view>
      <view class="selector-item" :class="{ active: timeRange === 'custom' }" @click="selectTimeRange('custom')">
        <text>自定义</text>
      </view>
    </view>
    
    <!-- 当前时间范围显示 -->
    <view class="current-range">
      <text>{{ currentRangeText }}</text>
    </view>
    
    <!-- 收支概览卡片 -->
    <view class="overview-card">
      <view class="card-item">
        <text class="item-label">收入</text>
        <text class="item-value income">¥{{ statistics.income.toFixed(2) }}</text>
      </view>
      <view class="card-divider"></view>
      <view class="card-item">
        <text class="item-label">支出</text>
        <text class="item-value expense">¥{{ statistics.expense.toFixed(2) }}</text>
      </view>
      <view class="card-divider"></view>
      <view class="card-item">
        <text class="item-label">结余</text>
        <text class="item-value" :class="{ 'income': statistics.balance >= 0, 'expense': statistics.balance < 0 }">
          ¥{{ statistics.balance.toFixed(2) }}
        </text>
      </view>
    </view>
    
    <!-- 收支类型选择 -->
    <view class="type-switch">
      <view class="switch-item" :class="{ active: activeType === 'expense' }" @click="switchType('expense')">
        <text>支出</text>
      </view>
      <view class="switch-item" :class="{ active: activeType === 'income' }" @click="switchType('income')">
        <text>收入</text>
      </view>
    </view>
    
    <!-- 分类饼图 -->
    <view class="chart-card">
      <view v-if="loading" class="loading">
        <u-loading mode="circle"></u-loading>
        <text>加载中...</text>
      </view>
      <view v-else-if="!hasCategoryData" class="empty-tip">
        <text>暂无{{ activeType === 'expense' ? '支出' : '收入' }}数据</text>
      </view>
      <view v-else class="chart-content">
        <!-- 这里可以集成图表库，例如 uCharts 或 ECharts -->
        <view class="chart-placeholder">
          <text>此处应显示饼图</text>
          <text>（实际项目中应集成图表库）</text>
        </view>
      </view>
    </view>
    
    <!-- 分类排行 -->
    <view class="ranking-card">
      <view class="card-title">{{ activeType === 'expense' ? '支出' : '收入' }}排行</view>
      
      <view v-if="!hasCategoryData" class="empty-tip">
        <text>暂无数据</text>
      </view>
      
      <view v-else class="ranking-list">
        <view 
          v-for="(item, index) in sortedCategoryItems" 
          :key="item.categoryId"
          class="ranking-item">
          <view class="rank-info">
            <view class="rank-icon">
              <u-icon :name="item.categoryIcon" size="40" :color="activeType === 'expense' ? '#ff5722' : '#4caf50'"></u-icon>
            </view>
            <view class="rank-detail">
              <text class="rank-name">{{ item.categoryName }}</text>
              <view class="rank-progress">
                <view 
                  class="progress-bar" 
                  :class="activeType === 'expense' ? 'expense-bar' : 'income-bar'"
                  :style="{ width: (item.percentage * 100) + '%' }">
                </view>
              </view>
            </view>
          </view>
          <view class="rank-amount">
            <text>¥{{ item.amount.toFixed(2) }}</text>
            <text class="rank-percent">{{ (item.percentage * 100).toFixed(1) }}%</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      timeRange: 'month', // 'week', 'month', 'year', 'custom'
      startDate: '',
      endDate: '',
      activeType: 'expense', // 'expense', 'income'
      filteredBills: [],
      categoryData: {
        expense: [],
        income: []
      },
      statistics: {
        income: 0,
        expense: 0,
        balance: 0
      },
      loading: false
    }
  },
  computed: {
    ...mapGetters('bill', [
      'allBills'
    ]),
    ...mapGetters('category', [
      'expenseCategories',
      'incomeCategories'
    ]),
    
    currentRangeText() {
      const now = new Date()
      
      switch (this.timeRange) {
        case 'week':
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return `${formatDate(weekStart)} 至 ${formatDate(weekEnd)}`
        
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          return `${formatDate(monthStart)} 至 ${formatDate(monthEnd)}`
        
        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1)
          const yearEnd = new Date(now.getFullYear(), 11, 31)
          return `${formatDate(yearStart)} 至 ${formatDate(yearEnd)}`
        
        case 'custom':
          if (!this.startDate || !this.endDate) return '请选择时间范围'
          return `${this.startDate} 至 ${this.endDate}`
        
        default:
          return ''
      }
      
      function formatDate(date) {
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}月${day}日`
      }
    },
    
    hasCategoryData() {
      return this.categoryData[this.activeType].length > 0
    },
    
    sortedCategoryItems() {
      const items = [...this.categoryData[this.activeType]]
      return items.sort((a, b) => b.amount - a.amount)
    }
  },
  onShow() {
    this.selectTimeRange(this.timeRange)
  },
  methods: {
    ...mapActions('bill', [
      'fetchBills'
    ]),
    
    async selectTimeRange(range) {
      this.timeRange = range
      this.loading = true
      
      try {
        // 重新获取账单数据
        await this.fetchBills()
        
        // 设置日期范围
        let startDate, endDate
        const now = new Date()
        
        switch (range) {
          case 'week':
            startDate = new Date(now)
            startDate.setDate(now.getDate() - now.getDay())
            endDate = new Date(startDate)
            endDate.setDate(startDate.getDate() + 6)
            break
          
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            break
          
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            endDate = new Date(now.getFullYear(), 11, 31)
            break
          
          case 'custom':
            // 自定义时间范围，使用已保存的时间
            if (!this.startDate || !this.endDate) {
              // 如果没有设置，默认使用本月
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
              const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
              this.startDate = formatDate(monthStart)
              this.endDate = formatDate(monthEnd)
            }
            startDate = new Date(this.startDate)
            endDate = new Date(this.endDate)
            break
        }
        
        // 格式化为YYYY-MM-DD
        const formattedStartDate = formatDate(startDate)
        const formattedEndDate = formatDate(endDate)
        
        // 筛选日期范围内的账单
        this.filteredBills = this.allBills.filter(bill => {
          const billDate = new Date(bill.date)
          return billDate >= startDate && billDate <= endDate
        })
        
        // 计算统计数据
        this.calculateStatistics()
      } catch (error) {
        console.error('获取账单失败', error)
        uni.showToast({
          title: '获取账单失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
      
      function formatDate(date) {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    },
    
    switchType(type) {
      this.activeType = type
    },
    
    calculateStatistics() {
      // 计算总收支
      const totals = { income: 0, expense: 0 }
      this.filteredBills.forEach(bill => {
        if (bill.type === '收入') {
          totals.income += bill.amount
        } else {
          totals.expense += bill.amount
        }
      })
      totals.balance = totals.income - totals.expense
      this.statistics = totals
      
      // 按分类汇总
      this.calculateCategoryData()
    },
    
    calculateCategoryData() {
      // 支出分类数据
      const expenseData = {}
      // 收入分类数据
      const incomeData = {}
      
      // 分类汇总
      this.filteredBills.forEach(bill => {
        const categoryId = bill.categoryId
        const isExpense = bill.type === '支出'
        const dataMap = isExpense ? expenseData : incomeData
        
        if (!dataMap[categoryId]) {
          dataMap[categoryId] = {
            categoryId,
            categoryName: bill.categoryName,
            categoryIcon: bill.categoryIcon,
            amount: 0,
            count: 0,
            percentage: 0
          }
        }
        
        dataMap[categoryId].amount += bill.amount
        dataMap[categoryId].count += 1
      })
      
      // 计算百分比
      const expenseTotal = this.statistics.expense
      const incomeTotal = this.statistics.income
      
      Object.values(expenseData).forEach(item => {
        item.percentage = expenseTotal > 0 ? item.amount / expenseTotal : 0
      })
      
      Object.values(incomeData).forEach(item => {
        item.percentage = incomeTotal > 0 ? item.amount / incomeTotal : 0
      })
      
      // 转换为数组
      this.categoryData.expense = Object.values(expenseData)
      this.categoryData.income = Object.values(incomeData)
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics-container {
  padding-bottom: 40rpx;
}

.header {
  padding: 30rpx;
  background-color: #ffffff;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
  }
}

.time-selector {
  display: flex;
  background-color: #ffffff;
  padding: 0 20rpx;
  border-bottom: 1px solid #f5f5f5;
  
  .selector-item {
    padding: 20rpx;
    font-size: 28rpx;
    position: relative;
    
    &.active {
      color: #2979ff;
      font-weight: bold;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background-color: #2979ff;
      }
    }
  }
}

.current-range {
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  font-size: 26rpx;
  color: #666;
}

.overview-card {
  margin: 20rpx 30rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  
  .card-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .item-label {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 10rpx;
    }
    
    .item-value {
      font-size: 32rpx;
      font-weight: bold;
      
      &.income {
        color: #4caf50;
      }
      
      &.expense {
        color: #ff5722;
      }
    }
  }
  
  .card-divider {
    width: 2rpx;
    background-color: #eee;
    margin: 0 20rpx;
  }
}

.type-switch {
  display: flex;
  margin: 20rpx 30rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
  
  .switch-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    
    &.active {
      background-color: #2979ff;
      color: #ffffff;
    }
  }
}

.chart-card {
  margin: 0 30rpx 20rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  padding: 30rpx;
  
  .loading, .empty-tip {
    height: 400rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    
    text {
      margin-top: 20rpx;
    }
  }
  
  .chart-content {
    height: 400rpx;
    
    .chart-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      border: 1px dashed #ddd;
      border-radius: 8rpx;
    }
  }
}

.ranking-card {
  margin: 0 30rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  padding: 30rpx;
  
  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }
  
  .empty-tip {
    padding: 60rpx 0;
    text-align: center;
    color: #999;
  }
  
  .ranking-list {
    .ranking-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .rank-info {
        display: flex;
        align-items: center;
        flex: 1;
        margin-right: 30rpx;
        
        .rank-icon {
          margin-right: 20rpx;
        }
        
        .rank-detail {
          flex: 1;
          
          .rank-name {
            font-size: 28rpx;
            margin-bottom: 10rpx;
          }
          
          .rank-progress {
            height: 12rpx;
            background-color: #f5f5f5;
            border-radius: 6rpx;
            overflow: hidden;
            
            .progress-bar {
              height: 100%;
              border-radius: 6rpx;
              
              &.expense-bar {
                background-color: #ff5722;
              }
              
              &.income-bar {
                background-color: #4caf50;
              }
            }
          }
        }
      }
      
      .rank-amount {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        
        font-size: 28rpx;
        font-weight: bold;
        
        .rank-percent {
          font-size: 24rpx;
          color: #999;
          font-weight: normal;
          margin-top: 6rpx;
        }
      }
    }
  }
}
</style> 