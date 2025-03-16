<template>
  <view class="login-container">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">记账小程序</text>
    </view>
    
    <view class="login-form">
      <u-form :model="form" ref="uForm">
        <u-form-item label="用户名" prop="username">
          <u-input v-model="form.username" placeholder="请输入用户名" />
        </u-form-item>
        <u-form-item label="密码" prop="password">
          <u-input v-model="form.password" type="password" placeholder="请输入密码" />
        </u-form-item>
      </u-form>
      
      <view class="tips">
        <text>提示：使用JSONPlaceholder的用户名登录，例如：Bret</text>
      </view>
      
      <view class="btn-container">
        <u-button type="primary" @click="handleLogin" :loading="loading">登录</u-button>
      </view>
    </view>
  </view>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      form: {
        username: '',
        password: 'password'
      },
      loading: false
    }
  },
  methods: {
    ...mapActions('user', ['login']),
    
    async handleLogin() {
      if (!this.form.username) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      
      try {
        const result = await this.login(this.form)
        
        if (result.success) {
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 跳转到首页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: result.message || '登录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '登录异常，请稍后再试',
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
.login-container {
  padding: 80rpx 50rpx;
  
  .login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 80rpx;
    
    .logo {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
    }
    
    .title {
      font-size: 40rpx;
      font-weight: bold;
    }
  }
  
  .login-form {
    .tips {
      font-size: 24rpx;
      color: #999;
      margin: 30rpx 0;
    }
    
    .btn-container {
      margin-top: 80rpx;
    }
  }
}
</style> 