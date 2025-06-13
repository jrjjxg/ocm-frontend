<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="login-background">
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">
            <svg-icon icon-class="education" />
          </div>
        </div>
        <h1 class="title">在线课程管理系统</h1>
        <p class="subtitle">欢迎回来，请登录您的账户</p>
      </div>

      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
        label-position="left">

        <el-form-item prop="userName" class="form-item">
          <div class="input-wrapper">
            <span class="input-icon">
              <svg-icon icon-class="user" />
            </span>
            <el-input ref="userName" v-model="loginForm.userName" placeholder="请输入用户名" name="userName" type="text"
              tabindex="1" auto-complete="on" class="login-input" />
          </div>
        </el-form-item>

        <el-tooltip v-model="capsTooltip" content="大写锁定已开启" placement="right" manual>
          <el-form-item prop="password" class="form-item">
            <div class="input-wrapper">
              <span class="input-icon">
                <svg-icon icon-class="password" />
              </span>
              <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
                placeholder="请输入密码" name="password" tabindex="2" auto-complete="on" class="login-input"
                @keyup.native="checkCapslock" @blur="capsTooltip = false" @keyup.enter.native="handleLogin" />
              <span class="show-pwd" @click="showPwd">
                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
              </span>
            </div>
          </el-form-item>
        </el-tooltip>

        <div class="login-options">
          <el-checkbox v-model="loginForm.remember" class="remember-checkbox">
            记住密码
          </el-checkbox>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>

        <el-button :loading="loading" type="primary" class="login-button" @click.native.prevent="handleLogin">
          <span v-if="!loading">登录</span>
          <span v-else>登录中...</span>
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import loginApi from '@/api/login'

export default {
  name: 'BeautifulLogin',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('用户名不能少于5个字符'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('密码不能少于5个字符'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        userName: '',
        password: '',
        remember: false
      },
      loginRules: {
        userName: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.userName === '') {
      this.$refs.userName.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        // eslint-disable-next-line no-mixed-operators
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      let _this = this
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          loginApi.login(this.loginForm).then(function (result) {
            if (result && result.code === 1) {
              _this.setUserName(_this.loginForm.userName)
              _this.setUserInfo(JSON.stringify(result.response))

              _this.$store.dispatch('router/initializeRoutes').then(() => {
                const userInfo = result.response
                if (userInfo && userInfo.role === 1) {
                  _this.$router.push({ path: '/student/course/list' })
                } else if (userInfo && userInfo.role === 2) {
                  _this.$router.push({ path: '/teacher' })
                } else if (userInfo && userInfo.role === 3) {
                  _this.$router.push({ path: '/dashboard' })
                } else {
                  _this.$router.push({ path: '/' })
                }
              })
            } else {
              _this.loading = false
              _this.$message({
                message: result.message,
                type: 'error'
              })
            }
          }).catch(function (reason) {
            _this.loading = false
            _this.$message({
              message: (reason && reason.message) || '登录请求失败',
              type: 'error'
            })
          })
        } else {
          return false
        }
      })
    },
    ...mapMutations('user', ['setUserName', 'setUserInfo'])
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .bg-shapes {
    position: relative;
    width: 100%;
    height: 100%;

    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      animation: float 6s ease-in-out infinite;

      &.shape-1 {
        width: 200px;
        height: 200px;
        top: 10%;
        left: 15%;
        animation-delay: 0s;
      }

      &.shape-2 {
        width: 150px;
        height: 150px;
        top: 60%;
        right: 20%;
        animation-delay: 2s;
      }

      &.shape-3 {
        width: 100px;
        height: 100px;
        bottom: 20%;
        left: 70%;
        animation-delay: 4s;
      }
    }
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.login-card {
  position: relative;
  z-index: 10;
  width: 450px;
  max-width: 90%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    margin-bottom: 20px;

    .logo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

      .svg-icon {
        font-size: 40px;
        color: white;
      }
    }
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 16px;
    color: #7f8c8d;
    margin: 0;
    font-weight: 400;
  }
}

.login-form {
  .form-item {
    margin-bottom: 25px;

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: #f8f9fa;
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      overflow: hidden;

      &:hover {
        border-color: #e9ecef;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      &:focus-within {
        border-color: #667eea;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
      }

      .input-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        color: #95a5a6;
        font-size: 18px;
      }

      .show-pwd {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #95a5a6;
        cursor: pointer;
        font-size: 18px;
        transition: color 0.3s ease;

        &:hover {
          color: #667eea;
        }
      }
    }
  }
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  .remember-checkbox {
    color: #7f8c8d;
    font-size: 14px;
  }

  .forgot-password {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;

    &:hover {
      color: #764ba2;
    }
  }
}

.login-button {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 30px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.role-tips {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;

  .tip-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .tip-role {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }

    .tip-account {
      color: #7f8c8d;
      font-size: 14px;
      font-family: 'Courier New', monospace;
    }
  }
}

.login-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-align: center;
}

// Element UI 样式覆盖
::v-deep .el-input__inner {
  border: none;
  background: transparent;
  height: 50px;
  line-height: 50px;
  padding: 0 50px 0 0;
  font-size: 16px;
  color: #2c3e50;

  &::placeholder {
    color: #bdc3c7;
  }

  &:focus {
    border: none;
    box-shadow: none;
  }
}

::v-deep .el-form-item__error {
  color: #e74c3c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  left: 0;
}

::v-deep .el-checkbox__label {
  color: #7f8c8d;
  font-size: 14px;
}

::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #667eea;
  border-color: #667eea;
}

// 响应式设计
@media (max-width: 768px) {
  .login-card {
    width: 95%;
    padding: 30px 20px;
  }

  .login-header {
    .title {
      font-size: 24px;
    }

    .subtitle {
      font-size: 14px;
    }
  }

  .role-tips {
    .tip-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
}
</style>