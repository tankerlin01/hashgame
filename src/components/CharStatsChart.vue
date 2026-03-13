<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const props = defineProps<{
  stats: Record<string, number>
}>()

const barOption = ref({})
const pieOption = ref({})

const updateCharts = () => {
  const sortedData = Object.entries(props.stats).sort((a, b) => b[1] - a[1])
  const chars = sortedData.map(item => item[0].toUpperCase())
  const counts = sortedData.map(item => item[1])
  
  barOption.value = {
    title: { text: '字符频次柱状图' },
    tooltip: {},
    xAxis: { data: chars },
    yAxis: {},
    series: [
      {
        name: '出现次数',
        type: 'bar',
        data: counts,
      },
    ],
  }

  pieOption.value = {
    title: {
      text: '字符频次饼图',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '字符占比',
        type: 'pie',
        radius: '50%',
        data: sortedData.map(([char, count]) => ({ value: count, name: char.toUpperCase() })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
}

onMounted(updateCharts)
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <v-chart class="chart" :option="barOption" autoresize />
    </el-col>
    <el-col :span="12">
      <v-chart class="chart" :option="pieOption" autoresize />
    </el-col>
  </el-row>
</template>

<style scoped>
.chart {
  height: 400px;
}
</style>
