<template>
  <div id="app">
    <div id="viewport">
      <!-- 顶部导航栏 -->
      <div id="navbar">
        <header>
          <span>图书管理系统</span>
        </header>
        <ul class="nav">
          <li>
            <a href="#" @click.prevent="changePage('home')">主页</a>
          </li>
          <li>
            <a href="#" @click.prevent="changePage('book_admin')">图书管理</a>
          </li>
          <li>
            <a href="#" @click.prevent="changePage('user_admin')">用户管理</a>
          </li>
          <li>
            <a href="#" @click.prevent="changePage('booktype_admin')">图书分类管理</a>
          </li>
          <li>
            <a href="#" @click.prevent="changePage('booklend_message')">图书借阅归还</a>
          </li>
          <li>
            <a href="#" @click.prevent="changePage('announcement_admin')">公告管理</a>
          </li>
          <li>
            <a href="#" @click.prevent="logout">退出登录</a>
          </li>
        </ul>
      </div>
      <!-- 内容区域 -->
      <div id="content">
        <div class="container-fluid">
          <!-- 主页 -->
          <div v-show="currentPage === 'home'" class="page">
            <h1 class="home-title">管理员，您好！</h1>

            <!-- 数据概览卡片 -->
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-icon book-icon">
                  <i class="fas fa-book"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ bookCount }}</h3>
                  <p>图书总数</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon user-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ userCount }}</h3>
                  <p>用户总数</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon announcement-icon">
                  <i class="fas fa-bullhorn"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ announcementCount }}</h3>
                  <p>公告总数</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon lend-icon">
                  <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ activeLends }}</h3>
                  <p>活跃借阅</p>
                </div>
              </div>
            </div>
            
            <!-- 图表区域 -->
            <div class="charts-container">
              <div class="chart-row">
                <!-- 图书分类分布 -->
                <div class="chart-card">
                  <h3>图书分类分布</h3>
                  <div class="chart-wrapper">
                    <canvas id="bookCategoryChart"></canvas>
                  </div>
                </div>
                
                <!-- 借阅趋势 -->
                <div class="chart-card">
                  <h3>近7天借阅趋势</h3>
                  <div class="chart-wrapper">
                    <canvas id="lendTrendChart"></canvas>
                  </div>
                </div>
              </div>
              
              <div class="chart-row">
                <!-- 用户类型分布 -->
                <div class="chart-card">
                  <h3>用户类型分布</h3>
                  <div class="chart-wrapper">
                    <canvas id="userTypeChart"></canvas>
                  </div>
                </div>
                
                <!-- 公告状态 -->
                <div class="chart-card">
                  <h3>公告状态</h3>
                  <div class="chart-wrapper">
                    <canvas id="announcementStatusChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 快速操作 -->
            <div class="quick-actions">
              <h3>快速操作</h3>
              <div class="action-buttons">
                <button class="action-btn" @click="changePage('book_admin')">
                  <i class="fas fa-plus"></i>
                  <span>添加图书</span>
                </button>
                <button class="action-btn" @click="changePage('user_admin')">
                  <i class="fas fa-user-plus"></i>
                  <span>添加用户</span>
                </button>
                <button class="action-btn" @click="changePage('announcement_admin')">
                  <i class="fas fa-bullhorn"></i>
                  <span>发布公告</span>
                </button>
                <button class="action-btn" @click="changePage('booklend_message')">
                  <i class="fas fa-exchange-alt"></i>
                  <span>借阅管理</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 图书管理 -->
          <div v-show="currentPage === 'book_admin'" class="page">
            <h1 class="book-search-title">图书管理</h1>
            <form class="search-form">
              <select id="searchType" class="search-select" v-model="searchType">
                <option value="_book_name">书名</option>
                <option value="_author">作者</option>
                <option value="_isbn">ISBN号</option>
                <option value="_type_name">图书类型</option>
              </select>
              <input type="text" id="searchInput" class="search-input" placeholder="请输入查询内容" v-model="searchKeyword">
              <button type="button" class="search-button" @click="handleBookSearch">查询</button>
              <button type="button" class="addBookModal" @click="showAddBookModal">添加图书</button>
            </form>

            <!-- 添加/编辑图书弹窗 -->
            <div id="addBookModal" class="modal" v-if="showAddBookModalFlag">
              <div class="modal-content">
                <span class="close-button" @click="closeAddBookModal">&times;</span>
                <h2>{{ isEditBook ? '编辑图书' : '添加图书' }}</h2>
                <form @submit.prevent="submitBookForm">
                  <label for="bookTitle">书名：</label>
                  <input type="text" id="bookTitle" v-model="bookForm.bookTitle" placeholder="请输入书名">
                  <label for="author">作者：</label>
                  <input type="text" id="author" v-model="bookForm.author" placeholder="请输入作者">
                  <label for="isbn">ISBN号：</label>
                  <input type="text" id="isbn" v-model="bookForm.isbn" placeholder="请输入ISBN号">                
                  <label for="bookType">图书类型：</label>
                  <select id="bookType" v-model="bookForm.bookType">
                    <option v-for="cat in categories" :value="cat._tid" :key="cat._tid">{{ cat._type_name }}</option>
                  </select>                 
                  <label for="publisher">出版社：</label>
                  <input type="text" id="publisher" v-model="bookForm.publisher" placeholder="请输入出版社">                  
                  <label for="totalQuantity">总数量：</label>
                  <input type="number" id="totalQuantity" v-model="bookForm.totalQuantity" placeholder="请输入总数量">                  
                  <button type="submit" class="submit-button">提交</button>
                </form>
              </div>
            </div>
            <!-- 图书管理表格 -->
            <table class="book_table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>图书类型</th>
                  <th>书名</th>
                  <th>作者</th>
                  <th>ISBN号</th>
                  <th>出版社</th>
                  <th>总数量</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredBooks.length === 0">
                  <td colspan="8">暂无图书数据</td>
                </tr>
                <tr v-for="book in currentPageBooks" :key="book._bid">
                  <td>{{ book._bid }}</td>
                  <td>{{ book._type_name || '' }}</td>
                  <td>{{ book._book_name }}</td>
                  <td>{{ book._author }}</td>
                  <td>{{ book._isbn }}</td>
                  <td>{{ book._press }}</td>
                  <td>{{ book._num }}</td>
                  <td>
                    <button class="edit-button" @click="editBook(book)">编辑</button>
                    <button class="delete-button" @click="deleteBook(book._bid)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 分页功能 -->
            <div class="pagination">
              <span class="total-pages">共{{ totalBookPages }}页</span>
              <span class="page-numbers">
                <button @click="changeBookPage(1)" :disabled="bookCurrentPage === 1">首页</button>
                <button @click="changeBookPage(bookCurrentPage - 1)" :disabled="bookCurrentPage === 1">上一页</button>
                <button v-for="page in visibleBookPages" :key="page" 
                  @click="changeBookPage(page)" 
                  :class="{ 'active': bookCurrentPage === page }">
                  {{ page }}
                </button>
                <button @click="changeBookPage(bookCurrentPage + 1)" :disabled="bookCurrentPage === totalBookPages">下一页</button>
                <button @click="changeBookPage(totalBookPages)" :disabled="bookCurrentPage === totalBookPages">末页</button>
              </span>
            </div>
          </div>

          <!-- 图书分类管理 -->
          <div v-show="currentPage === 'booktype_admin'" class="page">
            <h1 class="category-title">图书分类管理</h1>
            <button type="button" class="addCategoryButton" @click="showAddCategoryModal">添加分类</button>
            
            <!-- 添加分类弹窗 -->
            <div id="addCategoryModal" class="modal" v-if="showAddCategoryModalFlag">
              <div class="modal-content">
                <span class="close-button" @click="closeAddCategoryModal">&times;</span>
                <h2 id="modalTitle">{{ isEditCategory ? '修改分类' : '添加分类' }}</h2>
                <form id="categoryForm" @submit.prevent="submitCategoryForm">
                  <label for="categoryId">分类ID:</label>
                  <input type="text" id="categoryId" v-model="categoryForm.categoryId" required>
                  
                  <label for="categoryName">分类名称:</label>
                  <input type="text" id="categoryName" v-model="categoryForm.categoryName" required>
                  
                  <button type="submit" class="submit-button">提交</button>
                </form>
              </div>
            </div>

            <!-- 图书分类表格 -->
            <table class="category_table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>图书分类名称</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="categories.length === 0">
                  <td colspan="3">暂无分类数据</td>
                </tr>
                <tr v-for="cat in currentPageCategories" :key="cat._tid">
                  <td>{{ cat._tid }}</td>
                  <td>{{ cat._type_name }}</td>
                  <td>
                    <button class="edit-category" @click="editCategory(cat)">修改</button>
                    <button class="delete-category" @click="deleteCategory(cat._tid)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 分页功能 -->
            <div class="pagination">
              <span class="total-pages">共{{ totalCategoryPages }}页</span>
              <span class="page-numbers">
                <button @click="changeCategoryPage(1)" :disabled="categoryCurrentPage === 1">首页</button>
                <button @click="changeCategoryPage(categoryCurrentPage - 1)" :disabled="categoryCurrentPage === 1">上一页</button>
                <button v-for="page in visibleCategoryPages" :key="page" 
                  @click="changeCategoryPage(page)" 
                  :class="{ 'active': categoryCurrentPage === page }">
                  {{ page }}
                </button>
                <button @click="changeCategoryPage(categoryCurrentPage + 1)" :disabled="categoryCurrentPage === totalCategoryPages">下一页</button>
                <button @click="changeCategoryPage(totalCategoryPages)" :disabled="categoryCurrentPage === totalCategoryPages">末页</button>
              </span>
            </div>
          </div>

          <!-- 图书借阅归还 -->
          <div v-show="currentPage === 'booklend_message'" class="page">
            <h1 class="lend-title">图书借阅与归还</h1>
            
            <!-- 图书借阅与归还表格 -->
            <table class="lend_table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>图书名称</th>
                  <th>读者姓名</th>
                  <th>借阅日期</th>
                  <th>归还日期</th>
                  <th>借阅状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="lends.length === 0">
                  <td colspan="7">暂无借阅记录</td>
                </tr>
                <tr v-for="lend in currentPageLends" :key="lend._hid">
                  <td>{{ lend._hid }}</td>
                  <td>{{ lend._bid }}</td>
                  <td>{{ lend._uid }}</td>
                  <td>{{ formatDate(lend._begin_time) }}</td>
                  <td>{{ formatDate(lend._end_date) }}</td>
                  <td>{{ lend.status }}</td>
                  <td>
                    <button class="lend-action delay-btn" @click="delayLend(lend._hid, lend._end_date)">延期</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 延期归还弹窗 -->
            <div id="delayModal" class="modal" v-if="showDelayModal">
              <div class="modal-content">
                <span class="close-button" @click="closeDelayModal">&times;</span>
                <h2>延期归还</h2>
                <form @submit.prevent="submitDelay">
                  <label for="newReturnDate">新的归还日期：</label>
                  <input type="date" id="newReturnDate" v-model="newReturnDate">
                  <button type="submit" class="submit-button">提交</button>
                </form>
              </div>
            </div>

            <!-- 分页功能 -->
            <div class="pagination">
              <span class="total-pages">共{{ totalLendPages }}页</span>
              <span class="page-numbers">
                <button @click="changeLendPage(1)" :disabled="lendCurrentPage === 1">首页</button>
                <button @click="changeLendPage(lendCurrentPage - 1)" :disabled="lendCurrentPage === 1">上一页</button>
                <button v-for="page in visibleLendPages" :key="page" 
                  @click="changeLendPage(page)" 
                  :class="{ 'active': lendCurrentPage === page }">
                  {{ page }}
                </button>
                <button @click="changeLendPage(lendCurrentPage + 1)" :disabled="lendCurrentPage === totalLendPages">下一页</button>
                <button @click="changeLendPage(totalLendPages)" :disabled="lendCurrentPage === totalLendPages">末页</button>
              </span>
            </div>
          </div>

          <!-- 用户管理 -->
          <div v-show="currentPage === 'user_admin'" class="page">
            <h1 class="user-title">用户管理</h1>
            <form class="search-form">
              <select id="userSearchType" class="search-select" v-model="userSearchType">
                <option value="_uid">用户ID</option>
                <option value="_username">用户名</option>
                <option value="_name">姓名</option>
                <option value="_phone">手机号</option>
              </select>
              <input type="text" id="userSearchInput" class="search-input" placeholder="请输入查询内容" v-model="userSearchKeyword">
              <button type="button" class="search-button" @click="handleUserSearch">查询</button>
              <button type="button" class="addUserModal" @click="showAddUserModal">添加用户</button>
            </form>

            <!-- 添加/编辑用户弹窗 -->
            <div id="addUserModal" class="modal" v-if="showAddUserModalFlag">
              <div class="modal-content">
                <span class="close-button" @click="closeAddUserModal">&times;</span>
                <h2>{{ isEditUser ? '编辑用户' : '添加用户' }}</h2>
                <form @submit.prevent="submitUserForm">
                  <label for="username">用户名：</label>
                  <input type="text" id="username" v-model="userForm.username" placeholder="请输入用户名">
                  <label for="password">密码：</label>
                  <input type="password" id="password" v-model="userForm.password" placeholder="请输入密码">
                  <label for="name">姓名：</label>
                  <input type="text" id="name" v-model="userForm.name" placeholder="请输入姓名">
                  <label for="phone">手机号：</label>
                  <input type="text" id="phone" v-model="userForm.phone" placeholder="请输入手机号">
                  <label for="email">邮箱：</label>
                  <input type="email" id="email" v-model="userForm.email" placeholder="请输入邮箱">
                  <label for="userType">用户类型：</label>
                  <select id="userType" v-model="userForm.userType">
                    <option value="reader">读者</option>
                    <option value="admin">管理员</option>
                  </select>
                  <button type="submit" class="submit-button">提交</button>
                </form>
              </div>
            </div>

            <!-- 用户管理表格 -->
            <table class="user_table">
              <thead>
                <tr>
                  <th>用户ID</th>
                  <th>用户名</th>
                  <th>姓名</th>
                  <th>手机号</th>
                  <th>邮箱</th>
                  <th>用户类型</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="8">暂无用户数据</td>
                </tr>
                <tr v-for="user in currentPageUsers" :key="user._uid">
                  <td>{{ user._uid }}</td>
                  <td>{{ user._username }}</td>
                  <td>{{ user._name }}</td>
                  <td>{{ user._phone }}</td>
                  <td>{{ user._email }}</td>
                  <td>{{ user._type === 'admin' ? '管理员' : '读者' }}</td>
                  <td>{{ formatDate(user._create_time) }}</td>
                  <td>
                    <button class="edit-button" @click="editUser(user)">编辑</button>
                    <button class="delete-button" @click="deleteUser(user._uid)">删除</button>
                    <button class="reset-password" @click="resetPassword(user._uid)">重置密码</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 分页功能 -->
            <div class="pagination">
              <span class="total-pages">共{{ totalUserPages }}页</span>
              <span class="page-numbers">
                <button @click="changeUserPage(1)" :disabled="userCurrentPage === 1">首页</button>
                <button @click="changeUserPage(userCurrentPage - 1)" :disabled="userCurrentPage === 1">上一页</button>
                <button v-for="page in visibleUserPages" :key="page" 
                  @click="changeUserPage(page)" 
                  :class="{ 'active': userCurrentPage === page }">
                  {{ page }}
                </button>
                <button @click="changeUserPage(userCurrentPage + 1)" :disabled="userCurrentPage === totalUserPages">下一页</button>
                <button @click="changeUserPage(totalUserPages)" :disabled="userCurrentPage === totalUserPages">末页</button>
              </span>
            </div>
          </div>

          <!-- 公告管理 -->
          <div v-show="currentPage === 'announcement_admin'" class="page">
            <h1 class="announcement-title">公告管理</h1>
            <button type="button" class="addAnnouncementButton" @click="showAddAnnouncementModal">发布公告</button>

            <!-- 添加/编辑公告弹窗 -->
            <div id="addAnnouncementModal" class="modal" v-if="showAddAnnouncementModalFlag">
              <div class="modal-content">
                <span class="close-button" @click="closeAddAnnouncementModal">&times;</span>
                <h2>{{ isEditAnnouncement ? '编辑公告' : '发布公告' }}</h2>
                <form @submit.prevent="submitAnnouncementForm">
                  <label for="announcementTitle">公告标题：</label>
                  <input type="text" id="announcementTitle" v-model="announcementForm.title" placeholder="请输入公告标题">
                  <label for="announcementContent">公告内容：</label>
                  <textarea id="announcementContent" v-model="announcementForm.content" placeholder="请输入公告内容" rows="6"></textarea>
                  <label for="announcementStatus">公告状态：</label>
                  <select id="announcementStatus" v-model="announcementForm.status">
                    <option value="published">已发布</option>
                    <option value="draft">草稿</option>
                  </select>
                  <button type="submit" class="submit-button">提交</button>
                </form>
              </div>
            </div>

            <!-- 公告管理表格 -->
            <table class="announcement_table">
              <thead>
                <tr>
                  <th>公告ID</th>
                  <th>公告标题</th>
                  <th>发布时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="announcements.length === 0">
                  <td colspan="5">暂无公告数据</td>
                </tr>
                <tr v-for="announcement in currentPageAnnouncements" :key="announcement._aid">
                  <td>{{ announcement._aid }}</td>
                  <td>{{ announcement._title }}</td>
                  <td>{{ formatDate(announcement._create_time) }}</td>
                  <td>
                    <span :class="announcement._status === 'published' ? 'status-published' : 'status-draft'">
                      {{ announcement._status === 'published' ? '已发布' : '草稿' }}
                    </span>
                  </td>
                  <td>
                    <button class="edit-button" @click="editAnnouncement(announcement)">编辑</button>
                    <button class="delete-button" @click="deleteAnnouncement(announcement._aid)">删除</button>
                    <button v-if="announcement._status === 'draft'" class="publish-button" @click="publishAnnouncement(announcement._aid)">发布</button>
                    <button v-else class="unpublish-button" @click="unpublishAnnouncement(announcement._aid)">取消发布</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 分页功能 -->
            <div class="pagination">
              <span class="total-pages">共{{ totalAnnouncementPages }}页</span>
              <span class="page-numbers">
                <button @click="changeAnnouncementPage(1)" :disabled="announcementCurrentPage === 1">首页</button>
                <button @click="changeAnnouncementPage(announcementCurrentPage - 1)" :disabled="announcementCurrentPage === 1">上一页</button>
                <button v-for="page in visibleAnnouncementPages" :key="page" 
                  @click="changeAnnouncementPage(page)" 
                  :class="{ 'active': announcementCurrentPage === page }">
                  {{ page }}
                </button>
                <button @click="changeAnnouncementPage(announcementCurrentPage + 1)" :disabled="announcementCurrentPage === totalAnnouncementPages">下一页</button>
                <button @click="changeAnnouncementPage(totalAnnouncementPages)" :disabled="announcementCurrentPage === totalAnnouncementPages">末页</button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)
