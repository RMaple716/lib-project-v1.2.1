<!-- eslint-disable -->
<template>
  <div id="app">
    <!-- 登录注册页面 -->
    <div v-if="currentPage === 'enter'" class="container">
      <!-- 登录表单 -->
      <form id="loginForm" class="form" :class="{ active: isLoginActive }" @submit.prevent="handleLogin">
        <h2>用户登录</h2>
        <div class="form-group">
          <input type="text" v-model="loginAccount" placeholder=" " required>
          <label>账号</label>
        </div>
        <div class="form-group">
          <input type="password" v-model="loginPassword" placeholder=" " required>
          <label>密码2</label>
        </div>
        <div class="form-group">
          <select v-model="loginUserType">
            <option value="reader">普通用户123</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="remember-me">
          <input type="checkbox" v-model="rememberMe" id="remember"/>
          <label for="remember">记住我</label>
        </div>
        <button type="submit">登录</button>
        <p class="toggle-form">没有账号？ <a href="#" @click.prevent="toggleForm(false)">立即注册</a></p>
      </form>

      <!-- 注册表单 -->
      <form id="registerForm" class="form" :class="{ hidden: isLoginActive }" @submit.prevent="handleRegister">
        <h2>用户注册</h2>
        <div class="form-group">
          <input type="text" v-model="registerAccount" placeholder=" " required>
          <label>账号</label>
        </div>
        <div class="form-group">
          <input type="text" v-model="registerName" placeholder=" " required>
          <label>姓名</label>
        </div>
        <div class="form-group">
          <input type="email" v-model="registerEmail" placeholder=" " required>
          <label>邮箱</label>
        </div>
        <div class="form-group">
          <select v-model="registerUserType">
            <option value="reader">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="form-group">
          <input type="password" v-model="registerPassword" placeholder=" " required @input="checkPasswordStrength">
          <label>密码</label>
          <div class="password-strength">
            <span class="strength-bar" :class="{ strong: strength >= 1 }"></span>
            <span class="strength-bar" :class="{ strong: strength >= 2 }"></span>
            <span class="strength-bar" :class="{ strong: strength >= 3 }"></span>
            <span class="strength-text">{{ strengthText }}</span>
          </div>
        </div>
        <div class="form-group">
          <input type="password" v-model="confirmPassword" placeholder=" " required @input="checkPasswordMatch">
          <label>确认密码</label>
          <span class="error-message" id="passwordError">{{ passwordError }}</span>
        </div>
        <button type="submit">注册</button>
        <p class="toggle-form">已有账号？ <a href="#" @click.prevent="toggleForm(true)">立即登录</a></p>
      </form>
    </div>

    <!-- 主系统页面 (登录后显示) -->
    <div v-else>
      <!-- 上侧导航栏 -->
      <nav class="navbar">
        <div class="logo">图书管理系统</div>
        <ul class="nav-links">
          <li><a href="#" @click.prevent="changePage('search')">图书查询</a></li>
          <li><a href="#" @click.prevent="changePage('return')">借阅信息</a></li>
          <li><a href="#" @click.prevent="changePage('history')">借阅历史</a></li>
          <li><a href="#" @click.prevent="changePage('hot')">热门推荐</a></li>
          <li><a href="#" @click.prevent="changePage('best')">最佳读者</a></li>
          <li><a href="#" @click.prevent="changePage('aid')">公告信息</a></li>
          <!-- 意见建议（带二级下拉表单） -->
          <li class="feedback">
            <a href="#" @click.prevent>意见建议</a>
            <div class="feedback-dropdown" @mouseenter.stop @mouseleave.stop>
              <form @submit.prevent="handleFeedbackSubmit" class="feedback-form">
                <div class="form-row">
                  <label>姓名 <span class="required">*</span></label>
                  <input type="text" v-model.trim="feedbackName" placeholder="请输入姓名" required />
                </div>
                <div class="form-row">
                  <label>邮箱</label>
                  <input type="email" v-model.trim="feedbackEmail" placeholder="选填：example@mail.com" />
                </div>
                <div class="form-row">
                  <label>类别</label>
                  <select v-model="feedbackType">
                    <option value="建议">建议</option>
                    <option value="问题">问题</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>意见内容</label>
                  <textarea v-model="feedbackMessage" rows="4" placeholder="请填写您的意见或问题"></textarea>
                </div>
                <div class="form-row form-actions">
                  <span class="error-message" v-if="feedbackError">{{ feedbackError }}</span>
                  <button type="submit">提交</button>
                </div>
              </form>
            </div>
          </li>
          <li><a href="#" @click.prevent="logout">退出登录</a></li>
        </ul>
      </nav>

      <!-- 主内容区域 -->
      <main>
        <!-- 图书查询页面 -->
        <div v-if="currentPage === 'search'">

          <!-- 轮播：位于顶部导航和搜索框之间 -->
          <div class="hero-carousel" @mouseenter="stopCarousel" @mouseleave="startCarousel">
            <div class="hero-track" :style="{ transform: `translateX(-${carouselIndex * 100}%)` }">
              <div class="hero-slide" v-for="(img, idx) in carouselImages" :key="idx">
                <img :src="img" :alt="`slide-${idx}`" />
              </div>
            </div>
            <!-- 左右箭头：默认隐藏，鼠标悬停或聚焦时显示 -->
            <button
              class="hero-arrow hero-arrow--left"
              @click="prevSlide"
              aria-label="上一张"
              @mouseenter="stopCarousel"
              @mouseleave="startCarousel"
            >
              ‹
            </button>
            <button
              class="hero-arrow hero-arrow--right"
              @click="nextSlide"
              aria-label="下一张"
              @mouseenter="stopCarousel"
              @mouseleave="startCarousel"
            >
              ›
            </button>
          </div>

          <div class="searchbar">
            <input type="text" v-model="searchQuery" placeholder="请输入图书名称或作者">
            <button @click="searchAndRenderBooks">检索</button>
          </div>
          <table id="book-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>图书名称</th>
                <th>作者名称</th>
                <th>图书类型</th>
                <th>出版社</th>
                <th>库存数量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(book, index) in filteredBooks" :key="book.id">
                <td>{{ index + 1 }}</td>
                <td>{{ book.name }}</td>
                <td>{{ book.author }}</td>
                <td>{{ book.type }}</td>
                <td>{{ book.publisher }}</td>
                <td>{{ book.stock }}</td>
                <td>
                  <button @click="borrowBook(book.id)" :disabled="book.stock <= 0">
                    {{ book.stock > 0 ? '借阅' : '无库存' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 借阅信息页面 -->
        <div v-if="currentPage === 'return'">
          <h1>我的借阅信息</h1>
          <table id="borrowing-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>图书名称</th>
                <th>借阅日期</th>
                <th>截止还书日期</th>
                <th>操作</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in borrowingInfo" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ item.bookName }}</td>
                <td>{{ item.borrowDate }}</td>
                <td>{{ item.dueDate }}</td>
                <td><button class="return-btn" @click="returnBook(item.id)">还书</button></td>
                <td><button class="delay-btn" @click="renewBook(item.id)">续借</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 借阅历史页面 -->
        <div v-if="currentPage === 'history'">
          <h1>借阅历史</h1>
          <table id="history-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>图书名称</th>
                <th>借阅日期</th>
                <th>还书日期</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in borrowingHistory" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ item.bookName }}</td>
                <td>{{ item.borrowDate }}</td>
                <td>{{ item.returnDate || '未还' }}</td>
                <td :class="item.status === '已还' ? 'text-success' : 'text-warning'">
                  {{ item.status }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 热门推荐页面 -->
        <div v-if="currentPage === 'hot'">
          <h1>热门推荐</h1>
          <table id="hot-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>借阅次数</th>
                <th>图书名称</th>
                <th>图书类型</th>
                <th>作者名称</th>
                <th>出版社</th>
                <th>库存数量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(book, index) in hotBooks" :key="book.id">
                <td>{{ index + 1 }}</td>
                <td>{{ book.borrowCount }}</td>
                <td>{{ book.name }}</td>
                <td>{{ book.type }}</td>
                <td>{{ book.author }}</td>
                <td>{{ book.publisher }}</td>
                <td>{{ book.stock }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 最佳读者页面 -->
        <div v-if="currentPage === 'best'">
          <h1>最佳读者</h1>
          <table id="best-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>姓名</th>
                <th>UID</th>
                <th>借阅量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(reader, index) in bestReaders" :key="reader.id">
                <td>{{ index + 1 }}</td>
                <td>{{ reader.name }}</td>
                <td>{{ reader.uid }}</td>
                <td>{{ reader.borrowCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 公告信息页面 -->
        <div v-if="currentPage === 'aid'">
          <h1>公告信息</h1>
          <ul id="announcement-list" class="announcement-list">
            <li v-for="announcement in announcements" :key="announcement.id">
              <div class="announcement-title">{{ announcement.title }}</div>
              <div class="announcement-date">{{ announcement.date }}</div>
              <div class="announcement-content">{{ announcement.content }}</div>
            </li>
          </ul>
        </div>
      </main>

      <footer>
        © 2025 图书管理系统 | 联系方式：zhangkunyuan@qq.com
      </footer>
      <!-- 回到顶部按钮（仅在已登录页面显示） -->
      <button
        class="back-to-top"
        @click="scrollToTop"
        aria-label="回到顶部"
      >
        <img :src="topIcon" alt="top" />
      </button>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
// 从 src/assets 中导入轮播图片（请把图片放到 src/assets 并命名为 slide1.jpg..slide5.jpg）
import slide1 from '@/assets/slide1.jpg'
import slide2 from '@/assets/slide2.jpg'
import slide3 from '@/assets/slide3.jpg'
import slide4 from '@/assets/slide4.jpg'
import slide5 from '@/assets/slide5.jpg'
import topIcon from '@/assets/top.jpg'

export default {
  name: 'UserPortal',
  data() {
    return {
      // 页面状态管理
      currentPage: 'enter', // 当前显示的页面
      isLoginActive: true, // 登录/注册表单切换

      // 登录表单数据
      loginAccount: '',
      loginPassword: '',
      loginUserType: 'reader',
      rememberMe: false,

      // 注册表单数据
      registerAccount: '',
      registerName: '',
      registerEmail: '',
      registerUserType: 'reader',
      registerPassword: '',
      confirmPassword: '',
      passwordError: '',
      strength: 0,
      strengthText: '',

      // 搜索数据
      searchQuery: '',
      books: [
        { id: 1, name: 'JavaScript高级程序设计', author: '尼古拉斯·泽卡斯', type: '编程', publisher: '人民邮电出版社', stock: 5, borrowCount: 120 },
        { id: 2, name: '算法导论', author: '托马斯·科尔曼', type: '算法', publisher: '机械工业出版社', stock: 3, borrowCount: 98 },
        { id: 3, name: '深入理解计算机系统', author: '兰德尔·布莱恩特', type: '计算机', publisher: '机械工业出版社', stock: 2, borrowCount: 85 },
        { id: 4, name: 'Vue.js实战', author: '尤雨溪', type: '编程', publisher: '电子工业出版社', stock: 7, borrowCount: 76 }
      ],

      // 借阅信息
      borrowingInfo: [
        { id: 1, bookName: 'JavaScript高级程序设计', borrowDate: '2023-10-01', dueDate: '2023-10-15' },
        { id: 2, bookName: '算法导论', borrowDate: '2023-10-05', dueDate: '2023-10-19' }
      ],

      // 借阅历史
      borrowingHistory: [
        { id: 1, bookName: '深入理解计算机系统', borrowDate: '2023-09-01', returnDate: '2023-09-15', status: '已还' },
        { id: 2, bookName: 'Vue.js实战', borrowDate: '2023-09-10', returnDate: '', status: '借阅中' }
      ],

      // 热门图书
      hotBooks: [
        { id: 1, name: 'JavaScript高级程序设计', author: '尼古拉斯·泽卡斯', type: '编程', publisher: '人民邮电出版社', stock: 5, borrowCount: 120 },
        { id: 2, name: '算法导论', author: '托马斯·科尔曼', type: '算法', publisher: '机械工业出版社', stock: 3, borrowCount: 98 },
        { id: 3, name: '深入理解计算机系统', author: '兰德尔·布莱恩特', type: '计算机', publisher: '机械工业出版社', stock: 2, borrowCount: 85 }
      ],

      // 最佳读者
      bestReaders: [
        { id: 1, name: '张三', uid: '2021001', borrowCount: 35 },
        { id: 2, name: '李四', uid: '2021002', borrowCount: 28 },
        { id: 3, name: '王五', uid: '2021003', borrowCount: 22 }
      ],

      // 公告信息
      announcements: [
        { id: 1, title: '图书馆闭馆通知', date: '2023-10-01', content: '因节假日，图书馆将于10月1日至10月7日闭馆，望周知。' },
        { id: 2, title: '新书上架通知', date: '2023-09-15', content: '近期新增计算机类图书50种，欢迎借阅。' }
      ],
      // 意见建议表单数据
      feedbackName: '',
      feedbackEmail: '',
      feedbackType: '建议',
      feedbackMessage: '',
      feedbackError: '',
      // 轮播相关
      // 使用 src/assets 中导入的图片，让 webpack 处理资源
      carouselImages: [
        slide1,
        slide2,
        slide3,
        slide4,
        slide5
      ],
      // 回到顶部图标（来自 src/assets）
      topIcon: topIcon,
      carouselIndex: 0,
      carouselTimer: null,
    };
  },
  computed: {
    // 过滤图书列表
    filteredBooks() {
      if (!this.searchQuery) return this.books;
      const query = this.searchQuery.toLowerCase();
      return this.books.filter(book => 
        book.name.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    // 平滑滚动到顶部
    scrollToTop() {
      // 如果页面使用 body/window 滚动
      if (typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // 兜底：尝试设置 document.documentElement
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
,
    // 轮播控制
    nextSlide() {
      this.carouselIndex = (this.carouselIndex + 1) % this.carouselImages.length
    },
    prevSlide() {
      this.carouselIndex = (this.carouselIndex - 1 + this.carouselImages.length) % this.carouselImages.length
    },
    goToSlide(i) {
      this.carouselIndex = i
    },
    startCarousel() {
      this.stopCarousel()
      this.carouselTimer = setInterval(() => { this.nextSlide() }, 4000)
    },
    stopCarousel() {
      if (this.carouselTimer) {
        clearInterval(this.carouselTimer)
        this.carouselTimer = null
      }
    },
    // 切换登录/注册表单
    toggleForm(isLogin) {
      this.isLoginActive = isLogin;
      this.clearFormErrors();
    },

    // 清除表单错误信息
    clearFormErrors() {
      this.passwordError = '';
      this.strength = 0;
      this.strengthText = '';
    },

    // 检查密码强度
    checkPasswordStrength() {
      const password = this.registerPassword;
      if (!password) {
        this.strength = 0;
        this.strengthText = '';
        return;
      }

      // 简单的密码强度检测
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.match(/[A-Z]/)) strength++;
      if (password.match(/[0-9]/)) strength++;
      
      this.strength = strength;
      
      switch(strength) {
        case 1:
          this.strengthText = '弱';
          break;
        case 2:
          this.strengthText = '中';
          break;
        case 3:
          this.strengthText = '强';
          break;
        default:
          this.strengthText = '';
      }
      
      this.checkPasswordMatch();
    },

    // 检查密码是否匹配
    checkPasswordMatch() {
      if (this.confirmPassword) {
        this.passwordError = this.registerPassword === this.confirmPassword 
          ? '' 
          : '两次密码输入不一致';
      }
    },

    // 处理登录
    handleLogin() {
      // 实际应用中这里应该有后端验证
      alert('登录成功！');
      this.currentPage = 'search';
    },

    // 处理注册
    handleRegister() {
      if (this.registerPassword !== this.confirmPassword) {
        this.passwordError = '两次密码输入不一致';
        return;
      }
      
      // 实际应用中这里应该有后端验证和保存
      alert('注册成功，请登录！');
      this.toggleForm(true);
    },

    // 切换页面
    changePage(page) {
      this.currentPage = page;
    },

    // 退出登录
    logout() {
      this.currentPage = 'enter';
      this.loginAccount = '';
      this.loginPassword = '';
    },

    // 搜索图书
    searchAndRenderBooks() {
      // 这里只是前端过滤，实际应用中应该调用后端API
      console.log('搜索:', this.searchQuery);
    },

    // 借阅图书
    borrowBook(bookId) {
      const book = this.books.find(b => b.id === bookId);
      if (book && book.stock > 0) {
        book.stock--;
        alert(`成功借阅《${book.name}》`);
      }
    },

    // 归还图书
    returnBook(recordId) {
      this.borrowingInfo = this.borrowingInfo.filter(item => item.id !== recordId);
      alert('还书成功');
    },

    // 续借图书
    renewBook(recordId) {
      const item = this.borrowingInfo.find(item => item.id === recordId);
      if (item) {
        // 简单处理：延长7天
        const dueDate = new Date(item.dueDate);
        dueDate.setDate(dueDate.getDate() + 7);
        item.dueDate = dueDate.toISOString().split('T')[0];
        alert('续借成功');
      }
    }
    ,
    // 提交意见建议表单
    handleFeedbackSubmit() {
      this.feedbackError = '';
      if (!this.feedbackName || !this.feedbackName.trim()) {
        this.feedbackError = '请填写姓名';
        return;
      }

      // 这里可以调用后端 API 保存反馈；现在只做前端提示并清空表单
      console.log('反馈提交:', {
        name: this.feedbackName,
        email: this.feedbackEmail,
        type: this.feedbackType,
        message: this.feedbackMessage,
      });
      alert('感谢您的反馈，已提交！');
      this.clearFeedbackForm();
    },

    clearFeedbackForm() {
      this.feedbackName = '';
      this.feedbackEmail = '';
      this.feedbackType = '建议';
      this.feedbackMessage = '';
      this.feedbackError = '';
    },
  }
  ,
  mounted() {
    // 启动轮播
    this.startCarousel()
  },
  beforeDestroy() {
    // 清理定时器
    this.stopCarousel()
  },
};
</script>

<style>
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
}

body {
  /* 使用 public 下的图片作为背景（推荐），把图片放在 public/images/bg.jpg */
  /* 把图片放到项目的 public/images/bg.jpg，然后使用下面的相对 public 根路径引用，这样 webpack devServer 与生产构建都能正确加载 */
  background-image: url('D:\桌面\lib-project-v1.2.1-2\frontend\admin\public\images.jpg');
  background-size: cover; /* 等比例覆盖 */
  background-position: center center;
  background-repeat: no-repeat;
  /* 当图片加载失败或不存在时的回退颜色 */
  background-color: #f4f4f4;
  color: #333;
  line-height: 1.6;
}

/* 登录注册页面样式 */
.container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
}

.form {
  background: white;
  padding: 25px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.form.hidden {
  display: none;
}

.form h2 {
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 16px;
}

.form-group label {
  position: absolute;
  left: 10px;
  top: 10px;
  color: #999;
  pointer-events: none;
  transition: 0.3s;
}

.form-group input:focus + label,
.form-group input:not(:placeholder-shown) + label {
  top: -8px;
  left: 5px;
  background: white;
  padding: 0 5px;
  font-size: 12px;
  color: #3498db;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 16px;
  background: white;
}

.remember-me {
  margin: 15px 0;
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 5px;
}

button {
  width: 100%;
  padding: 10px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

button:hover {
  background: #2980b9;
}

.toggle-form {
  margin-top: 15px;
  text-align: center;
}

.toggle-form a {
  color: #3498db;
  text-decoration: none;
}

/* 密码强度样式 */
.password-strength {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.strength-bar {
  flex: 1;
  height: 5px;
  background: #ddd;
  margin-right: 3px;
  transition: background 0.3s;
}

.strength-bar.strong {
  background: #2ecc71;
}

.strength-text {
  margin-left: 10px;
  font-size: 12px;
  color: #666;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

/* 主系统样式 */
.navbar {
  width: 100%;
  background: #2c3e50;
  color: white;
  height: 64px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  margin-right: 32px;
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
}

.nav-links li {
  margin-right: 12px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.15s, transform 0.15s;
  display: inline-block;
}

.nav-links a:hover {
  background: #34495e;
  transform: translateY(-1px);
}

/* 意见建议下拉样式 */
.nav-links li.feedback { position: relative; }
.feedback-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: #fff;
  color: #333;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  z-index: 210;
}
.nav-links li.feedback:hover .feedback-dropdown { display: block; }
.feedback-form .form-row { margin-bottom: 8px; }
.feedback-form label { display: block; font-size: 13px; margin-bottom: 4px; }
.feedback-form input, .feedback-form select, .feedback-form textarea {
  width: 100%;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 13px;
  box-sizing: border-box;
}
.feedback-form .form-actions { display: flex; align-items: center; justify-content: space-between; }
.feedback-form .form-actions button { width: auto; padding: 8px 12px; }
.feedback .required { color: #e74c3c; }

main {
  margin-top: 84px; /* leave space for fixed top navbar */
  padding: 20px;
  min-height: calc(100vh - 84px);
}

h1 {
  text-align: center;
  margin: 20px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f8f9fa;
  font-weight: bold;
}

footer {
  background-color: transparent;
  color: #666;
  text-align: center;
  padding: 16px 0;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 搜索栏样式 */
.searchbar {
  float: right;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.searchbar input {
  padding: 10px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-right: 10px;
}

.searchbar button {
  width: auto;
  padding: 10px 20px;
}

/* 按钮样式 */
.return-btn {
  background-color: #e74c3c;
}

.return-btn:hover {
  background-color: #c0392b;
}

.delay-btn {
  background-color: #3498db;
  margin-left: 5px;
}

.delay-btn:hover {
  background-color: #2980b9;
}

/* 公告样式 */
.announcement-list {
  list-style: none;
  padding: 0;
}

.announcement-list li {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 3px;
}

.announcement-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.announcement-date {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
}

/* 状态样式 */
.text-success { color: green; }
.text-warning { color: orange; }

/* Carousel 样式 —— 只显示图片本身，固定高度，图片裁剪以覆盖容器 */
.hero-carousel {
  width: 100%;
  max-width: 1000px; /* 限制最大宽度，可按需调整 */
  height: 240px; /* 固定高度，保证大小始终一致 */
  margin: 0 auto 16px;
  overflow: hidden;
  position: relative;
}
.hero-track {
  display: flex;
  height: 100%;
  transition: transform 0.6s ease;
}
.hero-slide {
  flex: 0 0 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.hero-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持大小填充并裁剪 */
  display: block;
}

/* 如果需要可隐藏焦点样式（现在不显示点和箭头） */
.hero-arrow, .hero-dots { display: none; }

/* 当鼠标悬停或容器获得焦点时显示左右箭头 */
.hero-carousel:hover .hero-arrow,
.hero-carousel:focus-within .hero-arrow {
  display: flex;
}

.hero-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.45);
  color: #fff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  z-index: 2;
}

.hero-arrow:hover {
  background: rgba(0,0,0,0.6);
  transform: translateY(-50%) scale(1.05);
}

.hero-arrow--left { left: 12px; }
.hero-arrow--right { right: 12px; }
/* 回到顶部按钮样式 */
.back-to-top {
  position: fixed;
  right: 20px;
  bottom: 80px; /* 放在底部固定 footer 之上 */
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 300;
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  transition: transform 0.15s, opacity 0.15s;
}
.back-to-top:hover { transform: scale(1.05); }
  .back-to-top img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 保持比例并裁剪以填充圆形 */
    border-radius: 50%; /* 保持与父元素一致的圆角 */
    display: block; /* 去除内联间隙 */
  }
</style>