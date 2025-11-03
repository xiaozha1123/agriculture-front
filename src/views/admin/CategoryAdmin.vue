<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// ✅ 模拟后台返回的商品类别数据
interface Category {
  id: number;
  name: string;
  description: string;
}

const categoryList = ref<Category[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增类别");

// 当前编辑的类别对象
const form = reactive<Category>({
  id: 0,
  name: "",
  description: "",
});

// 模拟加载数据
const loadCategories = () => {
  categoryList.value = [
    { id: 1, name: "蔬菜类", description: "新鲜蔬菜" },
    { id: 2, name: "水果类", description: "时令水果" },
    { id: 3, name: "粮油类", description: "粮食与食用油" },
    { id: 4, name: "农资类", description: "农药、化肥、农具等" },
  ];
};

// 打开新增弹窗
const handleAdd = () => {
  dialogTitle.value = "新增类别";
  form.id = 0;
  form.name = "";
  form.description = "";
  dialogVisible.value = true;
};

// 打开编辑弹窗
const handleEdit = (row: Category) => {
  dialogTitle.value = "编辑类别";
  form.id = row.id;
  form.name = row.name;
  form.description = row.description;
  dialogVisible.value = true;
};

// 保存类别（新增或编辑）
const handleSave = () => {
  if (!form.name.trim()) {
    ElMessage.warning("类别名称不能为空");
    return;
  }
  if (form.id === 0) {
    // 新增
    const newId = categoryList.value.length + 1;
    categoryList.value.push({
      id: newId,
      name: form.name,
      description: form.description,
    });
    ElMessage.success("新增成功");
  } else {
    // 修改
    const index = categoryList.value.findIndex((c) => c.id === form.id);
    if (index !== -1) {
      const item = categoryList.value[index];
      if (item) {
        item.name = form.name;
        item.description = form.description;
        ElMessage.success("修改成功");
      }
    }
  }
  dialogVisible.value = false;
};

// 删除类别
const handleDelete = (row: Category) => {
  ElMessageBox.confirm(`确定要删除 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      categoryList.value = categoryList.value.filter((c) => c.id !== row.id);
      ElMessage.success("删除成功");
    })
    .catch(() => {
      ElMessage.info("已取消操作");
    });
};

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div class="category-manage">
    <div class="header">
      <h2>🗂️ 商品类别</h2>
      <el-button type="primary" @click="handleAdd">新增类别</el-button>
    </div>

    <el-table :data="categoryList" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="类别名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗表单 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px">
      <el-form label-width="80px">
        <el-form-item label="类别名称">
          <el-input v-model="form.name" placeholder="请输入类别名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="请输入描述信息" />
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
.category-manage {
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h2 {
      font-weight: 600;
      color: #333;
    }
  }

  .el-table {
    border-radius: 6px;
  }
}
</style>
