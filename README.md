# WalletWise 智慧钱包

WalletWise是一款简洁高效的移动记账应用，帮助用户轻松管理个人财务、跟踪收支、分析消费习惯并实现预算目标。

![WalletWise Logo](./static/logo.png)

## 📱 应用功能

### 💵 账单记录
- 便捷记录日常收支
- 自定义分类和备注
- 按日期查看账单明细
- 支持多种账单分类

### 📊 统计分析
- 图表化展示收支情况
- 按分类汇总消费情况
- 支持周、月、年度数据筛选
- 直观了解消费趋势

### 💰 预算管理
- 设置月度总预算
- 创建分类预算限额
- 追踪预算使用进度
- 预算超支提醒

### 🏷️ 分类管理
- 收入/支出分类自定义
- 灵活添加、编辑分类
- 丰富图标选择
- 一键重置默认分类

### 👤 个人中心
- 用户信息管理
- 数据导出功能
- 缓存清理
- 系统设置

## 🚀 技术栈

- 框架：uni-app
- UI组件：uView UI
- 状态管理：Vuex
- 数据存储：本地缓存 + 模拟API
- 图表库：内置图表组件

## 💻 安装使用

1. 克隆项目
```bash
git clone https://github.com/yourusername/walletwise.git
cd walletwise
```

2. 安装依赖
```bash
npm install
```

3. 开发模式运行
```bash
npm run dev
```

4. 构建发布
```bash
npm run build
```

## 📝 项目结构

```
src/
├── api/            # API接口
├── pages/          # 页面组件
│   ├── budget/     # 预算管理
│   ├── category/   # 分类管理
│   ├── index/      # 首页
│   ├── login/      # 登录页
│   ├── profile/    # 个人中心
│   ├── record/     # 账单记录
│   └── statistics/ # 统计分析
├── store/          # Vuex状态管理
├── utils/          # 工具函数
└── static/         # 静态资源
```

## 📱 预览

通过HBuilderX可以在各种平台预览：
- Android/iOS
- 微信小程序
- H5网页

## 🔐 登录说明

应用使用JSONPlaceholder模拟API，可使用以下用户名登录：
- Bret
- Antonette
- Samantha
- 等JSONPlaceholder提供的用户名

## 📄 许可证

[MIT License](LICENSE)
