<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 模拟商品数据（后端接入后可删除）
interface Product {
  id: number;
  name: string;
  merchant: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}
const productList = ref<Product[]>([
  { id: 1, name: "有机苹果", merchant: "绿源果业", category: "水果", price: 8.5, stock: 120, status: "待审核" },
  { id: 2, name: "新鲜蔬菜套餐", merchant: "田园蔬果", category: "蔬菜", price: 25, stock: 50, status: "已上架" },
  { id: 3, name: "东北大米", merchant: "稻花香合作社", category: "粮油", price: 65, stock: 200, status: "已下架" },
]);

// 编辑弹窗控制
const dialogVisible = ref(false);
const editForm = reactive<Product>({
  id: 0,
  name: "",
  merchant: "",
  category: "",
  price: 0,
  stock: 0,
  status: "",
});

// 编辑商品
function handleEdit(row: Product) {
  Object.assign(editForm, row);
  dialogVisible.value = true;
}

// 保存修改
function handleSave() {
  const index = productList.value.findIndex((p) => p.id === editForm.id);
  if (index !== -1) {
    productList.value[index] = { ...editForm };
    ElMessage.success("修改成功");
  }
  dialogVisible.value = false;
}

// 删除商品
function handleDelete(id: number) {
  ElMessageBox.confirm("确定要删除该商品吗？", "提示", {
    type: "warning",
  }).then(() => {
    const index = productList.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      productList.value.splice(index, 1);
      ElMessage.success("删除成功");
    }
  });
}

// 审核商品
function handleApprove(row: Product, status: string) {
  row.status = status;
  ElMessage.success(`商品已${status === "已上架" ? "通过" : "驳回"}`);
}
</script>

<template>
  <div class="product-admin">
    <div class="header">
      <h2>🛍️ 商品管理</h2>
      <el-button type="primary">+ 新增商品</el-button>
    </div>

    <!-- 商品表格 -->
    <el-table :data="productList" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="merchant" label="商家名称" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="price" label="价格(元)" width="100" />
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" align="center" width="260">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="success" @click="handleApprove(scope.row, '已上架')">通过</el-button>
          <el-button size="small" type="warning" @click="handleApprove(scope.row, '已驳回')">驳回</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog title="编辑商品" v-model="dialogVisible" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="商家名称">
          <el-input v-model="editForm.merchant" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="editForm.category" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="editForm.price" :min="0" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="editForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="待审核" value="待审核" />
            <el-option label="已上架" value="已上架" />
            <el-option label="已下架" value="已下架" />
          </el-select>
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
  }

  .el-table {
    font-size: 14px;
  }
}
</style>