export default {
  name: 'BooksView',
  data() {
    return {
      // 页面状态
      currentPage: 'home',

      // 图表实例
      bookCategoryChart: null,
      lendTrendChart: null,
      userTypeChart: null,
      announcementStatusChart: null,
      
      // 图书管理相关
      books: [],
      filteredBooks: [],
      bookCurrentPage: 1,
      bookRowsPerPage: 10,
      searchType: '_book_name',
      searchKeyword: '',
      showAddBookModalFlag: false,
      isEditBook: false,
      currentEditBookId: null,
      bookForm: {
        bookTitle: '',
        author: '',
        isbn: '',
        bookType: '',
        publisher: '',
        totalQuantity: 0
      },
      
      // 分类管理相关
      categories: [],
      categoryCurrentPage: 1,
      categoryRowsPerPage: 5,
      showAddCategoryModalFlag: false,
      isEditCategory: false,
      currentEditCategoryId: null,
      categoryForm: {
        categoryId: '',
        categoryName: ''
      },
      
      // 借阅管理相关
      lends: [],
      lendCurrentPage: 1,
      lendRowsPerPage: 8,
      showDelayModal: false,
      currentDelayHid: null,
      newReturnDate: '',

      // 用户管理相关
      users: [],
      filteredUsers: [],
      userCurrentPage: 1,
      userRowsPerPage: 8,
      userSearchType: '_username',
      userSearchKeyword: '',
      showAddUserModalFlag: false,
      isEditUser: false,
      currentEditUserId: null,
      userForm: {
        username: '',
        password: '',
        name: '',
        phone: '',
        email: '',
        userType: 'reader'
      },

      // 公告管理相关
      announcements: [],
      announcementCurrentPage: 1,
      announcementRowsPerPage: 8,
      showAddAnnouncementModalFlag: false,
      isEditAnnouncement: false,
      currentEditAnnouncementId: null,
      announcementForm: {
        title: '',
        content: '',
        status: 'published'
      }
    };
  },
  
  computed: {
    // 图书分页计算
    totalBookPages() {
      const dataSource = this.filteredBooks.length > 0 ? this.filteredBooks : this.books;
      return Math.ceil(dataSource.length / this.bookRowsPerPage) || 1;
    },
    currentPageBooks() {
      const dataSource = this.filteredBooks.length > 0 ? this.filteredBooks : this.books;
      const start = (this.bookCurrentPage - 1) * this.bookRowsPerPage;
      const end = start + this.bookRowsPerPage;
      return dataSource.slice(start, end);
    },
    visibleBookPages() {
      return this.generateVisiblePages(this.bookCurrentPage, this.totalBookPages);
    },
    
    // 分类分页计算
    totalCategoryPages() {
      return Math.ceil(this.categories.length / this.categoryRowsPerPage) || 1;
    },
    currentPageCategories() {
      const start = (this.categoryCurrentPage - 1) * this.categoryRowsPerPage;
      const end = start + this.categoryRowsPerPage;
      return this.categories.slice(start, end);
    },
    visibleCategoryPages() {
      return this.generateVisiblePages(this.categoryCurrentPage, this.totalCategoryPages);
    },
    
    // 借阅分页计算
    totalLendPages() {
      return Math.ceil(this.lends.length / this.lendRowsPerPage) || 1;
    },
    currentPageLends() {
      const start = (this.lendCurrentPage - 1) * this.lendRowsPerPage;
      const end = start + this.lendRowsPerPage;
      return this.lends.slice(start, end);
    },
    visibleLendPages() {
      return this.generateVisiblePages(this.lendCurrentPage, this.totalLendPages);
    },

    // 用户分页计算
    totalUserPages() {
      const dataSource = this.filteredUsers.length > 0 ? this.filteredUsers : this.users;
      return Math.ceil(dataSource.length / this.userRowsPerPage) || 1;
    },
    currentPageUsers() {
      const dataSource = this.filteredUsers.length > 0 ? this.filteredUsers : this.users;
      const start = (this.userCurrentPage - 1) * this.userRowsPerPage;
      const end = start + this.userRowsPerPage;
      return dataSource.slice(start, end);
    },
    visibleUserPages() {
      return this.generateVisiblePages(this.userCurrentPage, this.totalUserPages);
    },

    // 公告分页计算
    totalAnnouncementPages() {
      return Math.ceil(this.announcements.length / this.announcementRowsPerPage) || 1;
    },
    currentPageAnnouncements() {
      const start = (this.announcementCurrentPage - 1) * this.announcementRowsPerPage;
      const end = start + this.announcementRowsPerPage;
      return this.announcements.slice(start, end);
    },
    visibleAnnouncementPages() {
      return this.generateVisiblePages(this.announcementCurrentPage, this.totalAnnouncementPages);
    },
    
    // 统计数据 - 新增activeLends计算属性
    bookCount() {
      return this.books.length;
    },
    userCount() {
      return this.users.length;
    },
    announcementCount() {
      return this.announcements.length;
    },
    activeLends() {
      // 计算活跃借阅数量（示例逻辑）
      return this.lends.filter(lend => lend.status === '借阅中').length;
    }
  },
  
  mounted() {
    // 初始化数据
    this.fetchBooks();
    this.fetchCategories();
    this.fetchLends();
    this.fetchUsers();
    this.fetchAnnouncements();
    
    // 初始化图表
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  
  methods: {
    // 页面切换 - 新增图表重新渲染逻辑
    changePage(page) {
      console.log('切换页面到:', page);
      this.currentPage = page;
      
      // 当切换回主页时，重新渲染图表
      if (page === 'home') {
        this.$nextTick(() => {
          this.initCharts();
        });
      }
    },
    
    // 退出登录
    logout() {
      // 实现退出登录逻辑
      alert('退出登录');
    },
    
    // 生成可见页码
    generateVisiblePages(currentPage, totalPages) {
      const pages = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, 5);
        } else if (currentPage >= totalPages - 2) {
          pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
        }
      }
      return pages;
    },
    
    // 图表相关方法 - 新增
    initCharts() {
      // 销毁现有图表实例
      if (this.bookCategoryChart) this.bookCategoryChart.destroy();
      if (this.lendTrendChart) this.lendTrendChart.destroy();
      if (this.userTypeChart) this.userTypeChart.destroy();
      if (this.announcementStatusChart) this.announcementStatusChart.destroy();
      
      // 图书分类分布图
      const bookCategoryCtx = document.getElementById('bookCategoryChart');
      if (bookCategoryCtx) {
        this.bookCategoryChart = new Chart(bookCategoryCtx, {
          type: 'doughnut',
          data: {
            labels: this.getCategoryNames(),
            datasets: [{
              data: this.getCategoryBookCounts(),
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                '#9966FF', '#FF9F40', '#8AC926', '#1982C4'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
              title: {
                display: false
              }
            }
          }
        });
      }
      
      // 借阅趋势图
      const lendTrendCtx = document.getElementById('lendTrendChart');
      if (lendTrendCtx) {
        this.lendTrendChart = new Chart(lendTrendCtx, {
          type: 'line',
          data: {
            labels: this.getLast7Days(),
            datasets: [{
              label: '借阅数量',
              data: this.getLendTrendData(),
              borderColor: '#36A2EB',
              backgroundColor: 'rgba(54, 162, 235, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      }
      
      // 用户类型分布图
      const userTypeCtx = document.getElementById('userTypeChart');
      if (userTypeCtx) {
        this.userTypeChart = new Chart(userTypeCtx, {
          type: 'pie',
          data: {
            labels: ['管理员', '读者'],
            datasets: [{
              data: this.getUserTypeCounts(),
              backgroundColor: ['#FF6384', '#36A2EB'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              }
            }
          }
        });
      }
      
      // 公告状态图
      const announcementStatusCtx = document.getElementById('announcementStatusChart');
      if (announcementStatusCtx) {
        this.announcementStatusChart = new Chart(announcementStatusCtx, {
          type: 'bar',
          data: {
            labels: ['已发布', '草稿'],
            datasets: [{
              label: '公告数量',
              data: this.getAnnouncementStatusCounts(),
              backgroundColor: ['#4BC0C0', '#FFCE56'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      }
    },
    
    // 获取分类名称
    getCategoryNames() {
      return this.categories.map(cat => cat._type_name);
    },
    
    // 获取各分类图书数量
    getCategoryBookCounts() {
      return this.categories.map(cat => {
        return this.books.filter(book => book._tid === cat._tid).length;
      });
    },
    
    // 获取最近7天日期
    getLast7Days() {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(`${date.getMonth()+1}/${date.getDate()}`);
      }
      return days;
    },
    
    // 获取借阅趋势数据（示例数据）
    getLendTrendData() {
      // 这里应该是实际的数据，这里使用示例数据
      return [2, 5, 3, 7, 4, 6, 8];
    },
    
    // 获取用户类型数量
    getUserTypeCounts() {
      const adminCount = this.users.filter(user => user._type === 'admin').length;
      const readerCount = this.users.length - adminCount;
      return [adminCount, readerCount];
    },
    
    // 获取公告状态数量
    getAnnouncementStatusCounts() {
      const publishedCount = this.announcements.filter(a => a._status === 'published').length;
      const draftCount = this.announcements.length - publishedCount;
      return [publishedCount, draftCount];
    },
    
    // 原有其他方法保持不变...
    // 图书管理相关方法
    async fetchBooks() {
      try {
        const res = await fetch('/api/page/books');
        const result = await res.json();
        if (res.status === 200) {
          this.books = result.data || [];
          this.filteredBooks = [];
        } else {
          this.books = [];
          this.filteredBooks = [];
          alert(result.message || '没有找到图书');
        }
      } catch (err) {
        console.error(err);
        alert('无法获取图书数据，请稍后再试');
      }
    },
    
    handleBookSearch() {
      this.bookCurrentPage = 1;
      this.filteredBooks = this.getBookFilterData();
      if (this.filteredBooks.length === 0) {
        alert("没有找到相关图书");
      }
    },
    
    getBookFilterData() {
      const typeMap = {
        '_book_name': '_book_name',
        '_author': '_author',
        '_isbn': '_isbn',
        '_type_name': '_type_name'
      };
      
      const actualField = typeMap[this.searchType] || '_book_name';
      const keyword = this.searchKeyword.trim();
      
      if (!keyword) return this.books;
      
      return this.books.filter(book => {
        const fieldValue = book[actualField] ? book[actualField].toString() : '';
        return fieldValue.includes(keyword);
      });
    },
    
    changeBookPage(page) {
      if (page < 1 || page > this.totalBookPages) return;
      this.bookCurrentPage = page;
    },
    
    showAddBookModal() {
      this.isEditBook = false;
      this.currentEditBookId = null;
      this.bookForm = {
        bookTitle: '',
        author: '',
        isbn: '',
        bookType: '',
        publisher: '',
        totalQuantity: 0
      };
      this.showAddBookModalFlag = true;
    },
    
    closeAddBookModal() {
      this.showAddBookModalFlag = false;
    },
    
    editBook(book) {
      this.isEditBook = true;
      this.currentEditBookId = book._bid;
      this.bookForm = {
        bookTitle: book._book_name,
        author: book._author,
        isbn: book._isbn,
        bookType: book._tid,
        publisher: book._press,
        totalQuantity: book._num
      };
      this.showAddBookModalFlag = true;
    },
    
    async submitBookForm() {
      const { bookTitle, author, isbn, bookType, publisher, totalQuantity } = this.bookForm;
      
      if (!bookTitle || !author || !isbn || !bookType || !publisher || !totalQuantity) {
        alert('请填写完整的图书信息！');
        return;
      }
      
      const bookData = {
        _book_name: bookTitle,
        _author: author,
        _isbn: isbn,
        _tid: bookType,
        _press: publisher,
        _num: Number(totalQuantity)
      };
      
      try {
        if (this.isEditBook) {
          await this.editBookApi(this.currentEditBookId, bookData);
        } else {
          await this.addBookApi(bookData);
        }
        this.closeAddBookModal();
        await this.fetchBooks();
      } catch (err) {
        console.error(err);
      }
    },
    
    async addBookApi(bookData) {
      const res = await fetch('/api/page/books/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      const result = await res.json();
      if (res.status !== 200) {
        throw new Error(result.message || '添加图书失败');
      }
      alert(result.message || '添加图书成功');
    },
    
    async editBookApi(id, bookData) {
      bookData._bid = id;
      const res = await fetch('/api/page/books/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      const result = await res.json();
      if (res.status !== 200) {
        throw new Error(result.message || '编辑图书失败');
      }
      alert(result.message || '编辑图书成功');
    },
    
    async deleteBook(id) {
      if (!confirm('确定要删除这本图书吗？')) return;
      
      try {
        const res = await fetch('/api/page/books/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _bid: id })
        });
        const result = await res.json()
        if (res.status === 200) {
          alert(result.message || '成功删除图书信息')
          await this.fetchBooks();
        } else {
          alert(result.message || '操作失败')
        }
      } catch (err) {
        console.error(err)
        alert('删除图书失败')
      }
    },
    
    // 分类管理相关方法
    async fetchCategories() {
      try {
        const res = await fetch('/api/page/categories', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await res.json();
        if (res.status === 200) {
          this.categories = result.data || [];
        } else {
          this.categories = [];
          alert(result.message || '没有找到分类');
        }
      } catch (err) {
        alert('无法获取分类数据，请稍后再试');
        console.error(err);
      }
    },
    
    changeCategoryPage(page) {
      if (page < 1 || page > this.totalCategoryPages) return;
      this.categoryCurrentPage = page;
    },
    
    showAddCategoryModal() {
      this.isEditCategory = false;
      this.currentEditCategoryId = null;
      this.categoryForm = {
        categoryId: '',
        categoryName: ''
      };
      this.showAddCategoryModalFlag = true;
    },
    
    closeAddCategoryModal() {
      this.showAddCategoryModalFlag = false;
    },
    
    editCategory(cat) {
      this.isEditCategory = true;
      this.currentEditCategoryId = cat._tid;
      this.categoryForm = {
        categoryId: cat._tid,
        categoryName: cat._type_name
      };
      this.showAddCategoryModalFlag = true;
    },
    
    async submitCategoryForm() {
      const { categoryId, categoryName } = this.categoryForm;
      
      if (!categoryId || !categoryName) {
        alert('请输入分类名称和分类ID！');
        return;
      }
      
      try {
        if (this.isEditCategory) {
          await this.editCategoryApi(this.currentEditCategoryId, {
            _tid: categoryId,
            _type_name: categoryName
          });
        } else {
          await this.addCategoryApi({
            _tid: categoryId,
            _type_name: categoryName
          });
        }
        this.closeAddCategoryModal();
        await this.fetchCategories();
        // 刷新图书类型下拉框
        this.fetchBooks();
      } catch (err) {
        console.error(err);
      }
    },
    
    async addCategoryApi(categoryData) {
      const res = await fetch('/api/page/category/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })
      const result = await res.json()
      if (res.status !== 200) {
        throw new Error(result.message || '添加分类失败')
      }
      alert(result.message || '添加分类成功')
    },
    
    async editCategoryApi(id, categoryData) {
      const res = await fetch('/api/page/category/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _tid: id, ...categoryData })
      });
      const result = await res.json();
      if (res.status !== 200) {
        throw new Error(result.message || '编辑分类失败')
      }
      alert(result.message || '编辑分类成功')
    },
    
    async deleteCategory(id) {
      if (!confirm('确定要删除该分类吗？')) return
      
      try {
        const cat = this.categories.find(c => c._tid === id)
        if (!cat) {
          alert('未找到该分类')
          return
        }
        const res = await fetch('/api/page/category/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _tid: id, _type_name: cat._type_name })
        })
        const result = await res.json()
        if (res.status === 200) {
          alert(result.message || '删除成功')
          await this.fetchCategories()
        } else {
          alert(result.message || '删除失败')
        }
      } catch (err) {
        alert('删除分类失败')
        console.error(err)
      }
    },
    
    // 借阅管理相关方法
    async fetchLends() {
      try {
        const res = await fetch('/api/page/history')
        const result = await res.json()
        if (res.status === 200) {
          this.lends = result.data || []
        } else {
          this.lends = []
          alert(result.message || '没有找到历史记录')
        }
      } catch (err) {
        alert('无法获取历史记录，请稍后再试')
        console.error(err)
      }
    },
    
    changeLendPage(page) {
      if (page < 1 || page > this.totalLendPages) return
      this.lendCurrentPage = page
    },
    
    formatDate(dateString) {
      return new Date(dateString).toISOString().split('T')[0]
    },
    
    delayLend(hid, endDate) {
      this.currentDelayHid = hid
      // 默认延期一个月
      const newDate = new Date(endDate)
      newDate.setMonth(newDate.getMonth() + 1)
      this.newReturnDate = this.formatDate(newDate)
      this.showDelayModal = true
    },
    closeDelayModal() {
      this.showDelayModal = false
      this.currentDelayHid = null
    },
    
    async submitDelay() {
      if (!this.currentDelayHid || !this.newReturnDate) return
      
      try {
        await this.delayLendApi(this.currentDelayHid, this.newReturnDate)
        this.closeDelayModal()
        await this.fetchLends()
      } catch (err) {
        console.error(err)
      }
    },  
    async delayLendApi(hid, newReturnDate) {
      const res = await fetch('/api/page/books/borrow/delay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _hid: hid, newReturnDate })
      })
      const result = await res.json()
      if (res.status !== 200) {
        throw new Error(result.message || '延期失败')
      }
      alert(result.message || '图书续借成功')
    },

    // 用户管理相关方法
    async fetchUsers() {
      try {
        const res = await fetch('/api/page/users');
        const result = await res.json();
        if (res.status === 200) {
          this.users = result.data || [];
          this.filteredUsers = [];
        } else {
          this.users = [];
          this.filteredUsers = [];
          alert(result.message || '没有找到用户');
        }
      } catch (err) {
        console.error(err);
        alert('无法获取用户数据，请稍后再试');
      }
    },

    handleUserSearch() {
      this.userCurrentPage = 1;
      this.filteredUsers = this.getUserFilterData();
      if (this.filteredUsers.length === 0) {
        alert("没有找到相关用户");
      }
    },

    getUserFilterData() {
      const typeMap = {
        '_uid': '_uid',
        '_username': '_username',
        '_name': '_name',
        '_phone': '_phone'
      };
      
      const actualField = typeMap[this.userSearchType] || '_username';
      const keyword = this.userSearchKeyword.trim();
      
      if (!keyword) return this.users;
      
      return this.users.filter(user => {
        const fieldValue = user[actualField] ? user[actualField].toString() : '';
        return fieldValue.includes(keyword);
      });
    },

    changeUserPage(page) {
      if (page < 1 || page > this.totalUserPages) return;
      this.userCurrentPage = page;
    },

    showAddUserModal() {
      this.isEditUser = false;
      this.currentEditUserId = null;
      this.userForm = {
        username: '',
        password: '',
        name: '',
        phone: '',
        email: '',
        userType: 'reader'
      };
      this.showAddUserModalFlag = true;
    },

    closeAddUserModal() {
      this.showAddUserModalFlag = false;
    },

    editUser(user) {
      this.isEditUser = true;
      this.currentEditUserId = user._uid;
      this.userForm = {
        username: user._username,
        password: '',
        name: user._name,
        phone: user._phone,
        email: user._email,
        userType: user._type
      };
      this.showAddUserModalFlag = true;
    },

    async submitUserForm() {
      const { username, password, name, phone, email, userType } = this.userForm;
      
      if (!username || !name || !phone || !email || !userType) {
        alert('请填写完整的用户信息！');
        return;
      }

      if (!this.isEditUser && !password) {
        alert('请设置用户密码！');
        return;
      }
      
      const userData = {
        _username: username,
        _name: name,
        _phone: phone,
        _email: email,
        _type: userType
      };

      if (password) {
        userData._password = password;
      }
      
      try {
        if (this.isEditUser) {
          await this.editUserApi(this.currentEditUserId, userData);
        } else {
          await this.addUserApi(userData);
        }
        this.closeAddUserModal();
        await this.fetchUsers();
      } catch (err) {
        console.error(err);
      }
    },

    async addUserApi(userData) {
      const res = await fetch('/api/page/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const result = await res.json();
      if (res.status !== 200) {
        throw new Error(result.message || '添加用户失败');
      }
      alert(result.message || '添加用户成功');
    },

    async editUserApi(id, userData) {
      userData._uid = id;
      const res = await fetch('/api/page/users/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const result = await res.json();
      if (res.status !== 200) {
        throw new Error(result.message || '编辑用户失败');
      }
      alert(result.message || '编辑用户成功');
    },

    async deleteUser(id) {
      if (!confirm('确定要删除这个用户吗？')) return;
      
      try {
        const res = await fetch('/api/page/users/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _uid: id })
        });
        const result = await res.json()
        if (res.status === 200) {
          alert(result.message || '成功删除用户信息')
          await this.fetchUsers();
        } else {
          alert(result.message || '操作失败')
        }
      } catch (err) {
        console.error(err)
        alert('删除用户失败')
      }
    },

    async resetPassword(id) {
      if (!confirm('确定要重置该用户的密码吗？')) return;
      
      try {
        const res = await fetch('/api/page/users/reset-password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _uid: id })
        });
        const result = await res.json()
        if (res.status === 200) {
          alert(result.message || '密码重置成功')
        } else {
          alert(result.message || '操作失败')
        }
      } catch (err) {
        console.error(err)
        alert('重置密码失败')
      }
    },

    // 公告管理相关方法
    async fetchAnnouncements() {
      try {
        const res = await fetch('/api/page/announcements');
        const result = await res.json();
        if (res.status === 200) {
          this.announcements = result.data || [];
        } else {
          this.announcements = [];
          alert(result.message || '没有找到公告');
        }
      } catch (err) {
        console.error(err);
        alert('无法获取公告数据，请稍后再试');
      }
    },

    changeAnnouncementPage(page) {
      if (page < 1 || page > this.totalAnnouncementPages) return;
      this.announcementCurrentPage = page;
    },

    showAddAnnouncementModal() {
      this.isEditAnnouncement = false;
      this.currentEditAnnouncementId = null;
      this.announcementForm = {
        title: '',
        content: '',
        status: 'published'
      };
      this.showAddAnnouncementModalFlag = true;
    },

    closeAddAnnouncementModal() {
      this.showAddAnnouncementModalFlag = false;
    },

    editAnnouncement(announcement) {
      this.isEditAnnouncement = true;
      this.currentEditAnnouncementId = announcement._aid;
      this.announcementForm = {
        title: announcement._title,
        content: announcement._content,
        status: announcement._status
      };
      this.showAddAnnouncementModalFlag = true;
    },

    async submitAnnouncementForm() {
      const { title, content, status } = this.announcementForm;
      
      if (!title || !content) {
        alert('请填写完整的公告信息！');
        return;
      }
      
      const announcementData = {
        _title: title,
        _content: content,
        _status: status
      };
      
      try {
        if (this.isEditAnnouncement) {
          await this.editAnnouncementApi(this.currentEditAnnouncementId, announcementData);
        } else {
          await this.addAnnouncementApi(announcementData);
        }
        this.closeAddAnnouncementModal();
        await this.fetchAnnouncements();
      } catch (err) {
        console.error(err);
      }
    },

    async addAnnouncementApi(announcementData) {
      const res = await fetch('/api/page/announcements/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      });
      const result = await res.json();
      if (res.status !== 200) {
        throw new Error(result.message || '发布公告失败');
      }
      alert(result.message || '发布公告成功');
    },

    async editAnnouncementApi(id, announcementData) {
      announcementData._aid = id;
      const res = await fetch('/api/page/announcements/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      });
      const result = await res.json();
      if (res.status !== 200) {
        throw new Error(result.message || '编辑公告失败');
      }
      alert(result.message || '编辑公告成功');
    },

    async deleteAnnouncement(id) {
      if (!confirm('确定要删除这个公告吗？')) return;
      
      try {
        const res = await fetch('/api/page/announcements/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _aid: id })
        });
        const result = await res.json()
        if (res.status === 200) {
          alert(result.message || '成功删除公告')
          await this.fetchAnnouncements();
        } else {
          alert(result.message || '操作失败')
        }
      } catch (err) {
        console.error(err)
        alert('删除公告失败')
      }
    },

    async publishAnnouncement(id) {
      try {
        const res = await fetch('/api/page/announcements/publish', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _aid: id })
        });
        const result = await res.json()
        if (res.status === 200) {
          alert(result.message || '公告发布成功')
          await this.fetchAnnouncements();
        } else {
          alert(result.message || '操作失败')
        }
      } catch (err) {
        console.error(err)
        alert('发布公告失败')
      }
    },

    async unpublishAnnouncement(id) {
      try {
        const res = await fetch('/api/page/announcements/unpublish', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _aid: id })
        });
        const result = await res.json()
        if (res.status === 200) {
          alert(result.message || '公告取消发布成功')
          await this.fetchAnnouncements();
        } else {
          alert(result.message || '操作失败')
        }
      } catch (err) {
        console.error(err)
        alert('取消发布公告失败')
      }
    }
  }
}
</script>

<style>
/* 基础样式 */
#viewport {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#navbar {
  width: 100%;
  background-color: #2c3e50;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

#navbar header {
  padding: 0;
  background-color: #1a252f;
  border-bottom: 1px solid #34495e;
}

#navbar header a {
  display: block;
  padding: 20px;
  text-align: center;
  color: white;
  text-decoration: none;
  font-size: 24px;
  font-weight: 700;
  cursor: default;
}

#navbar header a:hover {
  background-color: transparent;
}

#navbar .nav {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  background-color: #2c3e50;
}

#navbar .nav li {
  margin: 0;
}

#navbar .nav li a {
  display: block;
  padding: 18px 30px;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
}

