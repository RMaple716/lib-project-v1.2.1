<template>
  <div class="login-register-container">
    <div class="container">
      <!-- 登录表单 -->
      <form 
        id="loginForm" 
        class="form" 
        :class="{ active: activeForm === 'login', hidden: activeForm !== 'login' }"
        @submit.prevent="handleLogin"
      >
        <h2>用户登录</h2>
        <div class="form-group">
          <input 
            type="text" 
            id="loginAccount" 
            v-model="loginForm.account"
            placeholder=" " 
            required
          >
          <label for="loginAccount">账号</label>
        </div>
        <div class="form-group">
          <input 
            type="password" 
            id="loginPassword" 
            v-model="loginForm.password"
            placeholder=" " 
            required
          >
          <label for="loginPassword">密码</label>
        </div>
        <div class="form-group">
          <select id="loginUserType" v-model="loginForm.userType">
            <option value="reader">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="remember-me">
          <input type="checkbox" id="remember" v-model="rememberMe"/>
          <label for="remember">记住我</label>
        </div>
        <button type="submit">登录</button>
        <p class="toggle-form">没有账号？ 
          <a href="#" @click.prevent="switchForm('register')">立即注册</a>
        </p>
      </form>

      <!-- 注册表单 -->
      <form 
        id="registerForm" 
        class="form" 
        :class="{ active: activeForm === 'register', hidden: activeForm !== 'register' }"
        @submit.prevent="handleRegister"
      >
        <h2>用户注册</h2>
        <div class="form-group">
          <input 
            type="text" 
            id="registerAccount" 
            v-model="registerForm.account"
            placeholder=" " 
            required
          >
          <label for="registerAccount">账号</label>
        </div>
        <div class="form-group">
          <input 
            type="text" 
            id="registerName" 
            v-model="registerForm.name"
            placeholder=" " 
            required
          >
          <label for="registerName">姓名</label>
        </div>
        <div class="form-group">
          <input 
            type="email" 
            id="registerEmail" 
            v-model="registerForm.email"
            placeholder=" " 
            required
            @input="validateEmail"
          >
          <label for="registerEmail">邮箱</label>
        </div>
        <div class="form-group">
          <select id="registerUserType" v-model="registerForm.userType">
            <option value="reader">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="form-group">
          <input 
            type="password" 
            id="registerPassword" 
            v-model="registerForm.password"
            placeholder=" " 
            required
            @input="checkPasswordStrength"
          >
          <label for="registerPassword">密码</label>
          <div class="password-strength">
            <span 
              class="strength-bar" 
              :style="{ backgroundColor: passwordStrength.bars[0] }"
            ></span>
            <span 
              class="strength-bar" 
              :style="{ backgroundColor: passwordStrength.bars[1] }"
            ></span>
            <span 
              class="strength-bar" 
              :style="{ backgroundColor: passwordStrength.bars[2] }"
            ></span>
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
        </div>
        <div class="form-group">
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="registerForm.confirmPassword"
            placeholder=" " 
            required
            @input="checkPasswordMatch"
          >
          <label for="confirmPassword">确认密码</label>
          <span class="error-message" id="passwordError">{{ passwordError }}</span>
        </div>
        <button type="submit">注册</button>
        <p class="toggle-form">已有账号？ 
          <a href="#" @click.prevent="switchForm('login')">立即登录</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginRegister',
  data() {
    return {
      activeForm: 'login', // 'login' 或 'register'
      rememberMe: false,
      loginForm: {
        account: '',
        password: '',
        userType: 'reader'
      },
      registerForm: {
        account: '',
        name: '',
        email: '',
        userType: 'reader',
        password: '',
        confirmPassword: ''
      },
      passwordError: '',
      passwordStrength: {
        bars: ['#eee', '#eee', '#eee'],
        text: ''
      }
    };
  },
  mounted() {
    // 记住我功能 - 从localStorage加载保存的用户信息
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      const { account, userType } = JSON.parse(savedUser);
      this.loginForm.account = account;
      this.loginForm.userType = userType;
      this.rememberMe = true;
    }
  },
  methods: {
    switchForm(formType) {
      this.activeForm = formType;
    },
    
    checkPasswordMatch() {
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.passwordError = '两次输入的密码不一致';
      } else {
        this.passwordError = '';
      }
    },
    
    checkPasswordStrength() {
      const password = this.registerForm.password;
      let strength = 0;

      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;

      // 更新密码强度条
      this.passwordStrength.bars = this.passwordStrength.bars.map((bar, index) => {
        return index < strength ? 
          ['#ff4757', '#ffa502', '#2ed573'][Math.min(strength - 1, 2)] : '#eee';
      });

      // 更新密码强度文本
      this.passwordStrength.text = ['弱', '中', '强', '很强'][Math.min(strength - 1, 3)] || '';
    },
    
    validateEmail() {
      const email = this.registerForm.email;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailInput = document.getElementById('registerEmail');
      
      if (email && !emailRegex.test(email)) {
        emailInput.setCustomValidity('请输入有效的邮箱地址');
      } else {
        emailInput.setCustomValidity('');
      }
    },
    
    async handleLogin() {
      // 记住我功能
      if (this.rememberMe) {
        const user = {
          account: this.loginForm.account,
          userType: this.loginForm.userType
        };
        localStorage.setItem('rememberedUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: this.loginForm.account,
            password: this.loginForm.password,
            role: this.loginForm.userType
          })
        });
        
        const data = await res.json();
        
        if (res.status === 200) {
          alert('登录成功！');
          if (data.role === 'admin') {
            window.location.href = './adminpage.html';
          } else if (data.role === 'reader') {
            window.location.href = './search.html';
          }
        } else if (res.status === 400) {
          if (data.code === 2) {
            alert(data.message || '用户不存在');
          } else if (data.code === 3) {
            alert(data.message || '密码错误');
          } else {
            alert(data.message || '登录失败');
          }
        }
      } catch (err) {
        console.error("捕获到错误：", err);
        console.log("错误类型：", err.name);
        console.log("错误消息：", err.message);
        if (err.stack) {
          console.log("错误堆栈：", err.stack);
        }
        alert('网络错误，请稍后再试。');
      }
    },
    
    async handleRegister() {
      // 确认密码一致性
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.passwordError = '请确认密码一致';
        return;
      }
      
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: this.registerForm.account,
            name: this.registerForm.name,
            email: this.registerForm.email,
            userType: this.registerForm.userType,
            password: this.registerForm.password
          })
        });
        
        const data = await res.json();
        console.log(res.status);
        
        if (res.status === 200 && data.code === 2) {
          alert(data.message || '注册成功。');
          // 切换到登录表单并填充账号
          this.activeForm = 'login';
          this.loginForm.account = this.registerForm.account;
          this.loginForm.userType = this.registerForm.userType;
          this.loginForm.password = '';
          
          // 重置注册表单
          this.registerForm = {
            account: '',
            name: '',
            email: '',
            userType: 'reader',
            password: '',
            confirmPassword: ''
          };
          
          console.log('转换成功');
        } else {
          if (res.status === 400 && data.code === 1) {
            alert('用户已存在，请重新注册。');
          } else {
            alert(data.message || '注册失败');
          }
        }
      } catch (err) {
        console.log("错误类型：", err.name);
        console.log("错误消息：", err.message);
        if (err.stack) {
          console.log("错误堆栈：", err.stack);
        }
        alert('网络错误，请稍后再试');
      }
    }
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
}

