<template>
    <div class="modern-navbar">
        <div class="navbar-content">
            <!-- 左侧Logo和标题 -->
            <div class="navbar-left">
                <div class="logo-section">
                    <div class="logo">
                        <i class="el-icon-reading"></i>
                    </div>
                    <div class="brand-info">
                        <h1 class="brand-title">在线考试系统</h1>
                        <p class="brand-subtitle">Online Exam System</p>
                    </div>
                </div>
            </div>

            <!-- 中间导航菜单 -->
            <div class="navbar-center">
                <nav class="nav-menu">
                    <div 
                        v-for="item in menuItems" 
                        :key="item.path"
                        class="nav-item"
                        :class="{ 'active': isActive(item.path) }"
                        @click="navigateTo(item.path)"
                    >
                        <i :class="item.icon"></i>
                        <span>{{ item.title }}</span>
                    </div>
                </nav>
            </div>

            <!-- 右侧用户信息 -->
            <div class="navbar-right">
                <div class="user-section">
                    <!-- 通知 -->
                    <div class="notification-btn" @click="showNotifications">
                        <el-badge :value="notificationCount" :hidden="notificationCount === 0">
                            <i class="el-icon-bell"></i>
                        </el-badge>
                    </div>

                    <!-- 用户信息 -->
                    <el-dropdown @command="handleUserCommand" class="user-dropdown">
                        <div class="user-info">
                            <el-avatar :size="36" :src="userInfo.avatar" class="user-avatar">
                                <i class="el-icon-user-solid"></i>
                            </el-avatar>
                            <div class="user-details">
                                <div class="user-name">{{ userInfo.name }}</div>
                                <div class="user-role">{{ userInfo.role }}</div>
                            </div>
                            <i class="el-icon-arrow-down"></i>
                        </div>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="profile">
                                <i class="el-icon-user"></i>
                                个人资料
                            </el-dropdown-item>
                            <el-dropdown-item command="settings">
                                <i class="el-icon-setting"></i>
                                系统设置
                            </el-dropdown-item>
                            <el-dropdown-item divided command="logout">
                                <i class="el-icon-switch-button"></i>
                                退出登录
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </div>
        </div>

        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn" @click="toggleMobileMenu">
            <i class="el-icon-menu"></i>
        </div>

        <!-- 移动端菜单 -->
        <div class="mobile-menu" :class="{ 'active': mobileMenuVisible }">
            <div class="mobile-menu-header">
                <div class="user-info-mobile">
                    <el-avatar :size="48" :src="userInfo.avatar">
                        <i class="el-icon-user-solid"></i>
                    </el-avatar>
                    <div class="user-details-mobile">
                        <div class="user-name">{{ userInfo.name }}</div>
                        <div class="user-role">{{ userInfo.role }}</div>
                    </div>
                </div>
                <div class="close-btn" @click="toggleMobileMenu">
                    <i class="el-icon-close"></i>
                </div>
            </div>
            <div class="mobile-menu-content">
                <div 
                    v-for="item in menuItems" 
                    :key="item.path"
                    class="mobile-nav-item"
                    :class="{ 'active': isActive(item.path) }"
                    @click="navigateToMobile(item.path)"
                >
                    <i :class="item.icon"></i>
                    <span>{{ item.title }}</span>
                </div>
                <div class="mobile-menu-footer">
                    <div class="mobile-nav-item" @click="handleUserCommand('profile')">
                        <i class="el-icon-user"></i>
                        <span>个人资料</span>
                    </div>
                    <div class="mobile-nav-item" @click="handleUserCommand('settings')">
                        <i class="el-icon-setting"></i>
                        <span>系统设置</span>
                    </div>
                    <div class="mobile-nav-item logout" @click="handleUserCommand('logout')">
                        <i class="el-icon-switch-button"></i>
                        <span>退出登录</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 移动端遮罩 -->
        <div 
            class="mobile-overlay" 
            :class="{ 'active': mobileMenuVisible }"
            @click="toggleMobileMenu"
        ></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'ModernNavbar',
    data() {
        return {
            mobileMenuVisible: false,
            notificationCount: 3
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        
        menuItems() {
            const role = this.userInfo.role
            if (role === 'teacher') {
                return [
                    { path: '/teacher/dashboard', title: '工作台', icon: 'el-icon-monitor' },
                    { path: '/teacher/courses', title: '课程管理', icon: 'el-icon-notebook-1' },
                    { path: '/teacher/exams', title: '测验管理', icon: 'el-icon-document-checked' },
                    { path: '/teacher/questions', title: '题库管理', icon: 'el-icon-collection' },
                    { path: '/teacher/grades', title: '成绩管理', icon: 'el-icon-data-analysis' }
                ]
            } else {
                return [
                    { path: '/student/dashboard', title: '学习中心', icon: 'el-icon-monitor' },
                    { path: '/student/courses', title: '我的课程', icon: 'el-icon-notebook-1' },
                    { path: '/student/exams', title: '在线测验', icon: 'el-icon-document-checked' },
                    { path: '/student/grades', title: '我的成绩', icon: 'el-icon-data-analysis' },
                    { path: '/student/homework', title: '作业中心', icon: 'el-icon-edit-outline' }
                ]
            }
        }
    },
    methods: {
        isActive(path) {
            return this.$route.path.startsWith(path)
        },

        navigateTo(path) {
            if (this.$route.path !== path) {
                this.$router.push(path)
            }
        },

        navigateToMobile(path) {
            this.navigateTo(path)
            this.toggleMobileMenu()
        },

        toggleMobileMenu() {
            this.mobileMenuVisible = !this.mobileMenuVisible
        },

        showNotifications() {
            this.$message.info('通知功能开发中...')
        },

        handleUserCommand(command) {
            switch (command) {
                case 'profile':
                    this.$router.push('/profile')
                    break
                case 'settings':
                    this.$router.push('/settings')
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
.modern-navbar {
    background: white;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 0;
    z-index: 1000;
    
    .navbar-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 30px;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .navbar-left {
            .logo-section {
                display: flex;
                align-items: center;
                gap: 16px;
                
                .logo {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                }
                
                .brand-info {
                    .brand-title {
                        font-size: 20px;
                        font-weight: 700;
                        color: #2c3e50;
                        margin: 0 0 2px 0;
                        line-height: 1;
                    }
                    
                    .brand-subtitle {
                        font-size: 12px;
                        color: #7f8c8d;
                        margin: 0;
                        line-height: 1;
                    }
                }
            }
        }
        
        .navbar-center {
            .nav-menu {
                display: flex;
                gap: 8px;
                
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #606266;
                    font-weight: 500;
                    
                    &:hover {
                        background: #f8f9fa;
                        color: #667eea;
                    }
                    
                    &.active {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    }
                    
                    i {
                        font-size: 18px;
                    }
                    
                    span {
                        font-size: 14px;
                    }
                }
            }
        }
        
        .navbar-right {
            .user-section {
                display: flex;
                align-items: center;
                gap: 20px;
                
                .notification-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: #f8f9fa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    
                    &:hover {
                        background: #e9ecef;
                    }
                    
                    i {
                        font-size: 18px;
                        color: #606266;
                    }
                }
                
                .user-dropdown {
                    .user-info {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 8px 16px;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        
                        &:hover {
                            background: #f8f9fa;
                        }
                        
                        .user-avatar {
                            border: 2px solid #e9ecef;
                        }
                        
                        .user-details {
                            .user-name {
                                font-size: 14px;
                                font-weight: 600;
                                color: #2c3e50;
                                line-height: 1;
                                margin-bottom: 2px;
                            }
                            
                            .user-role {
                                font-size: 12px;
                                color: #7f8c8d;
                                line-height: 1;
                            }
                        }
                        
                        .el-icon-arrow-down {
                            color: #909399;
                            font-size: 12px;
                        }
                    }
                }
            }
        }
    }
    
    .mobile-menu-btn {
        display: none;
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: #f8f9fa;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        
        i {
            font-size: 20px;
            color: #606266;
        }
    }
    
    .mobile-menu {
        position: fixed;
        top: 0;
        right: -300px;
        width: 300px;
        height: 100vh;
        background: white;
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        z-index: 1001;
        
        &.active {
            right: 0;
        }
        
        .mobile-menu-header {
            padding: 30px 20px 20px 20px;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .user-info-mobile {
                display: flex;
                align-items: center;
                gap: 12px;
                
                .user-details-mobile {
                    .user-name {
                        font-size: 16px;
                        font-weight: 600;
                        color: #2c3e50;
                        margin-bottom: 4px;
                    }
                    
                    .user-role {
                        font-size: 14px;
                        color: #7f8c8d;
                    }
                }
            }
            
            .close-btn {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: #f8f9fa;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                
                i {
                    font-size: 16px;
                    color: #606266;
                }
            }
        }
        
        .mobile-menu-content {
            padding: 20px 0;
            
            .mobile-nav-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                color: #606266;
                
                &:hover {
                    background: #f8f9fa;
                    color: #667eea;
                }
                
                &.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }
                
                &.logout {
                    color: #f56c6c;
                    
                    &:hover {
                        background: #fef0f0;
                        color: #f56c6c;
                    }
                }
                
                i {
                    font-size: 18px;
                    width: 20px;
                }
                
                span {
                    font-size: 14px;
                    font-weight: 500;
                }
            }
            
            .mobile-menu-footer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #f0f0f0;
            }
        }
    }
    
    .mobile-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        
        &.active {
            opacity: 1;
            visibility: visible;
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .modern-navbar {
        .navbar-content {
            padding: 0 20px;

            .navbar-center {
                .nav-menu {
                    gap: 4px;

                    .nav-item {
                        padding: 10px 16px;

                        span {
                            font-size: 13px;
                        }
                    }
                }
            }
        }
    }
}

