<script lang="ts" setup>

const tableData = [
  {
    user: '李四',
    product: '苹果',
    comment: '非常新鲜，口感很好！',
    date: '2024-06-01'
  },
  {
    user: '王五',
    product: '香蕉',
    comment: '价格实惠，送货及时。',
    date: '2024-06-03'
  },
  {
    user: '赵六',
    product: '橙子',
    comment: '质量不错，下次还会再来购买。',
    date: '2024-06-05'
  }
]

</script>

<template>
  <div class="comment">
    <el-card>
      <h2>💬 客户评价</h2>
      <el-table :data="tableData" border stripe >
        <el-table-column prop="user" label="用户" width="100"></el-table-column>
        <el-table-column prop="product" label="商品" width="100"></el-table-column>
        <el-table-column prop="comment" label="评价内容"></el-table-column>
        <el-table-column prop="date" label="评价时间" width="300"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.comment{
    padding: 20px;
}
</style>