#navbar .nav li a:hover {
  background-color: #34495e;
  border-bottom: 3px solid #1976d2;
}

#content {
  flex: 1;
  margin-top: 120px; /* 根据导航栏高度调整 */
  padding: 30px;
  background-image: url('D:\vuetest\vue01\src\views\vue01\public\images.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  min-height: calc(100vh - 120px);
}

/* 页面显示样式 */
.page {
  display: block;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 180px);
}

/* 弹窗样式 - 统一风格 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-content h2 {
  margin: 0 0 20px 0;
  font-size: 22px;
  color: #333;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 10px;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.close-button:hover {
  color: #333;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

form input, form select, form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

form input:focus, form select:focus, form textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

form textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 10px;
}

.submit-button:hover {
  background-color: #1565c0;
}

/* 表格样式 */
.book_table, .category_table, .lend_table, .user_table, .announcement_table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 25px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.book_table th, .book_table td,
.category_table th, .category_table td,
.lend_table th, .lend_table td,
.user_table th, .user_table td,
.announcement_table th, .announcement_table td {
  padding: 15px 12px;
  border: 1px solid #e0e0e0;
  text-align: center;
  font-size: 14px;
}

.book_table th,
.category_table th,
.lend_table th,
.user_table th,
.announcement_table th {
  background-color: #1976d2;
  color: white;
  font-weight: 600;
  font-size: 15px;
  padding: 16px 12px;
}

