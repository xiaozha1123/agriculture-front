<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from '@/utils/request';
import type { AxiosResponse } from 'axios';

// 接口定义保持不变...
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

interface Category {
  id: number;
  name: string;
}

// API响应接口 - 适配boolean响应格式
interface ApiResponse<T = unknown> {
  code?: number;
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

// 商品列表
const products = ref<Product[]>([]);
const filteredProducts = ref<Product[]>([]);
const loading = ref(false);

// 商铺信息
const shopId = ref<number | null>(null);
const shopName = ref<string>('');

// 编辑弹窗控制
const dialogVisible = ref(false);
const isAdding = ref(false);
const editForm = reactive({
  id: 0,
  name: '',
  categoryId: 0,
  shopId: 0,
  price: 0,
  stock: 0,
  description: '',
  imageUrl: '',
});

// 状态筛选
const statusFilter = ref('全部');

// 分类选项
const categories = ref<Category[]>([]);

// 获取当前登录用户名
const getUsername = (): string | null => {
  const sessionUser = sessionStorage.getItem('username');
  console.log('从sessionStorage获取的用户名:', sessionUser);
  return sessionUser || null;
};

// 获取分类列表
const fetchCategories = async (): Promise<void> => {
  try {
    const response = await request.get<Category[]>('/category/list');
    console.log('获取分类响应:', response);
    
    if (response && response.data) {
      categories.value = response.data;
    } else if (Array.isArray(response)) {
      categories.value = response;
    }
    
    // 设置默认分类
    if (categories.value.length > 0 && !editForm.categoryId) {
      editForm.categoryId = categories.value?.[0]?.id ?? 0;
    }
  } catch (error) {
    console.error('获取分类失败:', error);
    ElMessage.error('获取商品分类失败');
    // 备用数据
    categories.value = [
      { id: 1, name: '新鲜水果' },
      { id: 2, name: '蔬菜' },
      { id: 3, name: '粮油副食' },
      { id: 4, name: '农资用品' },
      { id: 5, name: '肉禽蛋类' }
    ];
  }
};

// 获取商铺ID
const fetchShopId = async (): Promise<number | null> => {
  try {
    const username = getUsername();
    if (!username) {
      ElMessage.warning('请先登录');
      return null;
    }

    console.log('开始获取商铺ID，用户名:', username);
    
    const response = await request.get<number>(`/shop/getShopId?username=${encodeURIComponent(username)}`);
    
    console.log('商铺ID响应:', response);
    
    const shopIdValue = response?.data ?? response;
    
    if (!shopIdValue) {
      ElMessage.warning('该用户没有关联的商铺');
      return null;
    }
    
    shopId.value = Number(shopIdValue);
    console.log('最终商铺ID:', shopId.value);
    return shopId.value;
    
  } catch {
    console.error('获取商铺ID失败');
    ElMessage.error('获取商铺ID失败');
    return null;
  }
};

// 获取当前商铺的商品列表
const fetchProducts = async (): Promise<void> => {
  try {
    if (!shopId.value) {
      ElMessage.warning('无法获取商铺信息');
      return;
    }

    loading.value = true;
    console.log('开始获取商铺商品列表，商铺ID:', shopId.value);
    
    const response = await request.get<Product[]>(`/product/search/shop/${shopId.value}`);
    console.log('商品列表响应:', response);
    
    const productData = response?.data ?? response;
    
    if (Array.isArray(productData)) {
      products.value = productData.filter((product: Product) => product.shopId === shopId.value);
    } else {
      products.value = [];
    }
    
    console.log('当前商铺商品:', products.value);
    
  } catch (error) {
    console.error('获取商品列表失败:', error);
    ElMessage.error('获取商品列表失败');
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 根据状态筛选商品
const filterProducts = (): void => {
  if (statusFilter.value === '全部') {
    filteredProducts.value = [...products.value];
  } else {
    filteredProducts.value = products.value.filter(product => 
      product.status === statusFilter.value
    );
  }
  console.log('筛选后商品数量:', filteredProducts.value.length);
};

// 打开添加商品弹窗
const openAddDialog = (): void => {
  isAdding.value = true;
  
  const defaultCategoryId = categories.value?.[0]?.id ?? 1;
  
  Object.assign(editForm, {
    id: 0,
    name: '',
    categoryId: defaultCategoryId,
    shopId: shopId.value || 0,
    price: 0,
    stock: 0,
    description: '',
    imageUrl: '',
  });
  dialogVisible.value = true;
};

// 编辑商品
const handleEdit = (row: Product): void => {
  isAdding.value = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { status: _status, ...formData } = row;
  Object.assign(editForm, formData);
  dialogVisible.value = true;
};

// 响应成功判断 - 修复版本（适配boolean和对象格式）
const isResponseSuccess = (response: unknown): boolean => {
  console.log('原始响应:', response);
  
  if (!response) return false;
  
  // 情况1: 直接返回boolean
  if (typeof response === 'boolean') {
    return response;
  }
  
  // 情况2: 返回AxiosResponse，data是boolean
  const res = response as AxiosResponse;
  if (typeof res.data === 'boolean') {
    return res.data;
  }
  
  // 情况3: 返回ApiResponse对象
  const apiRes = res.data as ApiResponse;
  if (apiRes) {
    if (apiRes.code === 200 || apiRes.status === 200 || apiRes.success === true) {
      return true;
    }
    // 情况4: 嵌套data是boolean
    if (typeof apiRes.data === 'boolean') {
      return apiRes.data;
    }
  }
  
  return false;
};

// 表单验证
const validateForm = (): boolean => {
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入商品名称');
    return false;
  }
  if (!editForm.categoryId || editForm.categoryId <= 0) {
    ElMessage.warning('请选择商品分类');
    return false;
  }
  if (editForm.price < 0) {
    ElMessage.warning('价格不能为负数');
    return false;
  }
  if (editForm.stock < 0) {
    ElMessage.warning('库存不能为负数');
    return false;
  }
  if (!shopId.value) {
    ElMessage.warning('无法获取商铺信息');
    return false;
  }
  return true;
};

// 保存商品 - 修复版本
const handleSave = async (): Promise<void> => {
  try {
    if (!validateForm()) {
      return;
    }

    editForm.shopId = shopId.value!;
    
    let submitData;
    if (isAdding.value) {
      // 添加操作：明确排除id字段
      const { ...rest } = editForm;
      submitData = { ...rest, status: '待审核' };
    } else {
      // 更新操作
      submitData = { 
        id: editForm.id,
        name: editForm.name,
        categoryId: editForm.categoryId,
        shopId: editForm.shopId,
        price: editForm.price,
        stock: editForm.stock,
        description: editForm.description,
        imageUrl: editForm.imageUrl
      };
    }

    console.log('准备提交数据:', submitData);

    const response = isAdding.value
      ? await request.post<ApiResponse>('/product/add', submitData)
      : await request.put<ApiResponse>(`/product/update/${editForm.id}`, submitData);

    console.log('后端响应:', response);

    if (isResponseSuccess(response)) {
      ElMessage.success(isAdding.value ? "商品添加成功" : "商品更新成功");
      await fetchProducts(); // 确保等待刷新完成
      dialogVisible.value = false;
    } else {
      // 提取错误消息
      const errorMsg = extractErrorMessage(response);
      ElMessage.error(`${isAdding.value ? '添加' : '更新'}失败：${errorMsg}`);
    }
  } catch (error: unknown) {
    console.error('操作异常:', error);
    const errorMsg = extractErrorMessage(error);
    ElMessage.error(`${isAdding.value ? '添加' : '更新'}失败：${errorMsg}`);
  }
};

// 删除商品 - 修复版本
const handleDelete = async (id: number): Promise<void> => {
  try {
    await ElMessageBox.confirm("确定要删除该商品吗？此操作不可恢复！", "⚠️ 删除确认", {
      type: "warning",
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    });
    
    console.log('执行删除操作，ID:', id);
    
    const response = await request.delete<ApiResponse>(`/product/delete/${id}`);
    console.log('删除响应:', response);
    
    if (isResponseSuccess(response)) {
      ElMessage.success("商品删除成功");
      await fetchProducts(); // 确保等待刷新完成
    } else {
      const errorMsg = extractErrorMessage(response);
      ElMessage.error(`删除失败：${errorMsg}`);
    }
  } catch (error: unknown) {
    if (error !== 'cancel') {
      console.error('删除异常:', error);
      const errorMsg = extractErrorMessage(error);
      ElMessage.error(`删除失败：${errorMsg}`);
    }
  }
};

// 提取错误消息的工具函数
function extractErrorMessage(error: unknown): string {
  if (!error) return '未知错误';
  
  // 如果是AxiosError
  const axiosError = error as { response?: { data?: unknown }; message?: string };
  if (axiosError.response?.data) {
    const data = axiosError.response.data as ApiResponse;
    return data.message || '操作失败';
  }
  
  // 如果是字符串
  if (typeof error === 'string') {
    return error;
  }
  
  // 其他情况
  return '网络或服务器错误';
}

// 监听状态筛选变化
watch(statusFilter, () => {
  filterProducts();
});

// 监听商品列表变化
watch(products, () => {
  filterProducts();
}, { immediate: true });

// 页面加载时获取数据
onMounted(async () => {
  await fetchCategories();
  const sid = await fetchShopId();
  if (sid) {
    await fetchProducts();
  }
});
</script>

<template>
  <div class="product-admin">
    <div class="header">
      <h2>🛍️ 商品管理</h2>
      <div class="header-actions">
        <span v-if="shopName" class="shop-name">{{ shopName }}</span>
        <el-button type="primary" @click="openAddDialog" :disabled="!shopId">添加商品</el-button>
      </div>
    </div>

    <!-- 商铺信息和筛选 -->
    <div class="shop-info">
      <el-alert 
        :title="shopId ? `商铺ID: ${shopId} | 共 ${products.length} 个商品，筛选后 ${filteredProducts.length} 个` : '请先登录商家账号'" 
        :type="shopId ? 'info' : 'warning'" 
        :closable="false"
        show-icon
      />
      
      <div class="filter-section" v-if="shopId">
        <el-radio-group v-model="statusFilter">
          <el-radio-button label="全部" />
          <el-radio-button label="已上架" />
          <el-radio-button label="待审核" />
        </el-radio-group>
      </div>
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
      <el-table-column label="分类" width="120" align="center">
        <template #default="scope">
          {{ categories.find(c => c.id === scope.row.categoryId)?.name || '未知分类' }}
        </template>
      </el-table-column>
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
                   scope.row.status === '已驳回' ? 'danger' : 'info'">
            {{ scope.row.status || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑商品弹窗 -->
    <el-dialog :title="isAdding ? '添加商品' : '编辑商品'" v-model="dialogVisible" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="商品名称" required>
          <el-input v-model="editForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" required>
          <el-select v-model="editForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input-number v-model="editForm.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" required>
          <el-input-number v-model="editForm.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <!-- 编辑时显示状态（只读） -->
        <el-form-item label="商品状态" v-if="!isAdding">
          <el-tag 
            :type="products.find(p => p.id === editForm.id)?.status === '已上架' ? 'success' : 
                   products.find(p => p.id === editForm.id)?.status === '待审核' ? 'warning' : 
                   products.find(p => p.id === editForm.id)?.status === '已驳回' ? 'danger' : 'info'"
            style="width: 100%; text-align: center;"
          >
            {{ products.find(p => p.id === editForm.id)?.status || '未知' }}
          </el-tag>
          <div style="color: #999; font-size: 12px; margin-top: 5px;">
            状态由管理员审核决定，无法修改
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">确认</el-button>
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
      gap: 15px;

      .shop-name {
        font-weight: 600;
        color: #409eff;
        background: #f0f9ff;
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid #d1ecff;
      }
    }
  }

  .shop-info {
    margin-bottom: 20px;

    .filter-section {
      margin-top: 15px;
      display: flex;
      justify-content: flex-start;
    }
  }

  .el-table {
    font-size: 14px;
  }
}
</style>