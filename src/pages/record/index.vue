<template>
  <view class="record-container">
    <view class="header">
      <text class="title">账单明细</text>
    </view>
    
    <!-- 账单列表 -->
    <view class="bill-list">
      <template v-if="Object.keys(billsByDate).length === 0">
        <view class="empty-tip">
          <u-icon name="info-circle" size="80" color="#c0c4cc"></u-icon>
          <text>暂无账单记录</text>
          <u-button type="primary" size="medium" @click="navigateToAddRecord" style="margin-top: 30rpx;">添加账单</u-button>
        </view>
      </template>
      
      <template v-else>
        <view 
          v-for="(dateItem, date) in sortedBillsByDate" 
          :key="date" 
          class="date-group">
          <view class="date-header">
            <text class="date-text">{{ formatDateTitle(date) }}</text>
            <view class="date-summary">
              <text class="summary-text">收入: ¥{{ dateItem.income.toFixed(2) }}</text>
              <text class="summary-text">支出: ¥{{ dateItem.expense.toFixed(2) }}</text>
            </view>
          </view>
          
          <view 
            v-for="bill in dateItem.bills" 
            :key="bill.id"
            class="bill-item"
            @click="navigateToBillDetail(bill.id)">
            <view class="bill-icon">
              <u-icon :name="bill.categoryIcon" size="48" :color="bill.type === '支出' ? '#ff5722' : '#2979ff'"></u-icon>
            </view>
            <view class="bill-info">
              <text class="bill-title">{{ bill.title }}</text>
              <text class="bill-category">{{ bill.categoryName }}</text>
            </view>
            <view class="bill-amount">
              <text :class="{ 'income-text': bill.type === '收入', 'expense-text': bill.type === '支出' }">
                {{ bill.type === '收入' ? '+' : '-' }}¥{{ bill.amount.toFixed(2) }}
              </text>
            </view>
          </view>
        </view>
      </template>
    </view>
    
    <!-- 底部添加按钮 -->
    <view class="add-button" @click="navigateToAddRecord">
      <u-icon name="plus" color="#ffffff" size="40"></u-icon>
    </view>
  </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      loading: false
    }
  },
  computed: {
    ...mapGetters('bill', [
      'billsByDate'
    ]),
    
    sortedBillsByDate() {
      // 按日期排序，最新的日期在前面
      const dates = Object.keys(this.billsByDate)
      dates.sort((a, b) => new Date(b) - new Date(a))
      
      const result = {}
      dates.forEach(date => {
        result[date] = this.billsByDate[date]
      })
      
      return result
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    ...mapActions('bill', [
      'fetchBills',
      'calculateSummary'
    ]),
    
    async loadData() {
      this.loading = true
      try {
        await this.fetchBills()
        this.calculateSummary()
      } catch (error) {
        console.error('加载账单失败', error)
        uni.showToast({
          title: '加载账单失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    formatDateTitle(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (isSameDay(date, today)) {
        return `今天 (${month}月${day}日)`
      } else if (isSameDay(date, yesterday)) {
        return `昨天 (${month}月${day}日)`
      } else {
        return `${year}年${month}月${day}日`
      }
      
      function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate()
      }
    },
    
    navigateToAddRecord() {
      uni.navigateTo({
        url: '/pages/record/add'
      })
    },
    
    navigateToBillDetail(billId) {
      uni.navigateTo({
        url: `/pages/record/detail?id=${billId}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.record-container {
  padding-bottom: 120rpx;
}

.header {
  padding: 30rpx;
  background-color: #ffffff;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
  }
}

.bill-list {
  padding: 0 30rpx;
  
  .empty-tip {
    padding: 100rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999999;
    
    text {
      margin-top: 20rpx;
      font-size: 30rpx;
    }
  }
  
  .date-group {
    margin-bottom: 30rpx;
    
    .date-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      
      .date-text {
        font-size: 28rpx;
        color: #666;
      }
      
      .date-summary {
        display: flex;
        
        .summary-text {
          font-size: 24rpx;
          color: #999;
          margin-left: 20rpx;
        }
      }
    }
    
    .bill-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      background-color: #ffffff;
      border-radius: 12rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
      
      .bill-icon {
        margin-right: 20rpx;
      }
      
      .bill-info {
        flex: 1;
        
        .bill-title {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .bill-category {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .bill-amount {
        font-size: 32rpx;
        font-weight: bold;
        
        .income-text {
          color: #4caf50;
        }
        
        .expense-text {
          color: #ff5722;
        }
      }
    }
  }
}

.add-button {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #2979ff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(41, 121, 255, 0.3);
}
</style> 