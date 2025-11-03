<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import request from '@/utils/request';
import { User, Shop, Search, Refresh, Document } from '@element-plus/icons-vue';

// 顾客ID查询返回的数据结构
interface CustomerOrderDetail {
  id: number;
  orderId: number;
  productId: number;
  price: number;
  quantity: number;
}

interface CustomerOrder {
  id: number;
  customerId: number;
  totalPrice: number;
  orderTime: string;
  status: string;
  orderNo: string;
  address: string;
  orderDetails: CustomerOrderDetail[];
}

// 商铺ID查询返回的数据结构
interface ShopOrderDetail {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

interface ShopOrder {
  id: number;
  customerId: number;
  totalPrice: number;
  status: string;
  address: string;
  orderTime: string;
  details: ShopOrderDetail[];
}

// 统一的前端展示数据结构
interface DisplayOrder {
  id: number;
  customerId: number;
  totalPrice: number;
  orderTime: string;
  status: string;
  orderNo?: string;
  address: string;
  details: {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
  }[];
}

// 订单列表
const orders = ref<DisplayOrder[]>([]);
const loading = ref(false);
const activeOrder = ref(); // 当前展开的订单

// 查询参数
const searchParams = reactive({
  shopId: '',
  customerId: ''
});

// 查询方式
const searchType = ref<'customer' | 'shop'>('customer');

// 计算当前输入框的值
const currentInputValue = computed({
  get: () => searchType.value === 'customer' ? searchParams.customerId : searchParams.shopId,
  set: (value) => {
    if (searchType.value === 'customer') {
      searchParams.customerId = value;
    } else {
      searchParams.shopId = value;
    }
  }
});

// 转换顾客订单数据为展示格式
const transformCustomerOrder = (order: CustomerOrder): DisplayOrder => {
  console.log('转换顾客订单:', order);
  return {
    id: order.id,
    customerId: order.customerId,
    totalPrice: order.totalPrice,
    orderTime: order.orderTime,
    status: order.status,
    orderNo: order.orderNo,
    address: order.address,
    details: order.orderDetails.map(detail => ({
      productId: detail.productId,
      productName: `商品${detail.productId}`, // 如果没有商品名称，用默认值
      price: detail.price,
      quantity: detail.quantity
    }))
  };
};

// 转换商铺订单数据为展示格式
const transformShopOrder = (order: ShopOrder): DisplayOrder => {
  console.log('转换商铺订单:', order);
  return {
    id: order.id,
    customerId: order.customerId,
    totalPrice: order.totalPrice,
    orderTime: order.orderTime,
    status: order.status,
    address: order.address,
    details: order.details.map(detail => ({
      productId: detail.productId,
      productName: detail.productName,
      price: detail.price,
      quantity: detail.quantity
    }))
  };
};

// 获取顾客订单
const fetchOrdersByCustomer = async () => {
  if (!searchParams.customerId) {
    ElMessage.warning('请输入顾客ID');
    return;
  }

  try {
    loading.value = true;
    orders.value = [];

    console.log('开始查询顾客订单，顾客ID:', searchParams.customerId);

    const response = await request.get(`/order/list/${searchParams.customerId}`);
    console.log('顾客订单完整响应:', response);

    // 判断不同返回格式
    const rawData = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.data)
      ? response.data.data
      : null;

    if (rawData && Array.isArray(rawData)) {
      console.log('顾客订单数量:', rawData.length);
      orders.value = rawData.map((order: CustomerOrder) => transformCustomerOrder(order));
      ElMessage.success(`查询到 ${orders.value.length} 条顾客订单`);
    } else {
      console.warn('未找到顾客订单数据:', rawData);
      ElMessage.info('未找到该顾客的订单');
      orders.value = [];
    }
  } catch (error) {
    console.error('获取顾客订单失败:', error);
    ElMessage.error('获取顾客订单失败');
  } finally {
    loading.value = false;
  }
};

// 获取商家订单
const fetchOrdersByShop = async () => {
  if (!searchParams.shopId) {
    ElMessage.warning('请输入商家ID');
    return;
  }

  try {
    loading.value = true;
    orders.value = [];

    console.log('开始查询商家订单，商家ID:', searchParams.shopId);

    const response = await request.get(`/order/shop/${searchParams.shopId}`);
    console.log('商家订单完整响应:', response);

    // 同样的通用数据解析逻辑
    const rawData = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.data)
      ? response.data.data
      : null;

    if (rawData && Array.isArray(rawData)) {
      console.log('商家订单数量:', rawData.length);
      orders.value = rawData.map((order: ShopOrder) => transformShopOrder(order))
      .sort((a,b) => a.id - b.id); // 按订单ID升序排序
      ElMessage.success(`查询到 ${orders.value.length} 条商家订单`);
    } else {
      console.warn('未找到商家订单数据:', rawData);
      ElMessage.info('未找到该商家的订单');
      orders.value = [];
    }
  } catch (error) {
    console.error('获取商家订单失败:', error);
    ElMessage.error('获取商家订单失败');
  } finally {
    loading.value = false;
  }
};


