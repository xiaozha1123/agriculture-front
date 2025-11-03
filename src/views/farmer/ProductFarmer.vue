<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

const products = ref<Product[]>([
  { id: 1, name: '有机西红柿', category: '蔬菜类', price: 5.5, stock: 120 },
  { id: 2, name: '红富士苹果', category: '水果类', price: 3.8, stock: 90 },
  { id: 3, name: '化肥', category: '农资类', price: 50.0, stock: 40 },
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增商品')
const editProduct = ref<Product>({ id: 0, name: '', category: '', price: 0, stock: 0 })

function handleAdd() {
  dialogTitle.value = '新增商品'
  editProduct.value = { id: 0, name: '', category: '', price: 0, stock: 0 }
  dialogVisible.value = true
}

function handleEdit(row: Product) {
  dialogTitle.value = '编辑商品'
  editProduct.value = { ...row }
  dialogVisible.value = true
}

function handleDelete(row: Product) {
  ElMessageBox.confirm(`确定要删除商品「${row.name}」吗？`, '提示', { type: 'warning' }).then(() => {
    products.value = products.value.filter(p => p.id !== row.id)
    ElMessage.success('删除成功')
  })
}

function handleSave() {
  if (dialogTitle.value === '新增商品') {
    editProduct.value.id = Date.now()
    products.value.push({ ...editProduct.value })
    ElMessage.success('新增成功')
  } else {
    const index = products.value.findIndex(p => p.id === editProduct.value.id)
    if (index !== -1) products.value[index] = { ...editProduct.value }
    ElMessage.success('修改成功')
  }
  dialogVisible.value = false
}
</script>

<template>
  <div class="product-manage">
    <el-card>
      <h2>📦 商品管理</h2>
      <el-button type="primary" @click="handleAdd" class="add-btn">新增商品</el-button>

      <el-table :data="products" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="类别" width="150" />
        <el-table-column prop="price" label="单价（元）" width="120" />
        <el-table-column prop="stock" label="库存" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px">
        <el-form label-width="80px">
          <el-form-item label="商品名"><el-input v-model="editProduct.name" /></el-form-item>
          <el-form-item label="类别"><el-input v-model="editProduct.category" /></el-form-item>
          <el-form-item label="单价"><el-input-number v-model="editProduct.price" :min="0" /></el-form-item>
          <el-form-item label="库存"><el-input-number v-model="editProduct.stock" :min="0" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<style scoped>
.product-manage {
  padding: 20px;
}
.add-btn {
  margin-bottom: 15px;
}
</style>
