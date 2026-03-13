<template>
  <div class="home">
    <!-- Hero Section -->
    <el-row :gutter="20" class="hero-section">
      <el-col :span="24">
        <el-card class="hero-card">
          <div class="hero-content">
            <h1 class="hero-title">🎲 Hashgame AI 策略助手</h1>
            <p class="hero-subtitle">AI驱动的智能竞猜策略工具，通过历史数据分析，科学制定投注策略</p>
            <div class="hero-actions">
              <el-button type="primary" size="large" @click="$router.push('/strategy')">
                <el-icon><Magic /></el-icon> 生成策略
              </el-button>
              <el-button size="large" @click="$router.push('/history')">
                <el-icon><Clock /></el-icon> 查看历史
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent Trend Section -->
    <el-row :gutter="20" class="trend-section">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>📊 最近10轮趋势</span>
              <el-button link @click="$router.push('/history')">查看更多</el-button>
            </div>
          </template>
          
          <div v-if="recentGames.length" class="recent-games">
            <el-row :gutter="10">
              <el-col :span="24">
                <div class="game-flow">
                  <div
                    v-for="game in recentGames.slice(0, 10)"
                    :key="game.game_id"
                    class="game-item"
                  >
                    <div class="game-id">#{{ game.game_id }}</div>
                    <div
                      class="game-result"
                      :class="getResultClass(game.result)"
                    >
                      {{ game.result }}
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
            
            <el-divider />
            
            <h4>最近10轮字符统计</h4>
            <el-row :gutter="10">
              <el-col :span="24">
                <div class="char-stats">
                  <div
                    v-for="(count, char) in recentCharStats"
                    :key="char"
                    class="char-stat-item"
                  >
                    <div class="char-label">{{ char }}</div>
                    <div class="char-count">{{ count }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          
          <el-empty v-else description="暂无数据，请先更新历史数据" />
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Stats -->
    <el-row :gutter="20" class="stats-section">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-value">{{ totalGames }}</div>
          <div class="stat-label">历史局数</div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">{{ hotChar }}</div>
          <div class="stat-label">最热字符</div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="stat-card">
          <div class="stat-icon">🎲</div>
          <div class="stat-value">{{ savedStrategies.length }}</div>
          <div class="stat-label">已保存策略</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

const recentGames = computed(() => gameStore.games.slice(0, 10))
const totalGames = computed(() => gameStore.games.length)
const savedStrategies = computed(() => gameStore.strategies)

const recentCharStats = computed(() => {
  const stats: Record<string, number> = {}
  const chars = '0123456789abcdef'.split('')
  chars.forEach(c => stats[c] = 0)
  
  recentGames.value.forEach(game => {
    if (game.result) {
      stats[game.result] = (stats[game.result] || 0) + 1
    }
  })
  
  return stats
})

const hotChar = computed(() => {
  const stats = recentCharStats.value
  let maxChar = '-'
  let maxCount = 0
  
  Object.entries(stats).forEach(([char, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxChar = char
    }
  })
  
  return maxCount > 0 ? maxChar.toUpperCase() : '-'
})

const getResultClass = (result: string) => {
  const num = parseInt(result, 16)
  if (num <= 3) return 'result-low'
  if (num <= 7) return 'result-mid'
  if (num <= 11) return 'result-high'
  return 'result-max'
}

onMounted(() => {
  gameStore.loadGames()
})
</script>

<style scoped>
.hero-section {
  margin-bottom: 20px;
}

.hero-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.hero-content {
  text-align: center;
  padding: 40px 20px;
  color: white;
}

.hero-title {
  font-size: 36px;
  margin-bottom: 16px;
  font-weight: 600;
}

.hero-subtitle {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.trend-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 20px 0;
}

.game-item {
  text-align: center;
  min-width: 60px;
}

.game-id {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.game-result {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin: 0 auto;
}

.result-low { background-color: #67c23a; }
.result-mid { background-color: #409eff; }
.result-high { background-color: #e6a23c; }
.result-max { background-color: #f56c6c; }

.char-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 20px 0;
}

.char-stat-item {
  text-align: center;
  min-width: 50px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
}

.char-label {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.char-count {
  font-size: 14px;
  color: #606266;
}

.stats-section {
  margin-top: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style>
