<template>
  <div class="strategy">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🎯 AI 策略生成</span>
        </div>
      </template>
      
      <!-- Round Selection -->
      <div class="round-selection">
        <h4>选择投注轮数</h4>
        <el-radio-group v-model="selectedRounds" size="large">
          <el-radio-button :label="5">5轮</el-radio-button>
          <el-radio-button :label="25">25轮</el-radio-button>
          <el-radio-button :label="50">50轮</el-radio-button>
        </el-radio-group>
      </div>
      
      <el-divider />
      
      <!-- Current Stats Summary -->
      <div class="stats-summary">
        <h4>📊 当前数据摘要</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="历史局数">{{ gameStore.totalGames }}</el-descriptions-item>
          <el-descriptions-item label="最热字符">{{ hotChar.toUpperCase() }}</el-descriptions-item>
          <el-descriptions-item label="最冷字符">{{ coldChar.toUpperCase() }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin-top: 20px;">最近100轮字符分布</h4>
        <div class="mini-stats">
          <div
            v-for="(count, char) in recentStats"
            :key="char"
            class="mini-stat-item"
          >
            <span class="mini-char">{{ char.toUpperCase() }}</span>
            <span class="mini-count">{{ count }}</span>
          </div>
        </div>
      </div>
      
      <el-divider />
      
      <!-- Generate Button -->
      <div class="generate-section">
        <el-button
          type="primary"
          size="large"
          :loading="generating"
          @click="generateStrategy"
        >
          <el-icon><Magic /></el-icon>
          生成 AI 策略
        </el-button>
      </div>
      
      <!-- Generated Strategy -->
      <div v-if="generatedStrategy.length" class="strategy-result">
        <h4>🎲 AI 策略建议</h4>
        
        <el-table :data="generatedStrategy" stripe>
          <el-table-column prop="round" label="轮次" width="100" />
          <el-table-column label="建议投注" width="150">
            <template #default="{ row }">
              <el-select v-model="row.bet" size="small">
                <el-option
                  v-for="char in chars"
                  :key="char"
                  :label="char.toUpperCase()"
                  :value="char"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="confidence" label="置信度" width="120">
            <template #default="{ row }">
              <el-tag :type="row.confidence > 0.7 ? 'success' : row.confidence > 0.4 ? 'warning' : 'info'">
                {{ (row.confidence * 100).toFixed(0) }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="策略理由" />
        </el-table>
        
        <div class="strategy-actions">
          <el-button type="success" @click="saveStrategy">
            <el-icon><Check /></el-icon> 保存策略
          </el-button>
          <el-button @click="copyStrategy">
            <el-icon><CopyDocument /></el-icon> 一键复制
          </el-button>
          <el-button plain @click="generateStrategy">重新生成</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const selectedRounds = ref(5)
const generating = ref(false)
const generatedStrategy = ref<any[]>([])

const chars = '0123456789abcdef'.split('')

const recentStats = computed(() => {
  return gameStore.getCharStatsByRange(100)
})

const sortedStats = computed(() => {
  return Object.entries(recentStats.value)
    .sort((a, b) => b[1] - a[1])
})

const hotChar = computed(() => sortedStats.value[0]?.[0] || '-')
const coldChar = computed(() => sortedStats.value[sortedStats.value.length - 1]?.[0] || '-')

// Simulated AI strategy generation
const generateStrategy = async () => {
  generating.value = true
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const stats = recentStats.value
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1])
  
  generatedStrategy.value = Array.from({ length: selectedRounds.value }, (_, i) => {
    const round = i + 1
    // Simple algorithm: prefer hot chars early, then mix
    let bet, confidence, reason
    
    if (round <= 3) {
      bet = sorted[0][0]
      confidence = 0.6 + Math.random() * 0.2
      reason = '热字符延续策略'
    } else if (round <= 6) {
      bet = sorted[1][0]
      confidence = 0.5 + Math.random() * 0.2
      reason = '次热字符轮换'
    } else {
      const randomIdx = Math.floor(Math.random() * 5)
      bet = sorted[randomIdx][0]
      confidence = 0.4 + Math.random() * 0.2
      reason = '均衡分散策略'
    }
    
    return { round, bet, confidence, reason }
  })
  
  generating.value = false
  ElMessage.success('策略生成成功！')
}

const saveStrategy = () => {
  const strategy = {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    rounds: selectedRounds.value,
    bets: generatedStrategy.value.map(s => s.bet),
    results: [],
    status: 'pending'
  }
  
  gameStore.addStrategy(strategy)
  ElMessage.success('策略已保存！')
}

const copyStrategy = () => {
  const text = generatedStrategy.value
    .map(s => `第${s.round}轮: ${s.bet.toUpperCase()}`)
    .join('\n')
  
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板！')
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

.round-selection {
  text-align: center;
  padding: 20px;
}

.round-selection h4 {
  margin-bottom: 16px;
}

.stats-summary {
  padding: 20px;
}

.mini-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.mini-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  min-width: 50px;
}

.mini-char {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.mini-count {
  font-size: 14px;
  color: #409eff;
}

.generate-section {
  text-align: center;
  padding: 20px;
}

.strategy-result {
  margin-top: 20px;
}

.strategy-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
