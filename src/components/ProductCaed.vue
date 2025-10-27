<template>
  <el-card shadow="hover" class="product-card">
    <img :src="product.image" class="product-img" />
    <div class="info">
      <h3>{{ product.name }}</h3>
      <p class="price">￥{{ product.price }}</p>
      <el-button type="success" size="small">立即购买</el-button>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
defineProps<{ product: { id: number; name: string; price: number; image: string } }>()
</script>

<style scoped>
.product-card {
  text-align: center;
  border-radius: 10px;
}
.product-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}
.info {
  margin-top: 10px;
}
.price {
  color: #e67e22;
  font-weight: bold;
  margin: 5px 0;
}
</style>
