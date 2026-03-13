<template>
  <div class="frequency">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📊 字符频次统计</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="最近100轮" name="100">
          <CharStatsChart :stats="getStats(100)" />
        </el-tab-pane>
        <el-tab-pane label="最近500轮" name="500">
          <CharStatsChart :stats="getStats(500)" />
        </el-tab-pane>
        <el-tab-pane label="全部历史" name="all">
          <CharStatsChart :stats="charStats" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import CharStatsChart from '../components/CharStatsChart.vue'

const gameStore = useGameStore()
const activeTab = ref('100')

const charStats = computed(() => gameStore.charStats)

const getStats = (range: number) => {
  return gameStore.getCharStatsByRange(range)
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
</style>
