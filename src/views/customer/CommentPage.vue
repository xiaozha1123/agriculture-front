<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

interface CommentLookDTO {
  commentId: number
  productName: string
  content: string
  createTime: string
}

const myComments = ref<CommentLookDTO[]>([])
const loading = ref(false)
const userId = ref<number | null>(null)

const sortedMyComments = computed(() => {
  return [...myComments.value].sort((a, b) => a.commentId - b.commentId)
})

// 根据用户名获取用户ID
const fetchUserIdByUsername = async (username: string): Promise<number | null> => {
  try {
    const response = await fetch(`http://localhost:8080/user/userId?username=${encodeURIComponent(username)}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('获取用户ID失败')
    }

    const result = await response.json()
    return result.data || result
    
  } catch (error) {
    console.error('获取用户ID失败:', error)
    ElMessage.error('获取用户信息失败')
    return null
  }
}

// 从sessionStorage获取用户名并获取用户ID
const initializeUser = async () => {
  const username = sessionStorage.getItem('username')
  if (!username) {
    ElMessage.warning('请先登录')
    return false
  }

  const id = await fetchUserIdByUsername(username)
  if (id) {
    userId.value = id
    return true
  }
  return false
}

// 获取我的评价记录
const fetchMyComments = async () => {
  try {
    if (!userId.value) {
      const success = await initializeUser()
      if (!success) return
    }

    loading.value = true
    const response = await fetch(`http://localhost:8080/comment/customer/${userId.value}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 404) {
        myComments.value = []
        return
      }
      throw new Error(errorData.message || '获取评价记录失败')
    }

    const result = await response.json()
    myComments.value = result.data || []
    
  } catch (error) {
    console.error('获取评价记录失败:', error)
    ElMessage.error('获取评价记录失败')
    myComments.value = []
  } finally {
    loading.value = false
  }
}

// 删除评价
const deleteComment = async (comment: CommentLookDTO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除对"${comment.productName}"的评价吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (!userId.value) {
      const success = await initializeUser()
      if (!success) return
    }

    const response = await fetch(`http://localhost:8080/comment/delete/${comment.commentId}/${userId.value}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '删除评价失败')
    }

    const result = await response.json()
    
    if (result.success) {
      ElMessage.success('评价删除成功')
      await fetchMyComments()
    } else {
      ElMessage.error(result.message || '删除评价失败')
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评价失败:', error)
      ElMessage.error('删除评价失败')
    }
  }
}

// 页面加载
onMounted(async () => {
  await initializeUser()
  fetchMyComments()
})
</script>

<template>
  <div class="comment-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>我的评价记录</h2>
          <span class="count-badge">共 {{ sortedMyComments.length }} 条评价</span>
        </div>
      </template>
      
      <div v-loading="loading" class="content-wrapper">
        <div v-if="sortedMyComments.length === 0" class="empty-state">
          <el-empty description="暂无评价记录" />
        </div>

        <div v-else class="comments-list">
          <el-card 
            v-for="comment in sortedMyComments" 
            :key="comment.commentId"
            class="comment-card"
            shadow="hover"
          >
            <div class="comment-content">
              <!-- 商品信息和评价头部 -->
              <div class="comment-header">
                <div class="product-info">
                  <h3 class="product-name">{{ comment.productName }}</h3>
                  <div class="order-info">
                    <el-tag type="primary" size="small" effect="plain">
                      评价ID: {{ comment.commentId }}
                    </el-tag>
                  </div>
                </div>
                <div class="comment-meta">
                  <span class="create-time">{{ comment.createTime }}</span>
                </div>
              </div>
              
              <!-- 评价内容 -->
              <div class="comment-body">
                <div class="comment-text">
                  {{ comment.content }}
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="comment-actions">
                <el-button 
                  type="danger" 
                  size="small" 
                  plain
                  @click="deleteComment(comment)"
                >
                  <el-icon><Delete /></el-icon>
                  删除评价
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.comment-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 20px;
      font-weight: 600;
    }

    .count-badge {
      background: #f0f2f5;
      color: #909399;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
    }
  }

  .content-wrapper {
    min-height: 400px;
    padding: 10px 0;
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .comment-card {
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .comment-content {
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;

          .product-info {
            flex: 1;

            .product-name {
              margin: 0 0 8px 0;
              font-size: 16px;
              color: #303133;
              font-weight: 500;
            }

            .order-info {
              .el-tag {
                font-size: 12px;
              }
            }
          }

          .comment-meta {
            .create-time {
              color: #909399;
              font-size: 13px;
              background: #f5f7fa;
              padding: 4px 8px;
              border-radius: 4px;
            }
          }
        }

        .comment-body {
          margin-bottom: 16px;

          .comment-text {
            color: #606266;
            line-height: 1.6;
            font-size: 14px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 3px solid #409eff;
          }
        }

        .comment-actions {
          text-align: right;
          
          .el-button {
            border-radius: 4px;
            
            .el-icon {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .comment-page {
    padding: 16px;

    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .comments-list .comment-card .comment-content {
      .comment-header {
        flex-direction: column;
        gap: 8px;
      }

      .comment-actions {
        text-align: center;
      }
    }
  }
}
</style>