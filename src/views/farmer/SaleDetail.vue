<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  // BarChart,
//   LineChart,
//   PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import * as echarts from 'echarts'

use([GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])

// 模拟经营数据
const totalSales = ref(126800)
const totalOrders = ref(328)
const totalProducts = ref(42)
const bestSeller = ref('有机西红柿')

// 模拟每月销售额
const monthSales = ref([
  { month: '1月', value: 6200 },
  { month: '2月', value: 4800 },
  { month: '3月', value: 7900 },
  { month: '4月', value: 10200 },
  { month: '5月', value: 9000 },
  { month: '6月', value: 11800 },
  { month: '7月', value: 15600 },
  { month: '8月', value: 12800 },
  { month: '9月', value: 14200 },
  { month: '10月', value: 16200 },
])

onMounted(() => {
  const chart = echarts.init(document.getElementById('salesChart')!)
  chart.setOption({
    title: { text: '月度销售趋势', left: 'center' },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: monthSales.value.map(i => i.month)
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: monthSales.value.map(i => i.value),
        type: 'line',
        smooth: true
      }
    ]
  })
})
</script>

<template>
  <div class="dashboard-container">
    <h2>📊 商家经营数据总览</h2>

    <el-row :gutter="20" class="summary-row">
      <el-col :span="6">
        <el-card>
          <p class="label">销售总额</p>
          <p class="value">￥{{ totalSales.toLocaleString() }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <p class="label">订单数量</p>
          <p class="value">{{ totalOrders }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <p class="label">上架商品</p>
          <p class="value">{{ totalProducts }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <p class="label">热销商品</p>
          <p class="value">{{ bestSeller }}</p>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <div id="salesChart" style="width: 100%; height: 400px;"></div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 10px;
}
.summary-row .el-card {
  text-align: center;
}
.label {
  color: #888;
  font-size: 14px;
}
.value {
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
}
.chart-card {
  margin-top: 30px;
}
</style>
