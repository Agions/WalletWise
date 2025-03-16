<template>
  <view class="budget-container">
    <view class="header">
      <text class="title">预算管理</text>
    </view>
    
    <!-- 月度总预算 -->
    <view class="monthly-budget">
      <view class="section-title">月度总预算</view>
      <view class="budget-card">
        <view class="budget-form">
          <text class="label">预算金额</text>
          <view class="input-wrapper">
            <text class="prefix">¥</text>
            <input 
              type="digit"
              v-model="monthlyBudgetInput"
              placeholder="请输入月度预算"
              class="budget-input" />
          </view>
        </view>
        <u-button 
          type="primary" 
          size="medium" 
          @click="saveMonthlyBudget"
          :loading="saving.monthly">
          保存
        </u-button>
      </view>
    </view>
    
    <!-- 月度支出进度 -->
    <view class="budget-progress" v-if="monthlyBudget > 0">
      <view class="section-title">本月预算使用情况</view>
      <view class="progress-card">
        <view class="progress-info">
          <text>¥{{ currentMonthExpense.toFixed(2) }} / ¥{{ monthlyBudget.toFixed(2) }}</text>
          <text class="progress-percent">{{ budgetUsagePercent }}%</text>
        </view>
        <u-line-progress 
          :percent="budgetUsagePercent" 
          :show-percent="false"
          height="20"
          :active-color="budgetUsagePercent > 90 ? '#ff5722' : '#2979ff'">
        </u-line-progress>
        <view class="remaining-text">
          <text>剩余：</text>
          <text class="amount" :class="{ 'danger': remainingBudget < 0 }">
            ¥{{ remainingBudget.toFixed(2) }}
          </text>
        </view>
      </view>
    </view>
    
    <!-- 分类预算管理 -->
    <view class="category-budgets">
      <view class="section-header">
        <text class="section-title">分类预算</text>
        <u-button 
          type="primary" 
          size="mini" 
          @click="showAddCategoryBudget = true">
          添加
        </u-button>
      </view>
      
      <view class="empty-tip" v-if="Object.keys(categoryBudgets).length === 0">
        <text>暂无分类预算</text>
        <text class="sub-tip">点击"添加"按钮设置分类预算</text>
      </view>
      
      <view v-else class="category-list">
        <view 
          v-for="(budget, categoryId) in categoryBudgetUsage" 
          :key="categoryId"
          class="category-item">
          <view class="category-info">
            <view class="category-icon">
              <u-icon :name="getCategoryIcon(categoryId)" size="40" color="#2979ff"></u-icon>
            </view>
            <view class="category-detail">
              <text class="category-name">{{ getCategoryName(categoryId) }}</text>
              <view class="budget-bar">
                <view 
                  class="budget-progress"
                  :style="{ width: `${budget.usagePercent}%` }"
                  :class="{ 'warning': budget.usagePercent > 80, 'danger': budget.usagePercent > 100 }">
                </view>
              </view>
              <view class="budget-info">
                <text class="usage">已用：¥{{ budget.spent.toFixed(2) }}</text>
                <text class="total">共：¥{{ budget.budget.toFixed(2) }}</text>
                <text class="percent">{{ budget.usagePercent }}%</text>
              </view>
            </view>
          </view>
          <view class="category-actions">
            <view class="action-item" @click="editCategoryBudget(categoryId, budget.budget)">
              <u-icon name="edit-pen" size="34" color="#909399"></u-icon>
            </view>
            <view class="action-item" @click="deleteCategoryBudget(categoryId)">
              <u-icon name="trash" size="34" color="#909399"></u-icon>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加分类预算弹窗 -->
    <u-popup v-model="showAddCategoryBudget" mode="bottom">
      <view class="popup-header">
        <text class="cancel" @click="showAddCategoryBudget = false">取消</text>
        <text class="title">设置分类预算</text>
        <text class="confirm" @click="saveCategoryBudget">确定</text>
      </view>
      <view class="popup-content">
        <view class="popup-form-item">
          <text class="label">选择分类</text>
          <picker 
            :range="categoryOptions" 
            range-key="name"
            @change="onCategoryChange">
            <view class="picker-value">
              <text v-if="selectedCategory">{{ selectedCategory.name }}</text>
              <text v-else class="placeholder">请选择分类</text>
              <u-icon name="arrow-down" size="24" color="#c0c4cc"></u-icon>
            </view>
          </picker>
        </view>
        <view class="popup-form-item">
          <text class="label">预算金额</text>
          <view class="input-wrapper">
            <text class="prefix">¥</text>
            <input 
              type="digit"
              v-model="categoryBudgetInput"
              placeholder="请输入预算金额"
              class="budget-input" />
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      monthlyBudgetInput: '',
      showAddCategoryBudget: false,
      selectedCategoryId: null,
      categoryBudgetInput: '',
      saving: {
        monthly: false,
        category: false
      },
      isEditing: false,
      editingCategoryId: null
    }
  },
  computed: {
    ...mapGetters('budget', [
      'monthlyBudget',
      'categoryBudgets',
      'currentMonthExpense',
      'remainingBudget',
      'budgetUsagePercent',
      'categoryBudgetUsage'
    ]),
    ...mapGetters('category', [
      'expenseCategories'
    ]),
    
    categoryOptions() {
      return this.expenseCategories.map(category => {
        return {
          id: category.id,
          name: category.name,
          icon: category.icon
        }
      })
    },
    
    selectedCategory() {
      if (!this.selectedCategoryId) return null
      return this.categoryOptions.find(item => item.id === this.selectedCategoryId) || null
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    ...mapActions('budget', [
      'fetchBudget',
      'setMonthlyBudget',
      'setCategoryBudget',
      'deleteCategoryBudget',
      'calculateCurrentMonthExpense'
    ]),
    ...mapActions('bill', [
      'fetchBills'
    ]),
    
    async loadData() {
      try {
        // 获取账单数据
        await this.fetchBills()
        
        // 获取预算数据
        await this.fetchBudget()
        
        // 计算当月支出
        await this.calculateCurrentMonthExpense()
        
        // 更新输入框显示
        this.monthlyBudgetInput = this.monthlyBudget ? this.monthlyBudget.toString() : ''
      } catch (error) {
        console.error('加载预算数据失败', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      }
    },
    
    async saveMonthlyBudget() {
      if (!this.monthlyBudgetInput) {
        uni.showToast({
          title: '请输入预算金额',
          icon: 'none'
        })
        return
      }
      
      const amount = parseFloat(this.monthlyBudgetInput)
      if (isNaN(amount) || amount <= 0) {
        uni.showToast({
          title: '请输入有效金额',
          icon: 'none'
        })
        return
      }
      
      this.saving.monthly = true
      
      try {
        await this.setMonthlyBudget(amount)
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('保存预算失败', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        this.saving.monthly = false
      }
    },
    
    onCategoryChange(e) {
      const index = e.detail.value
      const category = this.categoryOptions[index]
      if (category) {
        this.selectedCategoryId = category.id
      }
    },
    
    getCategoryName(categoryId) {
      const category = this.expenseCategories.find(item => item.id == categoryId)
      return category ? category.name : '未知分类'
    },
    
    getCategoryIcon(categoryId) {
      const category = this.expenseCategories.find(item => item.id == categoryId)
      return category ? category.icon : 'help-circle'
    },
    
    editCategoryBudget(categoryId, currentBudget) {
      // 设置为编辑模式
      this.isEditing = true
      this.editingCategoryId = categoryId
      
      // 设置当前分类和金额
      this.selectedCategoryId = Number(categoryId)
      this.categoryBudgetInput = currentBudget.toString()
      
      // 显示弹窗
      this.showAddCategoryBudget = true
    },
    
    async saveCategoryBudget() {
      if (!this.selectedCategoryId) {
        uni.showToast({
          title: '请选择分类',
          icon: 'none'
        })
        return
      }
      
      if (!this.categoryBudgetInput) {
        uni.showToast({
          title: '请输入预算金额',
          icon: 'none'
        })
        return
      }
      
      const amount = parseFloat(this.categoryBudgetInput)
      if (isNaN(amount) || amount <= 0) {
        uni.showToast({
          title: '请输入有效金额',
          icon: 'none'
        })
        return
      }
      
      this.saving.category = true
      
      try {
        const categoryId = this.isEditing ? this.editingCategoryId : this.selectedCategoryId
        
        await this.setCategoryBudget({
          categoryId: categoryId,
          amount: amount
        })
        
        // 重新计算预算使用情况
        await this.calculateCurrentMonthExpense()
        
        // 关闭弹窗并重置数据
        this.showAddCategoryBudget = false
        this.selectedCategoryId = null
        this.categoryBudgetInput = ''
        this.isEditing = false
        this.editingCategoryId = null
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('保存分类预算失败', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        this.saving.category = false
      }
    },
    
    async deleteCategoryBudget(categoryId) {
      uni.showModal({
        title: '删除预算',
        content: '确定要删除此分类预算吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.deleteCategoryBudget(categoryId)
              
              // 重新计算预算使用情况
              await this.calculateCurrentMonthExpense()
              
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } catch (error) {
              console.error('删除分类预算失败', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.budget-container {
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

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.monthly-budget, .budget-progress, .category-budgets {
  padding: 30rpx;
}

.budget-card, .progress-card {
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  padding: 30rpx;
}

.budget-form {
  margin-bottom: 30rpx;
  
  .label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .input-wrapper {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 10rpx;
    
    .prefix {
      font-size: 40rpx;
      margin-right: 10rpx;
      color: #333;
    }
    
    .budget-input {
      flex: 1;
      font-size: 40rpx;
      height: 80rpx;
    }
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  
  .progress-percent {
    color: #909399;
  }
}

.remaining-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  
  .amount {
    font-weight: bold;
    
    &.danger {
      color: #ff5722;
    }
  }
}

.empty-tip {
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  padding: 60rpx 30rpx;
  text-align: center;
  
  text {
    display: block;
    color: #909399;
  }
  
  .sub-tip {
    font-size: 24rpx;
    margin-top: 10rpx;
  }
}

.category-list {
  .category-item {
    background-color: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    padding: 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    
    .category-info {
      display: flex;
      flex: 1;
      
      .category-icon {
        margin-right: 20rpx;
      }
      
      .category-detail {
        flex: 1;
        
        .category-name {
          font-size: 28rpx;
          font-weight: bold;
          margin-bottom: 15rpx;
        }
        
        .budget-bar {
          height: 12rpx;
          background-color: #f5f5f5;
          border-radius: 6rpx;
          overflow: hidden;
          margin-bottom: 10rpx;
          
          .budget-progress {
            height: 100%;
            background-color: #2979ff;
            border-radius: 6rpx;
            
            &.warning {
              background-color: #ff9800;
            }
            
            &.danger {
              background-color: #ff5722;
            }
          }
        }
        
        .budget-info {
          display: flex;
          font-size: 24rpx;
          color: #909399;
          
          .usage, .total {
            margin-right: 20rpx;
          }
          
          .percent {
            color: #333;
            font-weight: bold;
          }
        }
      }
    }
    
    .category-actions {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      margin-left: 20rpx;
      
      .action-item {
        padding: 10rpx;
      }
    }
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f5f5f5;
  
  .title {
    font-size: 30rpx;
    font-weight: bold;
  }
  
  .cancel {
    font-size: 28rpx;
    color: #909399;
  }
  
  .confirm {
    font-size: 28rpx;
    color: #2979ff;
  }
}

.popup-content {
  padding: 30rpx;
  
  .popup-form-item {
    margin-bottom: 30rpx;
    
    .label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .picker-value {
      height: 80rpx;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .placeholder {
        color: #c0c4cc;
      }
    }
    
    .input-wrapper {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 10rpx;
      
      .prefix {
        font-size: 40rpx;
        margin-right: 10rpx;
        color: #333;
      }
      
      .budget-input {
        flex: 1;
        font-size: 40rpx;
        height: 80rpx;
      }
    }
  }
}
</style> 