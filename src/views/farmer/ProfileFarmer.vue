<script setup lang="ts">
import { UserFilled } from '@element-plus/icons-vue'
</script>

<template>
    <div class="profile">
        <el-card>
            <h2>👤 个人资料</h2>
            <el-descriptions :column="2" border>
                <el-descriptions-item
                :rowspan="2"
                :width="140"
                label="Photo"
                align="center"
                >
                <el-avatar :icon="UserFilled" />
                </el-descriptions-item>
                
                <el-descriptions-item label="Username" align="center">kooriookami</el-descriptions-item>
                <el-descriptions-item label="Phone" align="center">18100000000</el-descriptions-item>
                <el-descriptions-item label="Password" align="center">123456</el-descriptions-item>
                <el-descriptions-item label="Role" align="center">
                <el-tag size="small">商家</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="Address" align="center">
                    No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province
                </el-descriptions-item>
            </el-descriptions>
        </el-card>
    </div>
</template>

<style lang="scss" scoped>
.profile {
  padding: 20px;
}
</style>