// 执行查询
const handleSearch = async () => {
  if (searchType.value === 'customer') {
    await fetchOrdersByCustomer();
  } else {
    await fetchOrdersByShop();
  }
};

// 重置查询
const resetSearch = () => {
  searchParams.shopId = '';
  searchParams.customerId = '';
  orders.value = [];
  activeOrder.value = undefined;
};

// 切换查询方式
const handleSearchTypeChange = () => {
  orders.value = [];
  activeOrder.value = undefined;
  // 清空另一个输入框
  if (searchType.value === 'customer') {
    searchParams.shopId = '';
  } else {
    searchParams.customerId = '';
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  } catch {
    return dateString;
  }
};

// 计算订单详情小计
const calculateSubtotal = (detail: { price: number; quantity: number }) => {
  return (detail.price * detail.quantity).toFixed(2);
};

// 获取状态标签类型
const getStatusType = (status: string) => {
  const statusMap: { [key: string]: string } = {
    '完成': 'success',
    '待支付': 'warning',
    '已取消': 'danger',
    '进行中': 'primary',
    '待发货': 'info',
    '已发货': '',
    '已完成': 'success',
    '待付款': 'warning'
  };
  return statusMap[status] || 'info';
};

// 计算订单总数量
const calculateTotalQuantity = (details: { quantity: number }[]) => {
  return details.reduce((total, detail) => total + detail.quantity, 0);
};

// 获取当前输入框的placeholder
const getInputPlaceholder = computed(() => {
  return searchType.value === 'customer' ? '请输入顾客ID' : '请输入商铺ID';
});

// 检查查询按钮是否禁用
const isSearchDisabled = computed(() => {
  return searchType.value === 'customer' ? !searchParams.customerId : !searchParams.shopId;
});

// 页面加载时如果有默认查询条件，可以自动查询
onMounted(() => {
  // 可以在这里设置默认查询条件或从路由参数中获取
});
</script>

