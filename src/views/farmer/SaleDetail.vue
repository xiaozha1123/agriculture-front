<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 统计数据结构
interface ShopStatistics {
  totalSales: number;           // 总销售额
  orderCount: number;          // 总订单数
  totalQuantity: number;        // 总销售数量
}

// 响应式数据
const statistics = ref<ShopStatistics | null>(null)
const loading = ref(false)
const shopId = ref<number | null>(null)

// 响应式数据
const username = ref('');

// 获取当前登录用户名
const getUsername = () => {
  const sessionUser = sessionStorage.getItem('username');
  username.value = sessionUser || '';
  return sessionUser;
};

// 获取商铺ID
const fetchShopId = async () => {
  try {
    const username = getUsername()
    if (!username) {
      ElMessage.warning('请先登录')
      return null
    }

    console.log('开始获取商铺ID，用户名:', username)
    
    const response = await fetch(`http://localhost:8080/shop/getShopId?username=${encodeURIComponent(username)}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    console.log('商铺ID响应状态:', response.status)
    
    if (response.status === 404) {
      ElMessage.warning('该用户没有关联的商铺')
      return null
    }
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json()
    console.log('获取到的商铺ID数据:', data)
    
    // 处理嵌套的响应格式
    if (data && data.data !== undefined) {
      shopId.value = data.data
    } else {
      shopId.value = data
    }
    
    console.log('最终商铺ID:', shopId.value)
    return shopId.value
    
  } catch (error) {
    console.error('获取商铺ID失败:', error)
    ElMessage.error('获取商铺信息失败')
    return null
  }
}

// 获取销售统计
const fetchShopStatistics = async () => {
  try {
    if (!shopId.value) {
      ElMessage.warning('无法获取商铺信息')
      return
    }

    loading.value = true
    console.log('开始获取销售统计，商铺ID:', shopId.value)
    
    const response = await fetch(`http://localhost:8080/shop/statistics/${shopId.value}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const result = await response.json()
    console.log('获取到的销售统计数据:', result)
    
    // 处理嵌套的响应格式
    if (result && result.data) {
      statistics.value = result.data
    } else {
      statistics.value = result
    }
    
  } catch (error) {
    console.error('获取销售统计失败:', error)
    ElMessage.error('获取销售统计失败')
    statistics.value = null
  } finally {
    loading.value = false
  }
}

// 格式化金额显示
const formatCurrency = (amount: number) => {
  return `¥${amount?.toFixed(2) || '0.00'}`
}

// 页面加载
onMounted(async () => {
  const sid = await fetchShopId()
  if (sid) {
    await fetchShopStatistics()
  }
})

// 刷新数据
const refreshData = async () => {
  await fetchShopStatistics()
}
</script>

<template>
  <div class="sales-statistics">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>📊 销售统计</h2>
          <el-button type="primary" @click="refreshData" :loading="loading">
            <el-icon><IEpRefresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 主要统计指标 -->
      <div v-else-if="statistics" class="statistics-content">
        <!-- 核心指标卡片 -->
        <div class="metrics-grid">
          <el-card class="metric-card total-sales">
            <div class="metric-content">
              <div class="metric-icon">💰</div>
              <div class="metric-info">
                <div class="metric-value">{{ formatCurrency(statistics.totalSales) }}</div>
                <div class="metric-label">总销售额</div>
              </div>
            </div>
          </el-card>

          <el-card class="metric-card total-orders">
            <div class="metric-content">
              <div class="metric-icon">📦</div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.orderCount}}</div>
                <div class="metric-label">总订单数</div>
              </div>
            </div>
          </el-card>

          <el-card class="metric-card total-quantity">
            <div class="metric-content">
              <div class="metric-icon">🛒</div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.totalQuantity }}</div>
                <div class="metric-label">总销售数量</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.sales-statistics {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      color: #2c3e50;
    }
  }

  .loading-state {
    padding: 20px 0;
  }

  .statistics-content {
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;

      .metric-card {
        border-radius: 8px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

        &.total-sales {
          border-left: 4px solid #e6a23c;
        }

        &.total-orders {
          border-left: 4px solid #409eff;
        }

        &.total-quantity {
          border-left: 4px solid #67c23a;
        }

        .metric-content {
          display: flex;
          align-items: center;
          padding: 10px;

          .metric-icon {
            font-size: 2.5rem;
            margin-right: 15px;
          }

          .metric-info {
            flex: 1;

            .metric-value {
              font-size: 1.8rem;
              font-weight: bold;
              color: #303133;
              margin-bottom: 5px;
            }

            .metric-label {
              font-size: 0.9rem;
              color: #909399;
              margin-bottom: 3px;
            }

            .metric-subtext {
              font-size: 0.8rem;
              color: #67c23a;
            }
          }
        }
      }
    }

    .section-card {
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

      .section-header {
        font-weight: bold;
        color: #2c3e50;
      }
    }
  }

  .empty-state {
    margin: 40px 0;
  }
}

@media (max-width: 768px) {
  .sales-statistics {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }

    .metrics-grid {
      grid-template-columns: 1fr !important;
    }
  }
}
</style>