<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';

interface Comment {
  commentId: number;
  productName: string;
  userName: string;
  content: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: Comment[];
}

const comments = ref<Comment[]>([]);
const loading = ref(false);
const shopId = ref<number | null>(null);

// 从 sessionStorage 获取当前登录用户名
const getUsername = () => {
  const sessionUser = sessionStorage.getItem('username');
  console.log('从sessionStorage获取的用户名:', sessionUser);
  return sessionUser || null;
};

// 🏪 根据用户名获取商铺ID
const fetchShopIdByUsername = async () => {
  try {
    const username = getUsername();
    if (!username) {
      ElMessage.warning('请先登录');
      return null;
    }

    console.log('开始获取商铺ID，用户名:', username);
    
    const response = await fetch(`http://localhost:8080/shop/getShopId?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('响应状态:', response.status);
    
    if (response.status === 404) {
      ElMessage.warning('该用户没有关联的商铺');
      return null;
    }
    
    if (response.status === 500) {
      const errorText = await response.text();
      console.error('服务器错误详情:', errorText);
      throw new Error(`服务器内部错误: ${errorText}`);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('获取到的商铺ID数据:', data);
    
    // 处理嵌套的响应格式
    if (data && data.data !== undefined) {
      return data.data; // 如果商铺ID也在data字段中
    }
    return data;
    
  } catch (error) {
    console.error('获取商铺ID失败:', error);
    ElMessage.error('获取商铺信息失败');
    return null;
  }
};

// 💬 根据商铺ID获取评论
const fetchComments = async (shopId: number) => {
  try {
    loading.value = true;
    console.log('开始获取评论，商铺ID:', shopId);
    
    const response = await fetch(`http://localhost:8080/comment/shop/${shopId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('评论接口响应状态:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('获取到的完整响应:', result);
    console.log('评论数据:', result.data);
    console.log('评论数据长度:', result.data ? result.data.length : 0);
    
    // 正确解析嵌套的数据结构
    if (result && result.code === 200 && Array.isArray(result.data)) {
      comments.value = result.data;
      console.log('成功设置评论数据，当前评论数:', comments.value.length);
    } else {
      console.error('评论数据格式不正确:', result);
      comments.value = [];
      ElMessage.warning('评论数据格式异常');
    }
    
  } catch (error) {
    console.error('获取评价失败:', error);
    comments.value = [];
    ElMessage.error('获取评价失败');
  } finally {
    loading.value = false;
  }
};

// 🚀 页面加载逻辑
onMounted(async () => {
  console.log('页面加载开始...');
  
  const sid = await fetchShopIdByUsername();
  
  if (sid) {
    shopId.value = sid;
    console.log('成功获取商铺ID:', sid);
    await fetchComments(sid);
  } else {
    console.log('未能获取商铺ID');
    ElMessage.warning('无法获取商铺信息，请确认您已登录商家账号且有关联的商铺');
  }
});
</script>

<template>
  <div class="comment">
    <el-card>
      <div class="header">
        <h2>💬 客户评价</h2>
        <span v-if="shopId" class="shop-name">商铺ID: {{ shopId }}</span>
      </div>

      <!-- 统计信息 -->
      <el-alert
        :title="shopId ? `当前共有 ${comments.length} 条评价` : '请先登录商家账号'"
        :type="shopId ? 'info' : 'warning'"
        :closable="false"
        show-icon
        class="comment-alert"
      />

      <!-- 评价表格 -->
      <el-table
        v-loading="loading"
        :data="comments"
        border
        stripe
        v-if="shopId && comments.length > 0"
        style="margin-top: 15px;"
        empty-text="暂无评价数据"
      >
        <el-table-column prop="commentId" label="评价ID" width="100" align="center" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="productName" label="商品" width="120" />
        <el-table-column prop="content" label="评价内容" :show-overflow-tooltip="true" min-width="200" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="ElMessage.info(`评价详情：${row.content}`)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="shopId && comments.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无评价数据" />
      </div>

      <div v-if="!shopId && !loading" class="empty-info">
        <el-empty description="当前账号无商铺或未登录" />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.comment {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .shop-name {
      color: #606266;
      font-weight: 500;
      font-size: 15px;
      background: #f5f7fa;
      padding: 6px 12px;
      border-radius: 4px;
    }
  }

  .comment-alert {
    margin: 10px 0 20px;
    border-radius: 8px;
    font-weight: 500;

    :deep(.el-alert__title) {
      font-size: 15px;
      line-height: 1.6;
    }
  }

  .empty-state, .empty-info {
    margin-top: 40px;
  }
}
</style>