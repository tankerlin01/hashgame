<template>
  <div class="update-data">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>⬆️ 更新数据</span>
        </div>
      </template>
      
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :http-request="handleUpload"
        :show-file-list="false"
        accept="image/png, image/jpeg"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处 或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            请上传包含游戏记录的 PNG/JPG 图片
          </div>
        </template>
      </el-upload>
      
      <el-divider />
      
      <div v-if="imageUrl" class="image-preview">
        <h4>图片预览</h4>
        <el-image :src="imageUrl" fit="contain" style="max-height: 300px; border: 1px solid #dcdfe6; border-radius: 4px;" />
      </div>
      
      <div v-if="recognizing" class="recognition-result">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="resultForm.game_id" class="recognition-result">
        <h4>🤖 AI 识别结果 (请核对)</h4>
        <el-form :model="resultForm" label-width="100px">
          <el-form-item label="Game ID">
            <el-input v-model="resultForm.game_id" />
          </el-form-item>
          <el-form-item label="区块高度">
            <el-input v-model="resultForm.block_height" />
          </el-form-item>
          <el-form-item label="开奖结果">
            <el-select v-model="resultForm.result">
              <el-option
                v-for="char in chars"
                :key="char"
                :label="char.toUpperCase()"
                :value="char"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="游戏类型">
            <el-radio-group v-model="resultForm.game_type">
              <el-radio label="classic">经典赛</el-radio>
              <el-radio label="tournament">锦标赛</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveResult">确认并保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useGameStore, type Game } from '../stores/gameStore'

const gameStore = useGameStore()
const imageUrl = ref('')
const recognizing = ref(false)
const resultForm = ref({
  game_id: '',
  block_height: '',
  result: '',
  game_type: 'classic'
})

const chars = '0123456789abcdef'.split('')

const handleUpload = async (options: any) => {
  recognizing.value = true
  const file = options.file
  imageUrl.value = URL.createObjectURL(file)
  
  // TODO: Replace with actual Kimi API call
  // For now, simulate API response
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  resultForm.value = {
    game_id: `MOCK_${Math.floor(Math.random() * 10000)}`,
    block_height: `850${Math.floor(Math.random() * 1000)}`,
    result: chars[Math.floor(Math.random() * 16)],
    game_type: 'classic'
  }
  
  recognizing.value = false
  ElMessage.success('图片识别成功！请核对结果。')
}

const saveResult = () => {
  const newGame: Game = {
    game_id: resultForm.value.game_id,
    block_height: parseInt(resultForm.value.block_height, 10),
    result: resultForm.value.result,
    game_type: resultForm.value.game_type as 'classic' | 'tournament',
    created_at: new Date().toISOString()
  }
  
  gameStore.addGame(newGame)
  ElMessage.success('数据保存成功！')
  
  // Reset
  imageUrl.value = ''
  resultForm.value = {
    game_id: '',
    block_height: '',
    result: '',
    game_type: 'classic'
  }
}
</script>

<style scoped>
.card-header {
  font-size: 18px;
  font-weight: 500;
}

.upload-demo {
  text-align: center;
}

.image-preview {
  margin-top: 20px;
  text-align: center;
}

.recognition-result {
  margin-top: 20px;
}
</style>
