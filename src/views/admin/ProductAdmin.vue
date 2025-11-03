<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from '@/utils/request';

// 商品接口定义
interface Product {
  id: number;
  name: string;
  categoryId: number;
  shopId: number;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  status: string;
  shopName?: string;
  categoryName?: string;
}

// 商品列表
const products = ref<Product[]>([]);
const filteredProducts = ref<Product[]>([]);
const loading = ref(false);

// 编辑弹窗控制
const dialogVisible = ref(false);
const editForm = reactive({
  id: 0,
  name: '',
  categoryId: 0,
  shopId: 0,
  price: 0,
  stock: 0,
  description: '',
  imageUrl: '',
  status: ''
});

// 状态筛选
const statusFilter = ref('全部');

// 获取商品列表 - 修复版本
const fetchProducts = async () => {
  try {
    loading.value = true;
    console.log('开始获取商品列表...');
    
    // 直接使用 fetch，因为数据已经正常返回
    const response = await fetch('http://localhost:8080/product/list', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('商品列表数据:', data);
    
    // 直接赋值，因为数据已经是数组格式
    products.value = data;
    ElMessage.success('获取商品列表成功');
    
  } catch (error) {
    console.error('获取商品列表失败:', error);
    ElMessage.error('获取商品列表失败');
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取待审核商品
const fetchPendingProducts = async () => {
  try {
    loading.value = true;
    const response = await request.get('/product/pending');
    console.log('待审核商品响应:', response);
    
    // 根据你的后端返回结构调整
    if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
      products.value = response.data.data;
    } else if (Array.isArray(response.data)) {
      products.value = response.data;
    } else {
      console.log('待审核商品数据格式:', response.data);
      products.value = [];
      ElMessage.info('暂无待审核商品');
    }
  } catch (error) {
    console.error('获取待审核商品失败:', error);
    ElMessage.error('获取待审核商品失败');
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 根据状态筛选商品
const filterProducts = () => {
  if (statusFilter.value === '全部') {
    filteredProducts.value = [...products.value];
  } else {
    filteredProducts.value = products.value.filter(product => 
      product.status === statusFilter.value
    );
  }
  console.log('筛选后商品数量:', filteredProducts.value.length);
};

// 保存修改
const handleSave = async () => {
  try {
    const response = await request.put(`/product/update/${editForm.id}`, {
      name: editForm.name,
      description: editForm.description,
      price: editForm.price,
      stock: editForm.stock,
      status: editForm.status,
      categoryId: editForm.categoryId,
      shopId: editForm.shopId
    });

    console.log('修改响应:', response);
    
    if (response.data === true) {
      ElMessage.success("修改成功");
      await fetchProducts();
      dialogVisible.value = false;
    } else {
      ElMessage.error("修改失败");
    }
  } catch (error) {
    console.error('修改商品失败:', error);
    ElMessage.error('修改失败');
  }
};

// 删除商品
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定要删除该商品吗？", "提示", {
      type: "warning",
    });

    const response = await request.put(`/product/delete/${id}`);
    
    if (response.data === true) {
      ElMessage.success("删除成功");
      await fetchProducts();
    } else {
      ElMessage.error("删除失败");
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 审核通过
const handleApprove = async (id: number) => {
  try {
    const response = await request.put(`/product/approve/${id}`);
    console.log('审核通过响应:', response);
    
    if (response.data && response.data.code === 200) {
      ElMessage.success("审核通过");
      await fetchPendingProducts();
    }
  } catch (error) {
    console.error('审核通过失败:', error);
    ElMessage.error('操作失败');
  }
};

// 审核拒绝
const handleReject = async (id: number) => {
  try {
    const response = await request.put(`/product/reject/${id}`);
    console.log('审核拒绝响应:', response);
    
    if (response.data && response.data.code === 200) {
      ElMessage.success("审核拒绝");
      await fetchPendingProducts();
    }
  } catch (error) {
    console.error('审核拒绝失败:', error);
    ElMessage.error('操作失败');
  }
};

// 监听状态筛选变化
watch(statusFilter, () => {
  filterProducts();
});

// 监听商品列表变化
watch(products, () => {
  filterProducts();
}, { immediate: true });

// 页面加载时获取数据
onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="product-admin">
    <div class="header">
      <h2>🛍️ 商品管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="fetchPendingProducts">待审核商品</el-button>
        <el-button type="success" @click="fetchProducts">全部商品</el-button>
      </div>
    </div>

    <!-- 显示数据信息 -->
    <div class="data-info">
      <el-alert 
        :title="`共 ${products.length} 个商品，筛选后 ${filteredProducts.length} 个`" 
        type="info" 
        :closable="false"
        show-icon
        style="margin-bottom: 15px;"
      />
    </div>

    <!-- 商品表格 -->
    <el-table 
      :data="filteredProducts" 
      border 
      style="width: 100%" 
      v-loading="loading"
      empty-text="暂无商品数据"
    >
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column prop="name" label="商品名称" min-width="120" />
      <el-table-column prop="shopId" label="商家ID" width="100" align="center" />
      <el-table-column prop="categoryId" label="分类ID" width="100" align="center" />
      <el-table-column prop="price" label="价格(元)" width="100" align="center">
        <template #default="scope">
          {{ scope.row.price ? scope.row.price.toFixed(2) : '0.00' }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" align="center" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip /> 
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === '已上架' ? 'success' : 
                   scope.row.status === '待审核' ? 'warning' : 
                   scope.row.status === '已驳回' ? 'danger' : 'info'"
          >
            {{ scope.row.status || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280" fixed="right">
        <template #default="scope">
          <el-button 
            v-if="scope.row.status === '待审核'"
            size="small" 
            type="success" 
            @click="handleApprove(scope.row.id)"
          >
            通过
          </el-button>
          <el-button 
            v-if="scope.row.status === '待审核'"
            size="small" 
            type="warning" 
            @click="handleReject(scope.row.id)"
          >
            驳回
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog title="编辑商品" v-model="dialogVisible" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="editForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="editForm.stock" :min="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.product-admin {
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #2c3e50;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .data-info {
    margin-bottom: 15px;
  }

  .el-table {
    font-size: 14px;
  }
}
</style>