<template>
  <div class="order-management">
    <!-- 查询区域 -->
    <div class="search-section">
      <div class="header">
        <h2>📦 订单管理</h2>
      </div>
      <el-card shadow="never">
        <el-form :model="searchParams" label-width="100px">
          <el-form :inline="true" :model="searchParams" class="search-inline-form">
            <el-form-item label="查询方式">
              <el-radio-group v-model="searchType" @change="handleSearchTypeChange">
                <el-radio label="customer">按顾客ID</el-radio>
                <el-radio label="shop">按商铺ID</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item :label="searchType === 'customer' ? '顾客ID' : '商铺ID'">
              <el-input
                v-model="currentInputValue"
                :placeholder="getInputPlaceholder"
                clearable
                type="number"
                min="0"
                style="width: 200px"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon>
                    <User v-if="searchType === 'customer'" />
                    <Shop v-else />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="handleSearch"
                :loading="loading"
                :disabled="isSearchDisabled"
              >
                <el-icon class="el-icon--left"><Search /></el-icon>
                查询订单
              </el-button>
              <el-button @click="resetSearch">
                <el-icon class="el-icon--left"><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>

          
          <el-alert 
            :title="`提示：当前查询方式 - ${searchType === 'customer' ? '按顾客ID查询' : '按商铺ID查询'}`" 
            type="info" 
            :closable="false"
            show-icon
            style="margin-top: 10px;"
          />
        </el-form>
      </el-card>
    </div>

    <!-- 结果区域 -->
    <div class="results-section" v-if="orders.length > 0 || loading">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>📋 查询结果</span>
            <span class="result-count">共 {{ orders.length }} 条订单</span>
          </div>
        </template>

        <div class="loading-container" v-loading="loading" element-loading-text="正在查询订单...">
          <div class="order-list" v-if="!loading && orders.length > 0">
            <el-collapse v-model="activeOrder" accordion>
              <el-collapse-item 
                v-for="order in orders" 
                :key="order.id" 
                :name="order.id"
                class="order-item"
              >
                <template #title>
                  <div class="order-header">
                    <div class="order-basic-info">
                      <span class="order-id">订单 #{{ order.id }}</span>
                      <span class="order-no" v-if="order.orderNo">{{ order.orderNo }}</span>
                      <span class="customer-id">顾客ID: {{ order.customerId }}</span>
                    </div>
                    <div class="order-status-info">
                      <el-tag :type="getStatusType(order.status)" effect="light">
                        {{ order.status }}
                      </el-tag>
                      <span class="total-price">¥{{ order.totalPrice.toFixed(2) }}</span>
                    </div>
                  </div>
                </template>

                <div class="order-details">
                  <!-- 订单基本信息 -->
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="订单ID">
                      {{ order.id }}
                    </el-descriptions-item>
                    <el-descriptions-item label="顾客ID">
                      {{ order.customerId }}
                    </el-descriptions-item>
                    <el-descriptions-item label="订单总额">
                      <span class="price-highlight">¥{{ order.totalPrice.toFixed(2) }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="订单状态">
                      <el-tag :type="getStatusType(order.status)" size="small">
                        {{ order.status }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="下单时间" span="2">
                      {{ formatDate(order.orderTime) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="收货地址" span="2">
                      {{ order.address }}
                    </el-descriptions-item>
                  </el-descriptions>

                  <!-- 订单商品详情 -->
                  <div class="details-section">
                    <h4>
                      🛒 商品明细 
                      <span class="detail-count">(共 {{ calculateTotalQuantity(order.details) }} 件商品)</span>
                    </h4>
                    <el-table 
                      :data="order.details" 
                      border 
                      size="small"
                      empty-text="暂无商品明细"
                      style="width: 100%; margin-top: 10px;"
                    >
                      <el-table-column prop="productId" label="商品ID" width="100" align="center" />
                      <el-table-column prop="productName" label="商品名称" min-width="150" />
                      <el-table-column prop="price" label="单价" width="120" align="center">
                        <template #default="scope">
                          ¥{{ scope.row.price.toFixed(2) }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="quantity" label="数量" width="100" align="center" />
                      <el-table-column label="小计" width="120" align="center">
                        <template #default="scope">
                          <span class="subtotal">
                            ¥{{ calculateSubtotal(scope.row) }}
                          </span>
                        </template>
                      </el-table-column>
                    </el-table>
                    
                    <!-- 订单总计 -->
                    <div class="order-total">
                      <el-divider />
                      <div class="total-row">
                        <span class="total-label">订单总计：</span>
                        <span class="total-amount">¥{{ order.totalPrice.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else-if="!loading">
      <el-empty description="暂无订单数据">
        <template #image>
          <div class="empty-image">
            <el-icon size="80"><Document /></el-icon>
          </div>
        </template>
        <p>请选择查询方式并输入ID搜索订单</p>
      </el-empty>
    </div>
  </div>
</template>

<style scoped lang="scss">
.order-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);

  .header {
    margin-bottom: 20px;
    
    h2 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-size: 24px;
    }
    
    .header-description {
      p {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .search-section {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }
    
    .form-actions {
      display: flex;
      gap: 10px;
    }
  }

  .results-section {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      
      .result-count {
        font-size: 14px;
        color: #409eff;
        font-weight: normal;
      }
    }
    
    .loading-container {
      min-height: 200px;
    }
    
    .order-item {
      margin-bottom: 10px;
      
      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-right: 20px;
        
        .order-basic-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          
          .order-id {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
          }
          
          .order-no {
            font-size: 12px;
            color: #909399;
            margin-bottom: 2px;
          }
          
          .customer-id {
            font-size: 12px;
            color: #67c23a;
          }
        }
        
        .order-status-info {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .total-price {
            font-weight: 600;
            color: #e6a23c;
            font-size: 16px;
          }
        }
      }
      
      .order-details {
        .details-section {
          margin-top: 16px;
          
          h4 {
            margin: 0 0 12px 0;
            color: #2c3e50;
            font-size: 14px;
            
            .detail-count {
              font-size: 12px;
              color: #909399;
              font-weight: normal;
            }
          }
        }
        
        .price-highlight {
          color: #e6a23c;
          font-weight: 600;
        }
        
        .subtotal {
          color: #f56c6c;
          font-weight: 600;
        }
        
        .order-total {
          margin-top: 16px;
          
          .total-row {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 12px;
            
            .total-label {
              font-size: 14px;
              color: #606266;
            }
            
            .total-amount {
              font-size: 18px;
              font-weight: 600;
              color: #e6a23c;
            }
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    
    .empty-image {
      color: #c0c4cc;
    }
    
    p {
      margin-top: 8px;
      color: #909399;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .order-management {
    padding: 15px;
    
    .order-header {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 8px;
    }
    
    .order-status-info {
      width: 100%;
      justify-content: space-between;
    }
    
    .form-actions {
      flex-direction: column;
    }
  }
}
</style>