@media (max-width: 992px) {
    .modern-navbar {
        .navbar-content {
            .navbar-center {
                display: none;
            }

            .navbar-right {
                .user-section {
                    gap: 12px;

                    .user-dropdown {
                        .user-info {
                            .user-details {
                                display: none;
                            }
                        }
                    }
                }
            }
        }

        .mobile-menu-btn {
            display: flex;
        }
    }
}

@media (max-width: 768px) {
    .modern-navbar {
        .navbar-content {
            padding: 0 15px;
            height: 60px;

            .navbar-left {
                .logo-section {
                    gap: 12px;

                    .logo {
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                    }

                    .brand-info {
                        .brand-title {
                            font-size: 18px;
                        }

                        .brand-subtitle {
                            font-size: 11px;
                        }
                    }
                }
            }

            .navbar-right {
                .user-section {
                    .notification-btn {
                        width: 36px;
                        height: 36px;

                        i {
                            font-size: 16px;
                        }
                    }

                    .user-dropdown {
                        .user-info {
                            padding: 6px 12px;

                            .user-avatar {
                                width: 32px;
                                height: 32px;
                            }
                        }
                    }
                }
            }
        }

        .mobile-menu-btn {
            right: 15px;
            width: 36px;
            height: 36px;

            i {
                font-size: 18px;
            }
        }

        .mobile-menu {
            width: 280px;

            .mobile-menu-header {
                padding: 25px 15px 15px 15px;

                .user-info-mobile {
                    gap: 10px;

                    .user-details-mobile {
                        .user-name {
                            font-size: 15px;
                        }

                        .user-role {
                            font-size: 13px;
                        }
                    }
                }
            }

            .mobile-menu-content {
                padding: 15px 0;

                .mobile-nav-item {
                    padding: 14px 15px;

                    i {
                        font-size: 16px;
                    }

                    span {
                        font-size: 13px;
                    }
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .modern-navbar {
        .navbar-content {
            .navbar-left {
                .logo-section {
                    .brand-info {
                        .brand-subtitle {
                            display: none;
                        }
                    }
                }
            }
        }

        .mobile-menu {
            width: 100vw;
            right: -100vw;
        }
    }
}
</style>
