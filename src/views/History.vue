<template>
  <div class="history">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📜 开奖结果统计</span>
        </div>
      </template>
      
      <!-- Stats Cards -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="24">
          <el-tabs v-model="range" type="border-card" @tab-change="updateStats">
            <el-tab-pane
              v-for="r in ranges"
              :key="r.value"
              :label="r.label"
              :name="r.value"
            >
              <div class="char-grid">
                <div
                  v-for="char in chars"
                  :key="char"
                  class="char-card"
                  :class="{ 'is-hot': isHotChar(char), 'is-cold': isColdChar(char) }"
                >
                  <div class="char-name">{{ char.toUpperCase() }}</div>
                  <div class="char-value">{{ currentStats[char] || 0 }}</div>
                  <div v-if="getTrend(char)" class="char-trend">
                    {{ getTrend(char) }}
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      
      <el-divider />
      
      <!-- Game List -->
      <div class="game-list">
        <div class="game-list-header">
          <h4>🎮 游戏记录</h4>
          <el-input
            v-model="gameIdFilter"
            placeholder="输入 Game ID 筛选"
            clearable
            style="width: 200px"
          />
        </div>
        
        <el-table :data="filteredGames" stripe style="width: 100%">
          <el-table-column prop="game_id" label="Game ID" width="120" />
          <el-table-column label="开奖结果" width="100">
            <template #default="{ row }">
              <el-tag :type="getResultType(row.result)" effect="dark">
                {{ row.result.toUpperCase() }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间" min-width="180">
            <template #default="{ row }">
              {{ formatBeijingTime(row.created_at) }}
            </template>
          </el-table-column>
        </el-table>
        
        <div class="load-more">
          <el-button type="primary" plain @click="loadMore">加载更多</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const range = ref('100')
const pageSize = ref(20)
const gameIdFilter = ref('')

const ranges = [
  { label: '最近100轮', value: '100' },
  { label: '最近500轮', value: '500' },
  { label: '最近1000轮', value: '1000' },
  { label: '最近2000轮', value: '2000' },
  { label: '最近5000轮', value: '5000' },
  { label: '全部', value: 'all' }
]

const chars = '0123456789abcdef'.split('')

// 根据 game id 筛选游戏记录
const filteredGames = computed(() => {
  let result = gameStore.games
  
  // 根据 game id 筛选
  if (gameIdFilter.value.trim()) {
    const filter = gameIdFilter.value.trim().toLowerCase()
    result = result.filter(game => game.game_id.toLowerCase().includes(filter))
  }
  
  return result.slice(0, pageSize.value)
})

const currentStats = computed(() => {
  if (range.value === 'all') {
    return gameStore.charStats
  }
  return gameStore.getCharStatsByRange(parseInt(range.value))
})

const sortedChars = computed(() => {
  return Object.entries(currentStats.value)
    .sort((a, b) => b[1] - a[1])
    .map(([char]) => char)
})

const hotChars = computed(() => sortedChars.value.slice(0, 3))
const coldChars = computed(() => sortedChars.value.slice(-3))

const isHotChar = (char: string) => hotChars.value.includes(char)
const isColdChar = (char: string) => coldChars.value.includes(char)

// 格式化为北京时间
const formatBeijingTime = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const getTrend = (char: string) => {
  // Compare recent 100 vs previous 100
  const recent = gameStore.getCharStatsByRange(100)[char] || 0
  const prevGames = gameStore.games.slice(100, 200)
  const prevStats: Record<string, number> = {}
  prevGames.forEach(g => {
    prevStats[g.result] = (prevStats[g.result] || 0) + 1
  })
  const prev = prevStats[char] || 0
  
  if (recent > prev) return '🔼'
  if (recent < prev) return '🔽'
  return '➡️'
}

const getResultType = (result: string) => {
  const num = parseInt(result, 16)
  if (num <= 5) return 'success'
  if (num <= 10) return 'warning'
  return 'danger'
}

const loadMore = () => {
  pageSize.value += 20
}

const updateStats = () => {
  // Trigger re-computation
}

onMounted(() => {
  gameStore.loadGames()
})
</script>

<style scoped>
.card-header {
  font-size: 18px;
  font-weight: 500;
}

.stats-row {
  margin-bottom: 20px;
}

.char-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
  padding: 20px;
}

.char-card {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.char-card.is-hot {
  background: #fef0f0;
  border-color: #f56c6c;
}

.char-card.is-cold {
  background: #f4f4f5;
  border-color: #909399;
}

.char-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.char-value {
  font-size: 20px;
  color: #409eff;
  font-weight: 600;
}

.char-trend {
  font-size: 14px;
  margin-top: 4px;
}

.game-list {
  margin-top: 20px;
}

.game-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.game-list-header h4 {
  margin: 0;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}
</style>
