<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRole"
            >添加角色</el-button
          ></el-col
        ></el-row
      >
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scoped">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scoped.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="4">
                <el-tag closable @close="removeRightById(scoped.row, item1.id)">
                  {{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.key"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scoped.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scoped.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scoped">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRole(scoped.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scoped.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scoped.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="ID" v-if="isEdit">
          <el-input v-model="addForm.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 控制分配权限的对话框显示与因此
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值
      defKeys: [],
      // 即将分配角色的ID
      roleId: '',
      // 控制添加角色的对话框
      addRoleDialogVisible: false,
      // 添加角色的表单
      addForm: {
        roleName: '',
        roleDesc: '',
        id: ''
      },
      // 添加角色的验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ]
      },
      // 是否是编辑
      isEdit: false
    }
  },
  created () {
    // 获取所有权限
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rolesList = res.data
    },
    // 移除权限
    async removeRightById (role, rightId) {
      // 弹窗提示用户
      const confirmRuselt = await this.$confirm('此操作将移除权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRuselt !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }
      // 获取到的数据保存到data中
      this.rightsList = res.data
      // 获取权限
      this.getLeafKeys(role, this.defKeys)
      // 获取所有权限列表
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的ID，并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前node节点不好含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(element => {
        this.getLeafKeys(element, arr)
      })
    },
    // 情况权限列表
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      }
      this.$message.success('更新权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 显示添加角色对话框
    async showAddRole () {
      this.isEdit = false
      this.addRoleDialogVisible = true
    },
    // 展示编辑角色对话框
    async showEditRole (row) {
      this.addForm.id = row.id
      this.addForm.roleName = row.roleName
      this.addForm.roleDesc = row.roleDesc
      this.isEdit = true
      this.addRoleDialogVisible = true
    },
    // 添加角色对话框关闭事件
    addRoleDialogClosed () {
      this.$refs.addFormRef.resetFields()
      this.addForm.id = ''
      this.addForm.roleName = ''
      this.addForm.roleDesc = ''
    },
    // 添加角色
    addRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 添加网路请求
        if (this.isEdit) {
          const { data: res } = await this.$http.put('roles/' + this.addForm.id, this.addForm)
          console.log(res)
          if (res.meta.status !== 200) {
            return this.$message.error('修改角色失败')
          }
          this.$message.success('修改角色成功')
        } else {
          const { data: res } = await this.$http.post('roles', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error('创建角色失败')
          }
          this.$message.success('创建角色成功')
        }
        // 隐藏对话框
        this.addRoleDialogVisible = false
        // 重新获取列表
        this.getRolesList()
      })
    },
    // 删除角色
    async removeUserById (id) {
      // 弹窗询问是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该角色，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'waring'
      }).catch(err => err)
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消了删除')
      } else {
        const { data: res } = await this.$http.delete(`roles/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
        this.$message.success('删除了该角色')
        this.getRolesList()
      }
    }
  }
}
</script>

<style>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