.book_table tr:nth-child(even),
.category_table tr:nth-child(even),
.lend_table tr:nth-child(even),
.user_table tr:nth-child(even),
.announcement_table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.book_table tr:hover,
.category_table tr:hover,
.lend_table tr:hover,
.user_table tr:hover,
.announcement_table tr:hover {
  background-color: #e3f2fd;
}

/* 按钮样式 */
.edit-button, .delete-button,
.edit-category, .delete-category,
.lend-action, .reset-password, .publish-button, .unpublish-button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  min-width: 60px;
}

.edit-button:hover, .delete-button:hover,
.edit-category:hover, .delete-category:hover,
.lend-action:hover, .reset-password:hover, .publish-button:hover, .unpublish-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.edit-button:hover, .edit-category:hover {
  background-color: #2196f3;
}

.delete-button:hover, .delete-category:hover {
  background-color: #f44336;
}

.lend-action:hover {
  background-color: #ff9800;
}

.reset-password {
  background-color: #ff9800;
}

.reset-password:hover {
  background-color: #f57c00;
}

.publish-button {
  background-color: #4caf50;
}

.publish-button:hover {
  background-color: #45a049;
}

.unpublish-button {
  background-color: #f44336;
}

.unpublish-button:hover {
  background-color: #da190b;
}

