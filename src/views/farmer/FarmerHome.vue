<script lang="ts" setup>
import router from '@/router';
import { ref } from 'vue';

const isCollapse = ref(false);

const goHome = () => {
    router.push('/farmer');
}

</script>

<template>
    <div class="farmer-home">
        <el-container>
            <el-header>
                <div class="header-left">
                    <img src="https://img.icons8.com/color/48/tractor.png" alt="logo" class="logo-icon" />
                    <div class="logo-name" @click="goHome">商家中心</div>
                </div>
                <div class="header-right">
                    <el-button size="small">退出登录</el-button>
                </div>
            </el-header>

            <el-container>
                <el-aside :width="isCollapse ? '64px' : '200px'">
                   <el-menu router unique-opened :collapse="isCollapse">
                        <el-menu-item index="/farmer/sale">
                            <el-icon><IEpHistogram /></el-icon>
                            <span>销售情况</span>
                        </el-menu-item>
                        
                        <el-menu-item index="/farmer/product">
                            <el-icon><IEpGoodsFilled /></el-icon>
                            <span>商品管理</span>
                        </el-menu-item>

                        <el-menu-item index="/farmer/order">
                            <el-icon><IEpList /></el-icon>
                            <span>订单管理</span>   
                        </el-menu-item>

                        <el-menu-item index="/farmer/comment">
                            <el-icon><IEpComment /></el-icon>
                            <span>客户评价</span>
                        </el-menu-item>

                        <el-menu-item index="/farmer/profile">
                            <el-icon><IEpAvatar /></el-icon>
                            <span>个人资料</span>
                        </el-menu-item>

                        <el-menu-item>
                            <el-icon @click="isCollapse = !isCollapse">
                                <IEpExpand v-show="isCollapse" />
                                <IEpFold v-show="!isCollapse" />
                            </el-icon>
                        </el-menu-item>
                    </el-menu>
                </el-aside>

                <el-main>
                    <router-view />
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<style lang="scss" scoped>
.farmer-home{
    background-color: #f8f8f8;
    .el-header{
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        height: 60px;

        .header-left{
            display: flex;
            align-items: center;
            gap: 10px;

            .logo-icon{
                width: 40px;
                height: 40px;
            }

            .logo-name{
                font-size: 20px;
                font-weight: 600;
                color: #2c3e50;
                margin-left: 10px;
            }
        }
        .header-right{
            display: flex;
            align-items: center;
            gap: 12px;
        }
    }
    .el-aside{
        background-color: #fff;
        height: 100vh;
        .el-menu{
            background-color: #fff;
            border-right: none;
            width: 200px;
        }
    }
    
}
.el-menu--collapse{
    width: 60px ;
}
.el-menu--collapse h1{
    display: none;
}
</style>