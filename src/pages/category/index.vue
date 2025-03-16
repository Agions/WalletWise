<template>
  <view class="category-container">
    <view class="header">
      <text class="title">分类管理</text>
    </view>
    
    <!-- 类型切换 -->
    <view class="type-switch">
      <view 
        class="switch-item" 
        :class="{ active: activeType === 'expense' }"
        @click="switchType('expense')">
        <text>支出分类</text>
      </view>
      <view 
        class="switch-item" 
        :class="{ active: activeType === 'income' }"
        @click="switchType('income')">
        <text>收入分类</text>
      </view>
    </view>
    
    <!-- 分类列表 -->
    <view class="category-list">
      <view 
        v-for="category in currentCategories" 
        :key="category.id"
        class="category-item">
        <view class="category-info">
          <view class="category-icon">
            <u-icon :name="category.icon" size="40" :color="activeType === 'expense' ? '#ff5722' : '#4caf50'"></u-icon>
          </view>
          <view class="category-name">
            <text>{{ category.name }}</text>
          </view>
        </view>
        <view class="category-actions">
          <view class="action-button" @click="editCategory(category)">
            <u-icon name="edit-pen" size="36" color="#909399"></u-icon>
          </view>
          <view class="action-button" @click="deleteCategory(category.id)" v-if="!isDefaultCategory(category.id)">
            <u-icon name="trash" size="36" color="#909399"></u-icon>
          </view>
        </view>
      </view>
      
      <!-- 添加分类按钮 -->
      <view class="add-category" @click="showAddCategory = true">
        <u-icon name="plus" size="40" color="#2979ff"></u-icon>
        <text>添加分类</text>
      </view>
    </view>
    
    <!-- 重置按钮 -->
    <view class="reset-button">
      <u-button type="error" @click="resetCategories">重置为默认分类</u-button>
    </view>
    
    <!-- 添加/编辑分类弹窗 -->
    <u-popup v-model="showAddCategory" mode="bottom">
      <view class="popup-header">
        <text class="cancel" @click="showAddCategory = false">取消</text>
        <text class="title">{{ isEdit ? '编辑分类' : '添加分类' }}</text>
        <text class="confirm" @click="saveCategory">确定</text>
      </view>
      <view class="popup-content">
        <view class="form-item">
          <text class="label">名称</text>
          <input 
            type="text"
            v-model="categoryForm.name"
            placeholder="请输入分类名称"
            class="input" />
        </view>
        
        <view class="form-item">
          <text class="label">图标</text>
          <view class="icon-grid">
            <view 
              v-for="(icon, index) in iconList" 
              :key="index"
              class="icon-item"
              :class="{ active: categoryForm.icon === icon }"
              @click="categoryForm.icon = icon">
              <u-icon :name="icon" size="40" :color="categoryForm.icon === icon ? '#2979ff' : '#c0c4cc'"></u-icon>
            </view>
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
      activeType: 'expense', // 'expense' 或 'income'
      showAddCategory: false,
      isEdit: false,
      editingCategoryId: null,
      categoryForm: {
        name: '',
        icon: 'home'
      },
      iconList: [
        'home', 'shopping-cart', 'car', 'restaurant', 'film', 
        'book', 'shirt', 'gift', 'coffee', 'plane', 'phone',
        'train', 'basket', 'heart', 'star', 'basketball',
        'football', 'computer', 'photo', 'music', 'plus-square',
        'briefcase', 'award', 'clock', 'trending-up', 'more-horizontal'
      ]
    }
  },
  computed: {
    ...mapGetters('category', [
      'expenseCategories',
      'incomeCategories'
    ]),
    
    currentCategories() {
      return this.activeType === 'expense' ? this.expenseCategories : this.incomeCategories
    }
  },
  onShow() {
    this.loadCategories()
  },
  methods: {
    ...mapActions('category', [
      'fetchCategories',
      'addCategory',
      'updateCategory',
      'deleteCategory',
      'resetCategories'
    ]),
    
    async loadCategories() {
      try {
        await this.fetchCategories()
      } catch (error) {
        console.error('加载分类失败', error)
        uni.showToast({
          title: '加载分类失败',
          icon: 'none'
        })
      }
    },
    
    switchType(type) {
      this.activeType = type
    },
    
    editCategory(category) {
      this.isEdit = true
      this.editingCategoryId = category.id
      this.categoryForm = {
        name: category.name,
        icon: category.icon
      }
      this.showAddCategory = true
    },
    
    async saveCategory() {
      // 表单验证
      if (!this.categoryForm.name.trim()) {
        uni.showToast({
          title: '请输入分类名称',
          icon: 'none'
        })
        return
      }
      
      try {
        if (this.isEdit) {
          // 编辑分类
          await this.updateCategory({
            type: this.activeType,
            id: this.editingCategoryId,
            data: this.categoryForm
          })
          
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          })
        } else {
          // 添加分类
          await this.addCategory({
            type: this.activeType,
            category: this.categoryForm
          })
          
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          })
        }
        
        // 关闭弹窗并重置表单
        this.showAddCategory = false
        this.resetForm()
        
      } catch (error) {
        console.error('保存分类失败', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    
    async deleteCategory(id) {
      // 默认分类不允许删除
      if (this.isDefaultCategory(id)) {
        uni.showToast({
          title: '默认分类不能删除',
          icon: 'none'
        })
        return
      }
      
      uni.showModal({
        title: '删除分类',
        content: '确定要删除此分类吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.deleteCategory({
                type: this.activeType,
                id
              })
              
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } catch (error) {
              console.error('删除分类失败', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    isDefaultCategory(id) {
      // 判断是否是默认分类（这里简单判断ID范围）
      if (this.activeType === 'expense') {
        return id <= 8 // 默认支出分类ID范围
      } else {
        return id >= 100 && id <= 105 // 默认收入分类ID范围
      }
    },
    
    async resetCategories() {
      uni.showModal({
        title: '重置分类',
        content: '确定要重置所有分类为默认值吗？自定义分类将被删除。',
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.resetCategories()
              
              uni.showToast({
                title: '重置成功',
                icon: 'success'
              })
            } catch (error) {
              console.error('重置分类失败', error)
              uni.showToast({
                title: '重置失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    resetForm() {
      this.isEdit = false
      this.editingCategoryId = null
      this.categoryForm = {
        name: '',
        icon: 'home'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.category-container {
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

.type-switch {
  display: flex;
  margin: 0 30rpx 30rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
  
  .switch-item {
    flex: 1;
    padding: 20rpx 0;
    text-align: center;
    font-size: 28rpx;
    
    &.active {
      background-color: #2979ff;
      color: #ffffff;
    }
  }
}

.category-list {
  margin: 0 30rpx;
  
  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    background-color: #ffffff;
    margin-bottom: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .category-info {
      display: flex;
      align-items: center;
      
      .category-icon {
        margin-right: 20rpx;
      }
      
      .category-name {
        font-size: 30rpx;
      }
    }
    
    .category-actions {
      display: flex;
      
      .action-button {
        padding: 10rpx;
        margin-left: 10rpx;
      }
    }
  }
  
  .add-category {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 0;
    background-color: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    text {
      margin-top: 10rpx;
      font-size: 28rpx;
      color: #2979ff;
    }
  }
}

.reset-button {
  margin: 60rpx 30rpx;
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
  
  .cancel, .confirm {
    font-size: 28rpx;
  }
  
  .cancel {
    color: #909399;
  }
  
  .confirm {
    color: #2979ff;
  }
}

.popup-content {
  padding: 30rpx;
  
  .form-item {
    margin-bottom: 30rpx;
    
    .label {
      font-size: 28rpx;
      color: #333;
      display: block;
      margin-bottom: 20rpx;
    }
    
    .input {
      height: 80rpx;
      border-bottom: 1px solid #eee;
      font-size: 30rpx;
    }
    
    .icon-grid {
      display: flex;
      flex-wrap: wrap;
      
      .icon-item {
        width: 20%;
        height: 100rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.active {
          background-color: rgba(41, 121, 255, 0.1);
          border-radius: 8rpx;
        }
      }
    }
  }
}
</style> 