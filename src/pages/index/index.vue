<template>
  <view class="dashboard-container">
    <!-- 用户信息 -->
    <view class="user-card">
      <view class="avatar-container">
        <u-avatar :text="userInitials" size="large" bg-color="#2979ff"></u-avatar>
      </view>
      <view class="user-info">
        <text class="username">{{ currentUser.name || '用户' }}</text>
        <text class="email">{{ currentUser.email || '' }}</text>
      </view>
    </view>
    
    <!-- 账户概览 -->
    <view class="account-overview">
      <view class="overview-card">
        <view class="card-item">
          <text class="item-label">本月收入</text>
          <text class="item-value income">¥{{ totals.income.toFixed(2) }}</text>
        </view>
        <view class="card-divider"></view>
        <view class="card-item">
          <text class="item-label">本月支出</text>
          <text class="item-value expense">¥{{ totals.expense.toFixed(2) }}</text>
        </view>
        <view class="card-divider"></view>
        <view class="card-item">
          <text class="item-label">结余</text>
          <text class="item-value" :class="{ 'income': totals.balance >= 0, 'expense': totals.balance < 0 }">
            ¥{{ totals.balance.toFixed(2) }}
          </text>
        </view>
      </view>
    </view>
    
    <!-- 预算进度 -->
    <view class="budget-progress" v-if="monthlyBudget > 0">
      <view class="section-title">本月预算</view>
      <view class="budget-card">
        <view class="budget-info">
          <view class="budget-text">
            <text>¥{{ currentMonthExpense.toFixed(2) }}</text>
            <text class="budget-total"> / ¥{{ monthlyBudget.toFixed(2) }}</text>
          </view>
          <text class="budget-percent">{{ budgetUsagePercent }}%</text>
        </view>
        <u-line-progress :percent="budgetUsagePercent" :show-percent="false" height="20"></u-line-progress>
      </view>
    </view>
    
    <!-- 最近交易 -->
    <view class="recent-transactions">
      <view class="section-header">
        <text class="section-title">最近交易</text>
        <text class="more-link" @click="navigateToRecord">查看全部</text>
      </view>
      
      <view class="transaction-list">
        <view v-if="recentBills.length === 0" class="empty-tip">
          <text>暂无交易记录</text>
        </view>
        
        <view 
          v-for="(bill, index) in recentBills" 
          :key="bill.id"
          class="transaction-item"
          @click="navigateToBillDetail(bill.id)">
          <view class="transaction-icon">
            <u-icon :name="bill.categoryIcon" size="48" :color="bill.type === '支出' ? '#ff5722' : '#2979ff'"></u-icon>
          </view>
          <view class="transaction-info">
            <text class="transaction-title">{{ bill.title }}</text>
            <text class="transaction-category">{{ bill.categoryName }}</text>
          </view>
          <view class="transaction-amount">
            <text :class="{ 'income-text': bill.type === '收入', 'expense-text': bill.type === '支出' }">
              {{ bill.type === '收入' ? '+' : '-' }}¥{{ bill.amount.toFixed(2) }}
            </text>
            <text class="transaction-date">{{ formatDate(bill.date) }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <view class="bottom-bar">
      <view class="nav-item active">
        <u-icon name="home" size="40" color="#2979ff"></u-icon>
        <text class="nav-text">首页</text>
      </view>
      <view class="nav-item" @click="navigateToRecord">
        <u-icon name="order" size="40" color="#909399"></u-icon>
        <text class="nav-text">账单</text>
      </view>
      <view class="add-button" @click="navigateToAddRecord">
        <u-icon name="plus" size="40" color="#ffffff"></u-icon>
      </view>
      <view class="nav-item" @click="navigateToStatistics">
        <u-icon name="pie-chart" size="40" color="#909399"></u-icon>
        <text class="nav-text">统计</text>
      </view>
      <view class="nav-item" @click="navigateToProfile">
        <u-icon name="account" size="40" color="#909399"></u-icon>
        <text class="nav-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex'

export default Vue.extend({
  data() {
    return {
      loading: false
    }
  },
  computed: {
    ...mapGetters('user', [
      'currentUser',
      'isLoggedIn'
    ]),
    ...mapGetters('bill', [
      'allBills',
      'billTotals'
    ]),
    ...mapGetters('budget', [
      'monthlyBudget',
      'currentMonthExpense',
      'budgetUsagePercent'
    ]),
    userInitials() {
      if (!this.currentUser.name) return 'U'
      const names = this.currentUser.name.split(' ')
      if (names.length > 1) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return names[0][0].toUpperCase()
    },
    totals() {
      return this.billTotals
    },
    recentBills() {
      const bills = [...this.allBills]
      return bills.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    }
  },
  onShow() {
    // 检查登录状态
    if (!this.isLoggedIn) {
      uni.reLaunch({
        url: '/pages/login/index'
      })
      return
    }
    
    this.loadData()
  },
  methods: {
    ...mapActions('bill', [
      'fetchBills',
      'calculateSummary'
    ]),
    ...mapActions('budget', [
      'fetchBudget',
      'calculateCurrentMonthExpense'
    ]),
    
    async loadData() {
      this.loading = true
      try {
        // 获取账单数据
        await this.fetchBills()
        
        // 重新计算汇总
        this.calculateSummary()
        
        // 获取预算数据
        await this.fetchBudget()
        
        // 计算当月支出
        this.calculateCurrentMonthExpense()
      } catch (error) {
        console.error('加载数据失败', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    },
    
    navigateToRecord() {
      uni.navigateTo({
        url: '/pages/record/index'
      })
    },
    
    navigateToAddRecord() {
      uni.navigateTo({
        url: '/pages/record/add'
      })
    },
    
    navigateToStatistics() {
      uni.navigateTo({
        url: '/pages/statistics/index'
      })
    },
    
    navigateToProfile() {
      uni.navigateTo({
        url: '/pages/profile/index'
      })
    },
    
    navigateToBillDetail(billId) {
      uni.navigateTo({
        url: `/pages/record/detail?id=${billId}`
      })
    }
  }
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding-bottom: 120rpx;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #2979ff;
  color: #ffffff;
  
  .avatar-container {
    margin-right: 30rpx;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    
    .username {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }
    
    .email {
      font-size: 24rpx;
      opacity: 0.8;
    }
  }
}

.account-overview {
  margin: -40rpx 30rpx 30rpx;
  
  .overview-card {
    background-color: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
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
        font-size: 36rpx;
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
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.budget-progress {
  padding: 30rpx;
  
  .budget-card {
    background-color: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    padding: 30rpx;
    
    .budget-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;
      
      .budget-text {
        font-size: 32rpx;
        font-weight: bold;
        
        .budget-total {
          font-size: 28rpx;
          color: #999;
          font-weight: normal;
        }
      }
      
      .budget-percent {
        font-size: 28rpx;
        color: #333;
      }
    }
  }
}

.recent-transactions {
  padding: 30rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .more-link {
      font-size: 24rpx;
      color: #2979ff;
    }
  }
  
  .transaction-list {
    background-color: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;
    
    .empty-tip {
      padding: 60rpx 0;
      text-align: center;
      color: #999;
    }
    
    .transaction-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      border-bottom: 2rpx solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .transaction-icon {
        margin-right: 20rpx;
      }
      
      .transaction-info {
        flex: 1;
        
        .transaction-title {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .transaction-category {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .transaction-amount {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        
        .income-text {
          color: #4caf50;
          font-weight: bold;
        }
        
        .expense-text {
          color: #ff5722;
          font-weight: bold;
        }
        
        .transaction-date {
          font-size: 24rpx;
          color: #999;
          margin-top: 10rpx;
        }
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .nav-text {
      font-size: 24rpx;
      color: #909399;
      margin-top: 6rpx;
    }
    
    &.active .nav-text {
      color: #2979ff;
    }
  }
  
  .add-button {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background-color: #2979ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 50rpx;
    box-shadow: 0 4rpx 20rpx rgba(41, 121, 255, 0.3);
  }
}
</style>