.addBookModal, .addCategoryButton, .search-button, .addUserModal, .addAnnouncementButton {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 120px;
}

.addBookModal:hover, .addCategoryButton:hover, .search-button:hover, .addUserModal:hover, .addAnnouncementButton:hover {
  background-color: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

/* 分页样式 */
.pagination {
  margin-top: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination button {
  margin: 0 3px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  min-width: 40px;
}

.pagination button:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #1976d2;
}

.pagination button.active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background-color: #f5f5f5;
}

.total-pages {
  font-size: 14px;
  color: #666;
  margin-right: 15px;
}

/* 搜索栏样式 */
.search-form {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  align-items: center;
  flex-wrap: wrap;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-select, .search-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
  flex: 1;
  max-width: 300px;
}

.search-input {
  flex: 2;
  max-width: 400px;
}

.search-select:focus, .search-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

/* 标题样式 - 统一大小 */
.book-search-title, .category-title, .lend-title, .user-title, .announcement-title, .home-title {
  margin: 0 0 25px 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 3px solid #1976d2;
}

.home-info {
  text-align: center;
  font-size: 18px;
  color: #555;
  line-height: 1.6;
}

.home-info p {
  margin: 15px 0;
}

.home-info span {
  font-weight: 700;
  color: #1976d2;
  font-size: 20px;
}

