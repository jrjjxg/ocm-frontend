<template>
  <div class="fullscreen-layout">
    <!-- 顶部导航栏 -->
    <div class="fullscreen-header">
      <div class="header-left">
        <el-button 
          icon="el-icon-arrow-left" 
          type="text" 
          @click="goBack"
          class="back-button">
          返回
        </el-button>
        <span class="page-title">{{ pageTitle }}</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <i class="el-icon-user"></i>
            {{ currentUserName }}
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="fullscreen-main">
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'FullscreenLayout',
  computed: {
    ...mapGetters(['userName']),
    pageTitle() {
      return this.$route.meta.title || '在线学习系统'
    },
    currentUserName() {
      return this.userName || this.$store.state.user.name || '用户'
    }
  },
  methods: {
    goBack() {
      // 根据当前路由决定返回位置
      if (this.$route.path.includes('/homework/answer/')) {
        // 从答题页面返回到作业列表
        this.$router.push('/student/homework')
      } else if (this.$route.path.includes('/exam/') && this.$route.path.includes('/do')) {
        // 从考试页面返回到课程页面
        const courseId = this.$route.params.courseId || this.$route.query.courseId
        if (courseId) {
          this.$router.push(`/student/course/${courseId}`)
        } else {
          this.$router.push('/student/course/list')
        }
      } else {
        // 默认返回上一页
        this.$router.go(-1)
      }
    },
    
    handleCommand(command) {
      switch (command) {
        case 'profile':
          this.$router.push('/profile/index')
          break
        case 'logout':
          this.$confirm('确定要退出登录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$store.dispatch('user/logout').then(() => {
              this.$router.push('/login')
            })
          })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.fullscreen-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.fullscreen-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  .header-left {
    display: flex;
    align-items: center;

    .back-button {
      margin-right: 15px;
      font-size: 14px;
      
      &:hover {
        color: #409eff;
      }
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #606266;
      font-size: 14px;
      
      i {
        margin: 0 5px;
      }
      
      &:hover {
        color: #409eff;
      }
    }
  }
}

.fullscreen-main {
  flex: 1;
  overflow: auto;
  background-color: #f5f7fa;
}

// 响应式设计
@media (max-width: 768px) {
  .fullscreen-header {
    padding: 0 15px;
    
    .header-left {
      .page-title {
        font-size: 16px;
      }
    }
    
    .header-right {
      .user-info {
        font-size: 13px;
      }
    }
  }
}
</style>
