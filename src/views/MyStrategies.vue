<template>
  <div class="my-strategies">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📚 我的策略记录</span>
          <el-radio-group v-model="statusFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="pending">待开奖</el-radio-button>
            <el-radio-button label="settled">已开奖</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <div v-if="filteredStrategies.length" class="strategy-list">
        <el-row :gutter="20">
          <el-col
            v-for="strategy in filteredStrategies"
            :key="strategy.id"
            :xs="24" :sm="12" :md="8"
            class="strategy-col"
          >
            <el-card class="strategy-card" :class="`status-${strategy.status}`">
              <template #header>
                <div class="strategy-card-header">
                  <span>策略 #{{ strategy.id.slice(-6) }}</span>
                  <el-tag :type="strategy.status === 'pending' ? 'warning' : 'success'">
                    {{ strategy.status === 'pending' ? '待开奖' : '已开奖' }}
                  </el-tag>
                </div>
              </template>
              
              <div class="strategy-details">
                <p><strong>轮数:</strong> {{ strategy.rounds }}</p>
                <p><strong>创建时间:</strong> {{ new Date(strategy.created_at).toLocaleString() }}</p>
                <p><strong>投注内容:</strong></p>
                <div class="bet-list">
                  <el-tag
                    v-for="(bet, index) in strategy.bets"
                    :key="index"
                    class="bet-tag"
                  >
                    {{ bet.toUpperCase() }}
                  </el-tag>
                </div>
                <div v-if="strategy.status === 'settled'">
                  <el-divider />
                  <p><strong>中奖率:</strong></p>
                  <el-progress :percentage="Math.round((strategy.win_rate || 0) * 100)" />
                </div>
              </div>
              
              <div class="strategy-actions" v-if="strategy.status === 'pending'">
                <el-button type="primary" plain @click="settleStrategy(strategy.id)">
                  结算
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <el-empty v-else description="暂无策略记录，快去生成一个吧！" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const statusFilter = ref('all')

const filteredStrategies = computed(() => {
  if (statusFilter.value === 'all') {
    return gameStore.strategies
  }
  return gameStore.strategies.filter(s => s.status === statusFilter.value)
})

const settleStrategy = async (id: string) => {
  const strategy = gameStore.strategies.find(s => s.id === id)
  if (!strategy) return

  ElMessageBox.prompt('请输入开奖结果 (用逗号分隔)', '结算策略', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  }).then(({ value }) => {
    if (!value) {
      ElMessage.warning('请输入开奖结果')
      return
    }
    
    const results = value.split(',').map(r => r.trim().toLowerCase())
    if (results.length !== strategy.rounds) {
      ElMessage.error(`请输入 ${strategy.rounds} 个开奖结果`)
      return
    }
    
    let wins = 0
    results.forEach((result, index) => {
      if (strategy.bets[index] === result) {
        wins++
      }
    })
    
    const winRate = wins / strategy.rounds
    
    gameStore.updateStrategy(id, {
      status: 'settled',
      results,
      win_rate: winRate,
    })
    
    ElMessage.success(`结算完成，中奖率: ${(winRate * 100).toFixed(0)}%`)
  })
}

onMounted(() => {
  gameStore.loadStrategies()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strategy-col {
  margin-bottom: 20px;
}

.strategy-card.status-pending {
  border-left: 5px solid #e6a23c;
}

.strategy-card.status-settled {
  border-left: 5px solid #67c23a;
}

.strategy-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strategy-details p {
  margin: 8px 0;
}

.bet-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.bet-tag {
  font-size: 14px;
}

.strategy-actions {
  margin-top: 16px;
  text-align: right;
}
</style>