/* 状态样式 */
.status-published {
  color: #4caf50;
  font-weight: 600;
  padding: 4px 12px;
  background-color: #e8f5e8;
  border-radius: 20px;
  font-size: 13px;
}

.status-draft {
  color: #ff9800;
  font-weight: 600;
  padding: 4px 12px;
  background-color: #fff3e0;
  border-radius: 20px;
  font-size: 13px;
}

/* 主页数据可视化样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.book-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.announcement-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.lend-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-info p {
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
}

.charts-container {
  margin-bottom: 30px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chart-card h3 {
  margin: 0 0 15px;
  font-size: 18px;
  color: #333;
  text-align: center;
}

.chart-wrapper {
  position: relative;
  height: 250px;
}

.quick-actions {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.quick-actions h3 {
  margin: 0 0 15px;
  font-size: 18px;
  color: #333;
  text-align: center;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 20px 15px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 600;
}

.action-btn:hover {
  background: #1565c0;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.action-btn i {
  font-size: 24px;
  margin-bottom: 8px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  #content {
    padding: 20px;
    margin-top: 110px;
  }
  
  .page {
    padding: 20px;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-select, .search-input {
    max-width: none;
    min-width: auto;
  }
}

@media (max-width: 768px) {
  #sidebar .nav {
    flex-wrap: wrap;
  }
  
  #sidebar .nav li a {
    padding: 15px 20px;
    font-size: 14px;
  }
  
  #content {
    margin-top: 140px;
    padding: 15px;
  }
  
  .modal-content {
    width: 95vw;
    padding: 20px;
  }
  
  .book-search-title, .category-title, .lend-title, .user-title, .announcement-title, .home-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  #sidebar .nav li a {
    padding: 12px 15px;
    font-size: 13px;
  }
  
  #content {
    margin-top: 160px;
  }
}

@media (max-width: 992px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
