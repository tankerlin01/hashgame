<template>
  <el-container>
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h3>🎲 Hashgame AI</h3>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <el-menu-item index="/frequency">
          <el-icon><Histogram /></el-icon>
          <span>字符频次统计</span>
        </el-menu-item>
        
        <el-menu-item index="/history">
          <el-icon><Clock /></el-icon>
          <span>开奖结果统计</span>
        </el-menu-item>
        
        <el-menu-item index="/strategy">
          <el-icon><Magic /></el-icon>
          <span>生成策略</span>
        </el-menu-item>
        
        <el-menu-item index="/my-strategies">
          <el-icon><Document /></el-icon>
          <span>我的策略</span>
        </el-menu-item>
        
        <el-menu-item index="/update">
          <el-icon><Upload /></el-icon>
          <span>更新数据</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <span class="header-title">{{ $route.meta.title || 'Hashgame AI 策略助手' }}</span>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.sidebar {
  background-color: #304156;
  min-height: 100vh;
}

.logo {
  padding: 20px;
  text-align: center;
  color: white;
  border-bottom: 1px solid #1f2d3d;
}

.logo h3 {
  margin: 0;
  font-size: 18px;
}

.el-menu-vertical {
  border-right: none;
}

.header {
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-title {
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.main-content {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}
</style>
