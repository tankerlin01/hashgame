<template>
  <div class="update-data">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>⬆️ 更新数据</span>
        </div>
      </template>
      
      <!-- 文本输入区域 -->
      <div class="text-input-section">
        <el-alert
          title="格式说明"
          description="请按照 GameID: 开奖结果 的形式贴入，每行一条记录。例如：940600: A"
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom: 16px;"
        />
        
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="8"
          placeholder="请贴入数据，格式：GameID: 开奖结果
例如：
940600: A
940599: C
940598: 4"
        />
        
        <div class="input-actions">
          <el-button 
            type="primary" 
            @click="parseAndPreview"
            :disabled="!inputText.trim()"
          >
            解析数据
          </el-button>
          <el-button @click="inputText = ''">清空</el-button>
        </div>
      </div>
      
      <!-- 更新记录折叠面板 -->
      <el-collapse v-model="activeCollapse" style="margin-top: 20px;">
        <el-collapse-item name="records">
          <template #title>
            <span>📋 更新记录 ({{ gameStore.updateRecords.length }})</span>
          </template>
          
          <div v-if="gameStore.updateRecords.length === 0" class="empty-records">
            <el-empty description="暂无更新记录" :image-size="60" />
          </div>
          
          <div v-else class="records-list">
            <div 
              v-for="record in gameStore.updateRecords" 
              :key="record.id"
              class="record-item"
            >
              <div class="record-time">{{ formatTime(record.updated_at) }}</div>
              <div class="record-result">{{ record.displayText }}</div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
    
    <!-- 二次确认弹窗 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认更新数据"
      width="600px"
    >
      <div class="preview-content">
        <p style="margin-bottom: 16px;">即将更新以下 <strong>{{ parsedGames.length }}</strong> 条记录：</p>
        
        <div class="preview-list">
          <div 
            v-for="game in parsedGames.slice(0, 10)" 
            :key="game.game_id"
            class="preview-item"
          >
            <span class="game-id">#{{ game.game_id }}</span>
            <span 
              class="game-result"
              :class="getResultClass(game.result)"
            >
              {{ game.result.toUpperCase() }}
            </span>
          </div>
          <div v-if="parsedGames.length > 10" class="preview-more">
            ... 还有 {{ parsedGames.length - 10 }} 条记录
          </div>
        </div>
        
        <el-alert
          v-if="duplicateGames.length > 0"
          :title="`其中 ${duplicateGames.length} 条记录已存在，将被跳过`"
          type="warning"
          show-icon
          :closable="false"
          style="margin-top: 16px;"
        />
      </div>
      
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdate">
          确认更新 ({{ newGames.length }}条新数据)
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useGameStore, type Game, type UpdateRecord } from '../stores/gameStore'

const gameStore = useGameStore()
const inputText = ref('')
const confirmDialogVisible = ref(false)
const parsedGames = ref<Game[]>([])
const activeCollapse = ref<string[]>([])

// 计算已存在的游戏
const duplicateGames = computed(() => {
  const existingIds = new Set(gameStore.games.map(g => g.game_id))
  return parsedGames.value.filter(g => existingIds.has(g.game_id))
})

// 计算新游戏（去重后）
const newGames = computed(() => {
  const existingIds = new Set(gameStore.games.map(g => g.game_id))
  return parsedGames.value.filter(g => !existingIds.has(g.game_id))
})

// 解析输入文本
const parseAndPreview = () => {
  const text = inputText.value.trim()
  if (!text) {
    ElMessage.warning('请输入数据')
    return
  }
  
  const lines = text.split('\n').filter(line => line.trim())
  const games: Game[] = []
  
  for (const line of lines) {
    // 支持多种分隔符：: ：空格
    const match = line.match(/(\d+)\s*[:：]\s*([0-9a-fA-F])/i)
    if (match) {
      const gameId = match[1]
      const result = match[2].toLowerCase()
      
      // 生成 block_height（基于 gameId）
      const blockHeight = 385729000 + parseInt(gameId.slice(-6))
      
      games.push({
        game_id: gameId,
        block_height: blockHeight,
        result: result,
        game_type: parseInt(gameId) % 3 === 0 ? 'tournament' : 'classic',
        created_at: new Date().toISOString()
      })
    }
  }
  
  if (games.length === 0) {
    ElMessage.error('未能解析到有效数据，请检查格式')
    return
  }
  
  // 按 game_id 降序排序
  games.sort((a, b) => parseInt(b.game_id) - parseInt(a.game_id))
  
  parsedGames.value = games
  confirmDialogVisible.value = true
}

// 确认更新
const confirmUpdate = () => {
  if (newGames.value.length === 0) {
    ElMessage.warning('所有记录已存在，无需更新')
    confirmDialogVisible.value = false
    return
  }
  
  // 添加新游戏
  for (const game of newGames.value) {
    gameStore.addGame(game)
  }
  
  // 生成更新记录
  const displayText = generateDisplayText(newGames.value.map(g => g.game_id))
  const record: UpdateRecord = {
    id: Date.now().toString(),
    updated_at: new Date().toISOString(),
    gameIds: newGames.value.map(g => g.game_id),
    displayText
  }
  gameStore.addUpdateRecord(record)
  
  ElMessage.success(`成功更新 ${newGames.value.length} 条记录`)
  
  // 重置
  inputText.value = ''
  parsedGames.value = []
  confirmDialogVisible.value = false
}

// 生成显示文本（例如：#940600、#940598-#940597）
const generateDisplayText = (gameIds: string[]): string => {
  if (gameIds.length === 0) return ''
  
  // 转为数字并排序
  const ids = gameIds.map(id => parseInt(id)).sort((a, b) => b - a)
  
  const parts: string[] = []
  let start = ids[0]
  let end = ids[0]
  
  for (let i = 1; i < ids.length; i++) {
    if (ids[i] === end - 1) {
      // 连续
      end = ids[i]
    } else {
      // 不连续，保存当前区间
      if (start === end) {
        parts.push(`#${start}`)
      } else {
        parts.push(`#${start}-#${end}`)
      }
      start = ids[i]
      end = ids[i]
    }
  }
  
  // 保存最后一个区间
  if (start === end) {
    parts.push(`#${start}`)
  } else {
    parts.push(`#${start}-#${end}`)
  }
  
  return parts.join('、')
}

// 格式化时间
const formatTime = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取结果样式类
const getResultClass = (result: string) => {
  const num = parseInt(result, 16)
  if (num <= 3) return 'result-low'
  if (num <= 7) return 'result-mid'
  if (num <= 11) return 'result-high'
  return 'result-max'
}

onMounted(() => {
  gameStore.loadGames()
  gameStore.loadUpdateRecords()
})
</script>

<style scoped>
.card-header {
  font-size: 18px;
  font-weight: 500;
}

.text-input-section {
  margin-bottom: 20px;
}

.input-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.empty-records {
  padding: 20px 0;
}

.records-list {
  max-height: 300px;
  overflow-y: auto;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.2s;
}

.record-item:hover {
  background-color: #f5f7fa;
}

.record-item:last-child {
  border-bottom: none;
}

.record-time {
  color: #909399;
  font-size: 14px;
}

.record-result {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.preview-content {
  max-height: 400px;
  overflow-y: auto;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.game-id {
  color: #606266;
  font-size: 14px;
}

.game-result {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.result-low { background-color: #67c23a; }
.result-mid { background-color: #409eff; }
.result-high { background-color: #e6a23c; }
.result-max { background-color: #f56c6c; }

.preview-more {
  width: 100%;
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 8px;
}
</style>
