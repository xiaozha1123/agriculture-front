<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Seller {
  id: number
  name: string
  contact: string
  phone: string
  address: string
  status: string
}

const sellers = ref<Seller[]>([
  { id: 1, name: '张三果园', contact: '张三', phone: '13811112222', address: '江苏省南京市江宁区', status: '待审核' },
  { id: 2, name: '王氏农庄', contact: '王五', phone: '13833334444', address: '河南省洛阳市涧西区', status: '已通过' },
  { id: 3, name: '李家蔬菜铺', contact: '李四', phone: '13855556666', address: '山东省济南市', status: '未通过' },
])

function handleApprove(row: Seller) {
  row.status = '已通过'
  ElMessage.success(`商家【${row.name}】已通过审核`)
}

function handleReject(row: Seller) {
  ElMessageBox.prompt('请输入驳回原因：', '驳回审核', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(({ value }) => {
    row.status = '未通过'
    ElMessage.warning(`商家【${row.name}】已被驳回，原因：${value}`)
  })
}
</script>

<template>
  <div class="seller-review">
    <h2>🏪 商家审核</h2>

    <el-table :data="sellers" border stripe>
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column prop="name" label="商家名称" width="180" />
      <el-table-column prop="contact" label="联系人" width="100" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '已通过' ? 'success' : row.status === '未通过' ? 'danger' : 'warning'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="success" size="small" @click="handleApprove(row)" :disabled="row.status==='已通过'">
            通过
          </el-button>
          <el-button type="danger" size="small" @click="handleReject(row)" :disabled="row.status==='未通过'">
            驳回
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.seller-review {
  padding: 20px;
}
</style>
