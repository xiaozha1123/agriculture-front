<script lang="ts" setup>
import router from '@/router';
import { ref } from 'vue';

const isCollapse = ref(false);

const goHome = () => {
    router.push('/admin');
}
</script>

<template>
  <div class="home">
    <el-container>
      <el-header>
        <div class="header-left" @click="goHome">
            <img src="https://img.icons8.com/color/48/tractor.png" alt="logo" class="logo-icon" />
            <div class="logo-name">管理平台</div>
        </div>
        <div class="header-right">
            <el-button>退出登录</el-button>
        </div>
      </el-header>

      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
            <el-scrollbar>
              <transition name="slide-fade">
                <el-menu router unique-opend :collapse="isCollapse">
                    <el-menu-item index="/admin/user/list">
                        <el-icon><IEpUserFilled /></el-icon>
                        <span>用户管理</span>
                    </el-menu-item>

                    <el-sub-menu index="2">
                        <template #title>
                            <el-icon><IEpHistogram /></el-icon>
                            <span>商品管理</span>
                        </template>
                        <el-menu-item index="/admin/product/operation">
                            <span>商品列表</span>
                        </el-menu-item>
                        <el-menu-item index="/admin/product/category">
                            <span>分类管理</span>
                        </el-menu-item>
                    </el-sub-menu>

                    <el-menu-item index="/admin/order">
                        <el-icon><IEpList /></el-icon>
                        <span>订单管理</span>
                    </el-menu-item>

                    <el-menu-item index="/admin/announcement">
                        <el-icon><IEpPlatform /></el-icon>
                        <span>公告管理</span>
                    </el-menu-item>

                    <el-menu-item index="/admin/review">
                        <el-icon><IEpComment /></el-icon>
                        <span>商家审核</span>
                    </el-menu-item>

                    <el-menu-item>
                        <el-icon @click="isCollapse = !isCollapse">
                            <IEpExpand v-show="isCollapse" />
                            <IEpFold v-show="!isCollapse" />
                        </el-icon>
                    </el-menu-item>

                </el-menu>
              </transition>
            </el-scrollbar>
        </el-aside>


        <el-main>
            <router-view />
        </el-main>
      </el-container>

    </el-container>
  </div>
</template>


<style lang="scss" scoped>
.home{
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
        .collapse-btn{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 50px;
            cursor: pointer;
            color: #606266;

            &:hover{
                background-color: #f0f0f0;
            }
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