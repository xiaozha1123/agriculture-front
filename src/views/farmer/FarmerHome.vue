<script lang="ts" setup>
import router from '@/router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';

const isCollapse = ref(false);
const username = ref(''); // 用户名
const dropdownVisible = ref(false); // 下拉菜单显示状态

// 获取用户信息
const getUsername = () => {
  const sessionUser = sessionStorage.getItem('username');
  if (sessionUser) {
    username.value = sessionUser;
  }
};

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    // 退出登录逻辑
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    
    ElMessage.success('退出成功');
    
    router.push('/');
  } catch {
    console.log('取消退出');
  }
};

// 切换下拉菜单
const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

// 点击其他地方关闭下拉菜单
const closeDropdown = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-dropdown')) {
    dropdownVisible.value = false;
  }
};

const goHome = () => {
    router.push('/farmer');
}

const handleApply = () => {
    router.push({ path: '/apply', query: { username: username.value } });
}

onMounted(() => {
  getUsername();
  document.addEventListener('click', closeDropdown);
});

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
                    <div class="user-info user-dropdown" @click="toggleDropdown">
                        <div class="user-avatar">
                            <el-avatar :size="32" :src="''">
                                {{ username ? username.charAt(0).toUpperCase() : 'U' }}
                            </el-avatar>
                        </div>
                        <span class="username">{{ username }}</span>
                        <el-icon class="dropdown-arrow">
                            <IEpArrowDown />
                        </el-icon>

                        <transition name="el-zoom-in-top">
                            <div v-show="dropdownVisible" class="dropdown-menu">
                                <div class="dropdown-item apply" @click="handleApply">
                                    <el-icon><IEpShop /></el-icon>
                                    <span>申请商铺</span>
                                </div>
                                <div class="dropdown-item logout" @click="handleLogout">
                                    <el-icon><IEpSwitchButton /></el-icon>
                                    <span>退出登录</span>
                                </div>
                            </div>
                        </transition>
                    </div>
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
            .user-info {
                position: relative;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.3s;

                &:hover {
                background-color: #f5f5f5;
                }

                .user-avatar {
                display: flex;
                align-items: center;
                }

                .username {
                font-size: 14px;
                color: #333;
                font-weight: 500;
                }

                .dropdown-arrow {
                color: #666;
                transition: transform 0.3s;
                }

                &:hover .dropdown-arrow {
                transform: rotate(180deg);
                }

                .dropdown-menu {
                position: absolute;
                top: 100%;
                right: 0;
                width: 120px;
                background: #fff;
                border: 1px solid #e4e7ed;
                border-radius: 4px;
                box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
                z-index: 1000;
                margin-top: 4px;

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    font-size: 14px;

                    &:hover {
                    background-color: #f5f7fa;
                    }

                    &.apply {
                    color: #409eff;
                    }

                    &.logout {
                    color: #f56c6c;

                    &:hover {
                        background-color: #fef0f0;
                    }
                    }
                }
                }
            }
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