<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <u-avatar :text="userInitials" size="large" bg-color="#2979ff"></u-avatar>
        <view class="user-details">
          <text class="username">{{ currentUser.name || '用户' }}</text>
          <text class="email">{{ currentUser.email || '' }}</text>
        </view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-card">
      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('/pages/category/index')">
          <view class="menu-icon">
            <u-icon name="list" size="40" color="#2979ff"></u-icon>
          </view>
          <view class="menu-content">
            <text class="menu-title">分类管理</text>
          </view>
          <u-icon name="arrow-right" size="30" color="#c0c4cc"></u-icon>
        </view>
        
        <view class="menu-item" @click="navigateTo('/pages/budget/index')">
          <view class="menu-icon">
            <u-icon name="wallet" size="40" color="#ff9800"></u-icon>
          </view>
          <view class="menu-content">
            <text class="menu-title">预算管理</text>
          </view>
          <u-icon name="arrow-right" size="30" color="#c0c4cc"></u-icon>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-item" @click="showExportOption = true">
          <view class="menu-icon">
            <u-icon name="download" size="40" color="#4caf50"></u-icon>
          </view>
          <view class="menu-content">
            <text class="menu-title">导出数据</text>
          </view>
          <u-icon name="arrow-right" size="30" color="#c0c4cc"></u-icon>
        </view>
        
        <view class="menu-item" @click="clearCache">
          <view class="menu-icon">
            <u-icon name="trash" size="40" color="#f44336"></u-icon>
          </view>
          <view class="menu-content">
            <text class="menu-title">清除缓存</text>
          </view>
          <u-icon name="arrow-right" size="30" color="#c0c4cc"></u-icon>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-item" @click="showAbout">
          <view class="menu-icon">
            <u-icon name="info-circle" size="40" color="#607d8b"></u-icon>
          </view>
          <view class="menu-content">
            <text class="menu-title">关于应用</text>
          </view>
          <u-icon name="arrow-right" size="30" color="#c0c4cc"></u-icon>
        </view>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-button">
      <u-button type="error" @click="handleLogout" :loading="loading">退出登录</u-button>
    </view>
    
    <!-- 导出数据选项弹窗 -->
    <u-popup v-model="showExportOption" mode="bottom">
      <view class="popup-header">
        <text class="title">导出数据</text>
        <u-icon name="close" size="30" color="#909399" @click="showExportOption = false"></u-icon>
      </view>
      <view class="popup-content">
        <view class="export-option" @click="exportData('excel')">
          <u-icon name="file-text" size="40" color="#4caf50"></u-icon>
          <text>导出为Excel</text>
        </view>
        <view class="export-option" @click="exportData('csv')">
          <u-icon name="grid" size="40" color="#2979ff"></u-icon>
          <text>导出为CSV</text>
        </view>
        <view class="export-option" @click="exportData('json')">
          <u-icon name="file" size="40" color="#ff9800"></u-icon>
          <text>导出为JSON</text>
        </view>
      </view>
    </u-popup>
    
    <!-- 关于应用弹窗 -->
    <u-popup v-model="showAboutPopup" mode="center">
      <view class="about-popup">
        <view class="app-logo">
          <image src="/static/logo.png" mode="aspectFit"></image>
        </view>
        <view class="app-info">
          <text class="app-name">记账小程序</text>
          <text class="app-version">版本：1.0.0</text>
        </view>
        <view class="app-desc">
          <text>基于uniapp和uviewUI的记账小程序，使用JSONPlaceholder API进行开发和测试。</text>
        </view>
        <u-button type="primary" size="medium" @click="showAboutPopup = false">关闭</u-button>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { clearAll } from '@/utils/storage'

export default {
  data() {
    return {
      loading: false,
      showExportOption: false,
      showAboutPopup: false
    }
  },
  computed: {
    ...mapGetters('user', [
      'currentUser',
      'isLoggedIn'
    ]),
    ...mapGetters('bill', [
      'allBills'
    ]),
    
    userInitials() {
      if (!this.currentUser.name) return 'U'
      const names = this.currentUser.name.split(' ')
      if (names.length > 1) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
  },
  onShow() {
    // 检查登录状态
    if (!this.isLoggedIn) {
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }
  },
  methods: {
    ...mapActions('user', [
      'logout'
    ]),
    
    navigateTo(url) {
      uni.navigateTo({
        url
      })
    },
    
    async handleLogout() {
      this.loading = true
      
      try {
        await this.logout()
        
        uni.showToast({
          title: '退出成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/index'
          })
        }, 1500)
      } catch (error) {
        console.error('退出登录失败', error)
        uni.showToast({
          title: '退出登录失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    clearCache() {
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除所有缓存数据吗？此操作不可恢复。',
        success: (res) => {
          if (res.confirm) {
            // 清除所有本地存储
            clearAll()
            
            uni.showToast({
              title: '清除成功',
              icon: 'success'
            })
            
            // 返回登录页
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/index'
              })
            }, 1500)
          }
        }
      })
    },
    
    showAbout() {
      this.showAboutPopup = true
    },
    
    exportData(type) {
      // 这里模拟导出功能，实际应用中应该实现真正的导出
      
      // 构造导出数据
      const exportData = {
        bills: this.allBills,
        user: this.currentUser,
        exportTime: new Date().toISOString(),
        exportType: type
      }
      
      // 控制台输出数据（真实应用中应该生成文件并下载）
      console.log('导出数据', exportData)
      
      // 关闭弹窗
      this.showExportOption = false
      
      // 显示提示
      uni.showToast({
        title: '导出成功',
        icon: 'success'
      })
      
      // 实际导出提示
      setTimeout(() => {
        uni.showModal({
          title: '导出成功',
          content: `数据已成功导出为${type.toUpperCase()}格式。注意：这是一个模拟导出，实际应用中应该实现真正的文件导出功能。`,
          showCancel: false
        })
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding-bottom: 40rpx;
}

.user-card {
  background-color: #2979ff;
  padding: 40rpx 30rpx;
  color: #ffffff;
  
  .user-info {
    display: flex;
    align-items: center;
    
    .user-details {
      margin-left: 30rpx;
      
      .username {
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .email {
        font-size: 24rpx;
        opacity: 0.8;
      }
    }
  }
}

.menu-card {
  margin: 30rpx;
  
  .menu-group {
    background-color: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    margin-bottom: 30rpx;
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1px solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .menu-icon {
        margin-right: 20rpx;
      }
      
      .menu-content {
        flex: 1;
        
        .menu-title {
          font-size: 30rpx;
        }
      }
    }
  }
}

.logout-button {
  margin: 60rpx 30rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f5f5f5;
  
  .title {
    font-size: 32rpx;
    font-weight: bold;
  }
}

.popup-content {
  padding: 30rpx;
  display: flex;
  justify-content: space-around;
  
  .export-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30rpx;
    
    text {
      margin-top: 20rpx;
      font-size: 28rpx;
    }
  }
}

.about-popup {
  background-color: #ffffff;
  border-radius: 12rpx;
  width: 600rpx;
  padding: 40rpx;
  
  .app-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 30rpx;
    
    image {
      width: 150rpx;
      height: 150rpx;
    }
  }
  
  .app-info {
    text-align: center;
    margin-bottom: 30rpx;
    
    .app-name {
      font-size: 36rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .app-version {
      font-size: 28rpx;
      color: #909399;
    }
  }
  
  .app-desc {
    font-size: 28rpx;
    color: #606266;
    margin-bottom: 40rpx;
    text-align: center;
    line-height: 1.5;
  }
}
</style> 