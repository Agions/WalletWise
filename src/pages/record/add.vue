<template>
  <view class="add-record-container">
    <view class="header">
      <text class="title">记一笔</text>
    </view>
    
    <!-- 收支类型切换 -->
    <view class="type-switch">
      <view 
        class="type-item"
        :class="{ active: form.type === '支出' }"
        @click="switchType('支出')">
        <text>支出</text>
      </view>
      <view 
        class="type-item"
        :class="{ active: form.type === '收入' }"
        @click="switchType('收入')">
        <text>收入</text>
      </view>
    </view>
    
    <!-- 金额输入 -->
    <view class="amount-input">
      <text class="amount-label">¥</text>
      <input 
        type="digit" 
        v-model="form.amount" 
        placeholder="0.00"
        class="amount-field"
        focus />
    </view>
    
    <!-- 账单表单 -->
    <view class="form-content">
      <u-form :model="form" ref="uForm">
        <!-- 分类选择 -->
        <u-form-item label="分类" required>
          <view class="category-select" @click="showCategoryPicker = true">
            <text v-if="form.categoryId">{{ getCategoryName(form.type, form.categoryId) }}</text>
            <text v-else class="placeholder">请选择分类</text>
            <u-icon name="arrow-right" size="28" color="#c0c4cc"></u-icon>
          </view>
        </u-form-item>
        
        <!-- 日期选择 -->
        <u-form-item label="日期">
          <view class="date-select" @click="showDatePicker = true">
            <text>{{ formatDate(form.date) }}</text>
            <u-icon name="calendar" size="28" color="#c0c4cc"></u-icon>
          </view>
        </u-form-item>
        
        <!-- 账单标题 -->
        <u-form-item label="标题">
          <u-input 
            v-model="form.title" 
            placeholder="请输入标题"
            :border="false" />
        </u-form-item>
        
        <!-- 账单备注 -->
        <u-form-item label="备注">
          <u-input 
            v-model="form.detail" 
            type="textarea"
            placeholder="请输入备注"
            :border="false" />
        </u-form-item>
      </u-form>
    </view>
    
    <!-- 保存按钮 -->
    <view class="button-container">
      <u-button type="primary" @click="saveBill" :loading="loading">保存</u-button>
    </view>
    
    <!-- 分类选择弹窗 -->
    <u-popup v-model="showCategoryPicker" mode="bottom">
      <view class="picker-header">
        <text class="cancel" @click="showCategoryPicker = false">取消</text>
        <text class="title">选择分类</text>
        <text class="confirm" @click="confirmCategory">确定</text>
      </view>
      <view class="category-list">
        <view 
          v-for="category in currentCategories" 
          :key="category.id"
          class="category-item"
          :class="{ active: form.categoryId === category.id }"
          @click="selectCategory(category)">
          <u-icon :name="category.icon" size="40"></u-icon>
          <text>{{ category.name }}</text>
        </view>
      </view>
    </u-popup>
    
    <!-- 日期选择弹窗 -->
    <u-popup v-model="showDatePicker" mode="bottom">
      <view class="picker-header">
        <text class="cancel" @click="showDatePicker = false">取消</text>
        <text class="title">选择日期</text>
        <text class="confirm" @click="confirmDate">确定</text>
      </view>
      <view class="date-picker">
        <picker-view
          indicator-style="height: 50px;"
          :value="datePickerValue"
          @change="datePickerChange">
          <picker-view-column>
            <view class="picker-item" v-for="(year, index) in years" :key="index">{{ year }}年</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(month, index) in months" :key="index">{{ month }}月</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(day, index) in days" :key="index">{{ day }}日</view>
          </picker-view-column>
        </picker-view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    
    // 生成年份范围（前5年到后5年）
    const years = []
    for (let i = year - 5; i <= year + 5; i++) {
      years.push(i)
    }
    
    // 生成月份
    const months = []
    for (let i = 1; i <= 12; i++) {
      months.push(i)
    }
    
    // 生成天数（先用31天）
    const days = []
    for (let i = 1; i <= 31; i++) {
      days.push(i)
    }
    
    // 计算初始datePickerValue
    const yearIndex = years.findIndex(y => y === year)
    const monthIndex = months.findIndex(m => m === month)
    const dayIndex = days.findIndex(d => d === day)
    
    return {
      form: {
        type: '支出',
        amount: '',
        categoryId: null,
        categoryName: '',
        categoryIcon: '',
        date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        title: '',
        detail: ''
      },
      loading: false,
      showCategoryPicker: false,
      showDatePicker: false,
      selectedCategory: null,
      years,
      months,
      days,
      datePickerValue: [yearIndex, monthIndex, dayIndex],
      tempDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    }
  },
  computed: {
    ...mapGetters('category', [
      'expenseCategories',
      'incomeCategories',
      'getCategoryById'
    ]),
    
    currentCategories() {
      return this.form.type === '支出' ? this.expenseCategories : this.incomeCategories
    }
  },
  methods: {
    ...mapActions('bill', [
      'addBill',
      'calculateSummary'
    ]),
    
    switchType(type) {
      this.form.type = type
      // 切换类型时清空已选分类
      this.form.categoryId = null
      this.form.categoryName = ''
      this.form.categoryIcon = ''
    },
    
    getCategoryName(type, id) {
      const category = this.getCategoryById(type === '支出' ? 'expense' : 'income', id)
      return category ? category.name : ''
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const parts = dateString.split('-')
      if (parts.length !== 3) return dateString
      
      return `${parts[0]}年${parts[1]}月${parts[2]}日`
    },
    
    selectCategory(category) {
      this.selectedCategory = category
      this.form.categoryId = category.id
      this.form.categoryName = category.name
      this.form.categoryIcon = category.icon
    },
    
    confirmCategory() {
      this.showCategoryPicker = false
    },
    
    datePickerChange(e) {
      const values = e.detail.value
      const year = this.years[values[0]]
      const month = this.months[values[1]]
      const day = this.days[values[2]]
      
      this.datePickerValue = values
      this.tempDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    },
    
    confirmDate() {
      this.form.date = this.tempDate
      this.showDatePicker = false
    },
    
    async saveBill() {
      // 表单验证
      if (!this.form.amount || isNaN(parseFloat(this.form.amount))) {
        uni.showToast({
          title: '请输入有效金额',
          icon: 'none'
        })
        return
      }
      
      if (!this.form.categoryId) {
        uni.showToast({
          title: '请选择分类',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      
      try {
        // 完善表单数据
        const amount = parseFloat(this.form.amount)
        const billData = {
          ...this.form,
          amount,
          title: this.form.title || `${this.form.categoryName} ${amount.toFixed(2)}元`,
          isSettled: true
        }
        
        // 添加账单
        const result = await this.addBill(billData)
        
        if (result) {
          // 重新计算汇总数据
          this.calculateSummary()
          
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          })
          
          // 返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: '添加失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('添加账单失败', error)
        uni.showToast({
          title: '添加账单失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.add-record-container {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  padding: 30rpx;
  background-color: #ffffff;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
  }
}

.type-switch {
  display: flex;
  background-color: #ffffff;
  padding: 0 30rpx;
  border-bottom: 1px solid #f5f5f5;
  
  .type-item {
    flex: 1;
    text-align: center;
    padding: 30rpx 0;
    font-size: 30rpx;
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
        width: 60rpx;
        height: 4rpx;
        background-color: #2979ff;
      }
    }
  }
}

.amount-input {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  
  .amount-label {
    font-size: 48rpx;
    margin-right: 20rpx;
  }
  
  .amount-field {
    flex: 1;
    font-size: 48rpx;
    font-weight: bold;
  }
}

.form-content {
  background-color: #ffffff;
  padding: 0 30rpx;
  
  .category-select, .date-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    .placeholder {
      color: #c0c4cc;
    }
  }
}

.button-container {
  padding: 60rpx 30rpx;
}

.picker-header {
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

.category-list {
  display: flex;
  flex-wrap: wrap;
  padding: 30rpx;
  
  .category-item {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 0;
    
    u-icon {
      margin-bottom: 10rpx;
    }
    
    text {
      font-size: 26rpx;
    }
    
    &.active {
      color: #2979ff;
    }
  }
}

.date-picker {
  height: 500rpx;
  
  .picker-item {
    line-height: 50px;
    text-align: center;
  }
}
</style> 