.login-register-container {
  background: #f5f5f5 url('D:\桌面\lib-project-v1.2.1-1\frontend\admin\public\images.jpg') no-repeat center center fixed;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.container {
  background: rgba(255,255,255,0.7);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0,0,0,0.7);
  width: 450px;
}

.form {
  transition: opacity 0.3s;
}

.form.active {
  display: block;
}

.form.hidden {
  display: none;
}

h2 {
  color: #000;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

input, select {
  width: 100%;
  padding: 1rem;
  border: 2px solid #bbb;
  background: #fff;
  color: #222;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
  transition: all 0.3s;
  background: white;
  padding: 0 0.3rem;
}

input:focus, select:focus,
input:not(:placeholder-shown) {
  border-color: #1976d2;
}

input:focus ~ label,
input:not(:placeholder-shown) ~ label {
  top: -0.6rem;
  font-size: 0.8rem;
  color: #1976d2;
}

select {
  appearance: none;
  background: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23eac7cc'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e") 
  no-repeat right 1rem center/12px;
}

button {
  width: 100%;
  padding: 1rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

button:hover {
  background: #1565c0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: -0.5rem; 
  margin-bottom: 1rem;
  margin-left: -22rem;
  justify-content: flex-start;
}

.remember-me label {
  position: static;
  display: inline;
  color: #666;
  font-size: 1rem;
  margin-left: -23rem;
  pointer-events: auto;
  background: none;
  padding: 0;
}

.toggle-form {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.toggle-form a {
  color: #1976d2;
  text-decoration: none;
}

.password-strength {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.5rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  transition: background 0.3s;
}

.strength-text {
  font-size: 0.8rem;
  margin-left: 0.5rem;
  color: #666;
}

.error-message {
  color: #ff4757;
  font-size: 0.8rem;
  margin-top: 0.3rem;
  display: block;
}
</style>
