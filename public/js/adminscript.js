$(document).ready(function () {
    // 默认显示主页，隐藏其他页面
    $('.page').hide();
    $('#home').show();
    // 左侧菜单栏切换
    $("#sidebar .nav a").click(function () {
        var target = $(this).data('target');
        $('.page').hide();
        $('#' + target).show();
    });
    
    // 初始化所有模块
    initBookModule();
    initUserModule();
    initCategoryModule();
    initLendModule();
    initAnnouncementModule();
});

//-----------通用分页渲染函数---------------
function renderPagination({totalItems, rowsPerPage, currentPage, container, onPageChange}) {
    // 计算总页数
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
    
    // 确保当前页在有效范围内
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    
    container.innerHTML = '';
    
    // 当没有数据时不显示分页
    if (totalItems === 0) {
        container.innerHTML = '<span>无数据</span>';
        return;
    }
    
    // 当只有一页时不显示分页
    if (totalPages <= 1) {
        return;
    }

    // 首页
    const firstBtn = document.createElement('button');
    firstBtn.textContent = '首页';
    firstBtn.disabled = currentPage === 1;
    firstBtn.onclick = () => onPageChange(1);
    container.appendChild(firstBtn);

    // 上一页
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '上一页';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => onPageChange(currentPage - 1);
    container.appendChild(prevBtn);

    // 队列式滑动页码
    let startPage, endPage;
    if (totalPages <= 10) {
        startPage = 1;
        endPage = totalPages;
    } else {
        if (currentPage <= 5) {
            startPage = 1;
            endPage = 10;
        } else if (currentPage >= totalPages - 4) {
            startPage = totalPages - 9;
            endPage = totalPages;
        } else {
            startPage = currentPage - 4;
            endPage = currentPage + 5;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        if (i === currentPage) pageBtn.classList.add('active');
        pageBtn.onclick = () => onPageChange(i);
        container.appendChild(pageBtn);
    }

    // 下一页
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一页';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => onPageChange(currentPage + 1);
    container.appendChild(nextBtn);

    // 末页
    const lastBtn = document.createElement('button');
    lastBtn.textContent = '末页';
    lastBtn.disabled = currentPage === totalPages;
    lastBtn.onclick = () => onPageChange(totalPages);
    container.appendChild(lastBtn);
}

// ========== 图书管理 ==========
function initBookModule() {
    // 图书数据
    let books = []; 
    let filteredBooks = []; 
    let bookCurrentPage = 1;
    const bookRowsPerPage = 10;

    // DOM 元素
    const bookTableBody = document.querySelector(".book_table tbody");
    const bookPageNumbersContainer = document.querySelector("#book_admin .page-numbers");
    const bookSubmitButton = document.querySelector('#addBookModal .submit-button');
    const addBookModal = document.getElementById('addBookModal');

    // 获取图书数据
    async function fetchBooks() {
        try {
            const res = await fetch('/api/page/books');
            const result = await res.json();
            if (res.status === 200) {
                books = result.data || [];
                filteredBooks = [];
                renderBookTable();
                renderBookPagination();
                document.getElementById('bookCount').textContent = books.length;
            } else if (res.status === 400) {
                books = [];
                renderBookTable();
                document.getElementById('bookCount').textContent = 0;
                alert(result.message || '没有找到图书');
            } else if (res.status === 500) {
                alert(result.message || '服务器错误');
            } else {
                alert('未知错误');
            }
        } catch (err) {
            console.error(err);
            alert('无法获取图书数据，请稍后再试');
        }
    }

    // 渲染图书表格
    function renderBookTable() {
        bookTableBody.innerHTML = "";
        
        // 使用当前有效数据源
        const dataSource = filteredBooks.length > 0 ? filteredBooks : books;
        
        // 空数据状态
        if (dataSource.length === 0) {
            bookTableBody.innerHTML = `<tr><td colspan="8">暂无图书数据</td></tr>`;
            return;
        }
        
        // 确保页码在有效范围内
        const totalPages = Math.ceil(dataSource.length / bookRowsPerPage);
        bookCurrentPage = Math.max(1, Math.min(bookCurrentPage, totalPages));
        
        // 计算当前页的起始和结束索引
        const start = (bookCurrentPage - 1) * bookRowsPerPage;
        const end = Math.min(start + bookRowsPerPage, dataSource.length);
        
        // 遍历当前页的图书数据生成表格行
        for (let i = start; i < end; i++) {
            const book = dataSource[i];
            if (!book) continue;
            
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${book._bid}</td>
                <td>${book._type_name || ''}</td>
                <td>${book._book_name}</td>
                <td>${book._author}</td>
                <td>${book._isbn}</td>
                <td>${book._press}</td>
                <td>${book._num}</td>
                <td>
                    <button class="edit-button" data-id="${book._bid}">编辑</button>
                    <button class="delete-button" data-id="${book._bid}">删除</button>
                </td>
            `;
            bookTableBody.appendChild(row);
        }
    }

    // 图书管理分页
    function renderBookPagination() {
        // 使用当前有效数据源
        const dataSource = filteredBooks.length > 0 ? filteredBooks : books;
        
        renderPagination({
            totalItems: dataSource.length,
            rowsPerPage: bookRowsPerPage,
            currentPage: bookCurrentPage,
            container: bookPageNumbersContainer,
            onPageChange: (page) => {
                bookCurrentPage = page;
                renderBookTable();
                renderBookPagination();
            }
        });
    }

    // 表格中编辑/删除事件委托
    bookTableBody.addEventListener('click', function (e) {
        // 编辑按钮点击
        if (e.target.classList.contains('edit-button')) {
            const id = Number(e.target.getAttribute('data-id'));
            const book = books.find(b => b._bid === id);
            
            if (!book) {
                alert('未找到图书信息');
                return;
            }
            
            showModal(addBookModal, { title: '编辑图书', resetForm: true, dataEditId: id });
            addBookModal.querySelector('#bookTitle').value = book._book_name;
            addBookModal.querySelector('#author').value = book._author;
            addBookModal.querySelector('#isbn').value = book._isbn;
            console.log("图书种类：",book._tid);
            renderBookTypeOptions();
            addBookModal.querySelector('#bookType').value = book._tid;
            addBookModal.querySelector('#publisher').value = book._press;
            addBookModal.querySelector('#totalQuantity').value = book._num;
        }
        
        // 删除
        if (e.target.classList.contains('delete-button')) {
            const id = Number(e.target.getAttribute('data-id'));
            if (confirm('确定要删除这本图书吗？')) {
                deleteBook(id);
            }
        }
    });

    // 新增图书
    async function addBook(bookData) {
        try {
            const res = await fetch('/api/page/books/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            console.log("新增图书：",bookData);
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message);
                await fetchBooks();
            } else {
                alert(result.message || '操作失败');
            }
        } catch (err) {
            console.error(err);
            alert('添加图书失败');
        }
    }

    // 编辑图书
    async function editBook(id, bookData) {
        try {
            bookData._bid = id;
            const res = await fetch('/api/page/books/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '图书信息更新成功');
                await fetchBooks();
            } else {
                alert(result.message || '操作失败');
            }
        } catch (err) {
            console.error(err);
            alert('编辑图书失败');
        }
    }

    // 删除图书
    async function deleteBook(id) {
        try {
            const res = await fetch('/api/page/books/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _bid: id })
            });
            
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '成功删除图书信息');
                await fetchBooks();
            } else {
                alert(result.message || '操作失败');
            }
        } catch (err) {
            console.error(err);
            alert('删除图书失败');
        }
    }

    // 渲染图书类型下拉框
    function renderBookTypeOptions() {
        console.log("renderBookTypeOptions已被调用");
        const bookTypeSelect = document.getElementById('bookType');
        if (!bookTypeSelect) return;
        
        // 确保categories变量已定义
        if (!window.categories) {
            console.warn('图书分类数据未加载');
            return;
        }
        
        bookTypeSelect.innerHTML = window.categories.map(cat => 
            `<option value="${cat._tid}">${cat._type_name}</option>`
        ).join('');
    }

    // 显示添加图书弹窗
    document.querySelector('.addBookModal').addEventListener('click', () => {
        showModal(addBookModal, { title: '添加图书', resetForm: true });
         //console.log("图书种类：",book._tid);
            renderBookTypeOptions();
    });

    // 关闭弹窗
    addBookModal.querySelector('.close-button').addEventListener('click', () => {
        hideModal(addBookModal);
    });
    window.addEventListener('click', (event) => {
        if (event.target === addBookModal) hideModal(addBookModal);
    });

    // 弹窗提交按钮
    bookSubmitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        
        const bookTitle = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('author').value.trim();
        const isbn = document.getElementById('isbn').value.trim();
         //console.log("图书种类：",book._tid);
        //renderBookTypeOptions();
        const bookType = document.getElementById('bookType').value.trim();
        const publisher = document.getElementById('publisher').value.trim();
        const totalQuantity = document.getElementById('totalQuantity').value.trim();
        if (!bookTitle || !author || !isbn || !bookType || !publisher || !totalQuantity) {
            alert('请填写完整的图书信息！');
            return;
        }

        const editId = addBookModal.getAttribute('data-edit-id');
        const bookData = {
            _book_name: bookTitle,
            _author: author,
            _isbn: isbn,
            _tid: bookType,
            _press: publisher,
            _num: Number(totalQuantity)
        };
        console.log("图书数据：", bookData);
        if (editId) {
            await editBook(Number(editId), bookData);
            addBookModal.removeAttribute('data-edit-id');
            addBookModal.querySelector('h2').textContent = '添加图书';
        } else {
            await addBook(bookData);
        }
        
        hideModal(addBookModal);
        addBookModal.querySelector('form').reset();
    });

    // 搜索功能
    function getBookFilterData() {
        const typeMap = {
            '_book_name': '_book_name',
            '_author': '_author',
            '_isbn': '_isbn',
            '_type_name': '_type_name'
        };
        
        const type = document.getElementById('searchType').value;

        const actualField = typeMap[type] || '_book_name';
        const keyword = document.getElementById('searchInput').value.trim();
        //console.log('Search Type:', type); // 调试信息
        //console.log("类型名字：",typeMap[type]); // 调试信息
        //console.log('Actual Field:', actualField); // 调试信息
        //console.log('Keyword:', keyword); // 调试信息
    
        
        if (!keyword) return books;
        
        return books.filter(book => {
            const fieldValue = book[actualField] ? book[actualField].toString() : '';
            return fieldValue.includes(keyword);
        });
    }

    document.getElementById('searchButton').addEventListener('click', function() {
        bookCurrentPage = 1;
        filteredBooks = getBookFilterData();
        if(filteredBooks.length == 0){
            alert("没有找到相关图书");
        }
        renderBookTable();
        renderBookPagination();
    });

    // 初始化
    fetchBooks();
}

// ========== 用户管理 ==========
function initUserModule() {
    // 用户数据
    let users = [];
    let filteredUsers = [];
    let userCurrentPage = 1;
    const userRowsPerPage = 10;

    // DOM 元素
    const userTableBody = document.querySelector(".user_table tbody");
    const userPageNumbersContainer = document.querySelector("#user_admin .page-numbers");
    const addUserButton = document.querySelector('.addUserButton');
    const addUserModal = document.getElementById('addUserModal');
    const userCloseButton = addUserModal.querySelector('.close-button');
    const userSubmitButton = addUserModal.querySelector('.submit-button');

    // 获取用户数据
    async function fetchUsers() {
        try {
            const res = await fetch('/api/page/readers');
            const result = await res.json();
            if (res.status === 200) {
                users = result.data || [];
                filteredUsers = [];
                renderUserTable();
                renderUserPagination();
                document.getElementById('readerCount').textContent = users.length;
            } else {
                alert(result.message || '获取用户数据失败');
            }
        } catch (err) {
            console.error(err);
            alert('无法获取用户数据，请稍后再试');
        }
    }

    // 渲染用户表格
    function renderUserTable() {
        userTableBody.innerHTML = "";
        
        // 使用当前有效数据源
        const dataSource = filteredUsers.length > 0 ? filteredUsers : users;
        
        // 空数据状态
        if (dataSource.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="7">暂无用户数据</td></tr>`;
            return;
        }
        
        // 确保页码在有效范围内
        const totalPages = Math.ceil(dataSource.length / userRowsPerPage);
        userCurrentPage = Math.max(1, Math.min(userCurrentPage, totalPages));
        
        // 计算当前页的起始和结束索引
        const start = (userCurrentPage - 1) * userRowsPerPage;
        const end = Math.min(start + userRowsPerPage, dataSource.length);
        
        for (let i = start; i < end; i++) {
            const user = dataSource[i];
            const {_uid, _account, _name, _password, _email, _lend_num} = user;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${_uid}</td>
                <td>${_account}</td>
                <td>${_name}</td>
                <td>${_password}</td>
                <td>${_email}</td>
                <td>${_lend_num}</td>
                <td>
                    <button class="edit-button" data-id="${_uid}">编辑</button>
                    <button class="delete-button" data-id="${_uid}">删除</button>
                </td>
            `;
            userTableBody.appendChild(row);
        }
    }

    // 分页
    function renderUserPagination() {
        // 使用当前有效数据源
        const dataSource = filteredUsers.length > 0 ? filteredUsers : users;
        
        renderPagination({
            totalItems: dataSource.length,
            rowsPerPage: userRowsPerPage,
            currentPage: userCurrentPage,
            container: userPageNumbersContainer,
            onPageChange: (page) => {
                userCurrentPage = page;
                renderUserTable();
                renderUserPagination();
            }
        });
    }

    // 添加用户按钮
    addUserButton.addEventListener('click', () => {
        // 重置表单和编辑状态
        addUserModal.querySelector('form').reset();
        addUserModal.removeAttribute('data-edit-id');
        addUserModal.querySelector('h2').textContent = '添加用户';
        addUserModal.style.display = 'block';
    });

    // 关闭弹窗
    userCloseButton.addEventListener('click', () => {
        addUserModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === addUserModal) addUserModal.style.display = 'none';
    });

    // 编辑/删除事件委托
    userTableBody.addEventListener('click', function (e) {
        // 编辑
        if (e.target.classList.contains('edit-button')) {
            const id = Number(e.target.getAttribute('data-id'));
            console.log("用户ID：",id);

            const user = users.find(u => u._uid === id);
            console.log("用户信息：",user);
            if (!user) {
                alert('未找到用户信息');
                return;
            }
            
            // 设置编辑状态
            addUserModal.setAttribute('data-edit-id', id);
            addUserModal.querySelector('h2').textContent = '编辑用户';
            console.log("用户数据：",user);
            // 填充表单 - 确保使用正确的ID
            addUserModal.querySelector('#account').value = user._account;
            addUserModal.querySelector('#name').value = user._name;
            addUserModal.querySelector('#password').value = user._password;
            addUserModal.querySelector('#email').value = user._email;
            addUserModal.querySelector('#borrowedCount').value = user._lend_num;
            
            addUserModal.style.display = 'block';
        }
        
        // 删除
        if (e.target.classList.contains('delete-button')) {
        const id = Number(e.target.getAttribute('data-id'));
        console.log("要删除的用户ID：", id);

        // 确保users是一个数组
        if (!Array.isArray(users)) {
            console.error("用户数据未定义或不是一个数组");
            return; // 提前返回，避免执行后续代码
        }
        console.log("用户数据：", users);
        let user = users.find(u => u._uid === id);
    console.log("要删除的用户信息：", user);

    if (user && confirm('确定要删除该用户吗？')) {
        deleteUser(user);
    }
}

});

    // 新增用户
    async function addUser(userData) {
        try {
            const res = await fetch('/api/page/readers/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '用户添加成功');
                await fetchUsers();
            } else {
                alert(result.message || '添加失败');
            }
        } catch (err) {
            console.error(err);
            alert('添加用户失败');
        }
    }

    // 编辑用户
    async function editUser(id, userData) {
        try {
            // 包含所有必要字段
            const fullData = {
                _uid: id,
                _account: userData._account,
                _name: userData._name,
                _password: userData._password,
                _email: userData._email,
                _lend_num: userData._lend_num
            };
            console.log(fullData);
            console.log("编辑用户前端接口被调用")
            const res = await fetch('/api/page/readers/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullData)
            });
            
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '用户信息更新成功');
                await fetchUsers();
            } else {
                alert(result.message || '更新失败');
            }
        } catch (err) {
            console.error(err);
            alert('编辑用户失败');
        }
    }

    // 删除用户
    async function deleteUser(user) {
        try {
            const res = await fetch('/api/page/readers/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _uid: user._uid })
            });
            console.log("删除用户前端接口被调用")
            console.log(user);
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '用户删除成功');
                await fetchUsers();
            } else if(res.status === 400){
                alert(result.message || '删除失败');
            }
        } catch (err) {
            console.error(err);
            alert('删除用户失败');
        }
    }

    // 提交用户按钮（添加/编辑）
    userSubmitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        
        // 获取表单值 - 确保ID匹配
        const _account = addUserModal.querySelector('#account').value.trim();
        const _name = addUserModal.querySelector('#name').value.trim();
        const _password = addUserModal.querySelector('#password').value.trim();
        const _email = addUserModal.querySelector('#email').value.trim();
        const _lend_num = addUserModal.querySelector('#borrowedCount').value.trim();
        
        // 验证逻辑
        if (!_account || !_name || !_password || !_email || !_lend_num) {
            alert('请填写完整的用户信息！');
            return;
        }
        
        // 密码强度校验
        if (_password.length < 6 || !/[A-Za-z]/.test(_password) || !/[0-9]/.test(_password)) {
            alert('密码需至少6位，且包含字母和数字！');
            return;
        }
        
        // 邮箱格式校验
        const emailReg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailReg.test(_email)) {
            alert('请输入正确的邮箱格式！');
            return;
        }
        
        // 准备用户数据
        const userData = {
            _account,
            _name,
            _password,
            _email,
            _lend_num: Number(_lend_num)
        };
        
        const editId = addUserModal.getAttribute('data-edit-id');
        
        if (editId) {
            await editUser(editId, userData);
        } else {
            await addUser(userData);
        }
        
        addUserModal.style.display = 'none';
    });

    // 本地过滤用户数据
    function getUserFilterData() {
        const typeMap = {
            '_account': '_account',
            '_name': '_name',
            '_email': '_email'
        };
        
        const type = document.getElementById('userSearchType').value;
        const actualField = typeMap[type] || '_account';
        const keyword = document.getElementById('userSearchInput').value.trim().toLowerCase();
        
        if (!keyword) return users;
        
        return users.filter(user => {
            if (!user[actualField]) return false;
            const fieldValue = user[actualField].toString().toLowerCase();
            return fieldValue.includes(keyword);
        });
    }

    // 搜索按钮事件
    document.getElementById('userSearchButton').addEventListener('click', function() {
        userCurrentPage = 1;
        filteredUsers = getUserFilterData();
        
        if (filteredUsers.length === 0) {
            alert('没有找到相关用户');
        }
        
        renderUserTable();
        renderUserPagination();
    });

    // 初始化
    fetchUsers();
}

// ========== 图书分类管理 ==========
function initCategoryModule() {
    // 分类数据
    let categories = [];
    let categoryCurrentPage = 1;
    const categoryRowsPerPage = 5;

    // DOM
    const categoryTableBody = document.querySelector(".category_table tbody");
    const addCategoryButton = document.querySelector('.addCategoryButton');
    const addCategoryModal = document.getElementById('addCategoryModal');
    const categoryCloseButton = addCategoryModal.querySelector('.close-button');
    const categorySubmitButton = addCategoryModal.querySelector('.submit-button');
    const categoryNameInput = document.getElementById('categoryName');
    const categoryPageNumbersContainer = document.querySelector("#booktype_admin .page-numbers");

    // 获取分类数据
    async function fetchCategories() {
        try {
            console.log('正在获取分类数据...');
            const res = await fetch('/api/page/categories',{
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await res.json();
            if (res.status === 200) {
                console.log('分类数据获取成功');
                categories = result.data || [];
                console.log("图书分类如下所示：",categories);
                renderCategoryTable();
                renderCategoryPagination();
                // 暴露给全局，供图书管理使用
                window.categories = categories;
            } else {
                categories = [];
                renderCategoryTable();
                renderCategoryPagination();
                alert(result.message || '没有找到分类');
            }
        } catch (err) {
            alert('无法获取分类数据，请稍后再试');
            console.error(err);
        }
    }

    // 渲染分类表格
    function renderCategoryTable() {
        categoryTableBody.innerHTML = "";
        
        // 空数据状态
        if (categories.length === 0) {
            categoryTableBody.innerHTML = `<tr><td colspan="3">暂无分类数据</td></tr>`;
            return;
        }
        
        // 确保页码在有效范围内
        const totalPages = Math.ceil(categories.length / categoryRowsPerPage);
        categoryCurrentPage = Math.max(1, Math.min(categoryCurrentPage, totalPages));
        
        // 计算当前页的起始和结束索引
        const start = (categoryCurrentPage - 1) * categoryRowsPerPage;
        const end = Math.min(start + categoryRowsPerPage, categories.length);
        
        for (let i = start; i < end; i++) {
            const cat = categories[i];
            const {_tid, _type_name} = cat;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${_tid}</td>
                <td>${_type_name}</td>
                <td>
                    <button class="edit-category" data-index="${i}">修改</button>
                    <button class="delete-category" data-index="${i}">删除</button>
                </td>
            `;
            categoryTableBody.appendChild(row);
        }
    }

    // 图书分类分页
    function renderCategoryPagination() {
        renderPagination({
            totalItems: categories.length,
            rowsPerPage: categoryRowsPerPage,
            currentPage: categoryCurrentPage,
            container: categoryPageNumbersContainer,
            onPageChange: (page) => {
                categoryCurrentPage = page;
                renderCategoryTable();
                renderCategoryPagination();
            }
        });
    }

    // 新增分类
    async function addCategory(categoryData) {
        try {
             const res = await fetch('/api/page/category/add', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(categoryData)
             });
             const result = await res.json();
             if (res.status === 200) {
                 alert(result.message || '添加分类成功');
                 await fetchCategories();
             } else {
                 alert(result.message || '添加失败');
             }
         } catch (err) {
             alert('添加分类失败');
         }
    }

    // 编辑分类
    async function editCategory(id, categoryData) {
        try {
            const bodyData = { _tid: id, ...categoryData };
            const res = await fetch('/api/page/category/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '修改图书分类成功');
                await fetchCategories();
            } else {
                alert(result.message || '编辑失败');
            }
        } catch (err) {
            alert('编辑分类失败');
        }
    }

    // 删除分类
    async function deleteCategory(id) {
        try {
            const cat = categories.find(c => c._tid == id);
            if (!cat) {
                alert('未找到该分类');
                return;
            }
            const res = await fetch('/api/page/category/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _tid: id, _type_name: cat._type_name })
            });
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '删除成功');
                await fetchCategories();
            } else {
                alert(result.message || '删除失败');
            }
        } catch (err) {
            alert('删除分类失败');
        }
    }

    // 显示添加分类弹窗
    addCategoryButton.addEventListener('click', () => {
        showModal(addCategoryModal, { title: '添加分类', resetForm: true });
        document.getElementById('categoryId').value = '';
        addCategoryModal.removeAttribute('data-edit-index');
    });

    // 分类表格操作按钮（事件委托）
    categoryTableBody.addEventListener('click', function (e) {
        // 修改
        if (e.target.classList.contains('edit-category')) {
            const idx = Number(e.target.getAttribute('data-index'));
            const cat = categories[idx];
            showModal(addCategoryModal, { title: '修改分类', resetForm: true });
            document.getElementById('categoryId').value = cat._tid;
            categoryNameInput.value = cat._type_name;
            addCategoryModal.setAttribute('data-edit-index', idx);
        }
        // 删除
        if (e.target.classList.contains('delete-category')) {
            const idx = Number(e.target.getAttribute('data-index'));
            if (confirm('确定要删除该分类吗？')) {
                const id = categories[idx]._tid;
                deleteCategory(id);
            }
        }
    });

    // 关闭弹窗
    categoryCloseButton.addEventListener('click', () => {
        hideModal(addCategoryModal);
    });
    window.addEventListener('click', (event) => {
        if (event.target === addCategoryModal) hideModal(addCategoryModal);
    });

    // 提交按钮
    categorySubmitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const _type_name = categoryNameInput.value.trim();
        const _tid = document.getElementById('categoryId').value.trim();
        if (!_type_name || !_tid) {
            alert('请输入分类名称和分类ID！');
            return;
        }
        const editIndex = addCategoryModal.getAttribute('data-edit-index');
        if (editIndex !== null && editIndex !== undefined && editIndex !== "") {
            const id = categories[Number(editIndex)]._tid;
            await editCategory(id, { _type_name, _tid });
            addCategoryModal.removeAttribute('data-edit-index');
        } else {
            await addCategory({ _type_name, _tid });
        }
        hideModal(addCategoryModal);
        categoryNameInput.value = '';
        document.getElementById('categoryId').value = '';
    });

    // 初始化
    fetchCategories();
}

// ========== 图书借阅归还管理 ==========
function initLendModule() {
    // 借阅数据
    let lends = [];
    let lendCurrentPage = 1;
    const lendRowsPerPage = 8;

    // DOM 元素
    const lendTableBody = document.querySelector(".lend_table tbody");
    const lendPageNumbersContainer = document.querySelector("#booklend_message .page-numbers");

    // 获取借阅数据
    async function fetchLends() {
        try {
            const res = await fetch('/api/page/history');
            const result = await res.json();
            if (res.status === 200) {
                lends = result.data || [];
                renderLendTable();
                renderLendPagination();
            } else {
                lends = [];
                renderLendTable();
                renderLendPagination();
                alert(result.message || '没有找到历史记录');
            }
        } catch (err) {
            alert('无法获取历史记录，请稍后再试');
            console.error(err);
        }
    }

    // 渲染借阅表格
    function renderLendTable() {
        lendTableBody.innerHTML = "";
        
        // 空数据状态
        if (lends.length === 0) {
            lendTableBody.innerHTML = `<tr><td colspan="7">暂无借阅记录</td></tr>`;
            return;
        }
        
        // 确保页码在有效范围内
        const totalPages = Math.ceil(lends.length / lendRowsPerPage);
        lendCurrentPage = Math.max(1, Math.min(lendCurrentPage, totalPages));
        
        // 计算当前页的起始和结束索引
        const start = (lendCurrentPage - 1) * lendRowsPerPage;
        const end = Math.min(start + lendRowsPerPage, lends.length);
        
        for (let i = start; i < end; i++) {
            const lend = lends[i];
            const { _hid, _book_name, _name, _begin_time, _end_date, status } = lend;
            const formattedBeginTime = new Date(_begin_time).toISOString().split('T')[0];
            const formattedEndDate = new Date(_end_date).toISOString().split('T')[0];
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${_hid}</td>
                <td>${_book_name}</td>
                <td>${_name}</td>
                <td>${formattedBeginTime}</td>
                <td>${formattedEndDate}</td>
                <td>${status}</td>
                <td>
                    <button class="lend-action delay-btn" data-id="${_hid}">延期</button>
                </td>
            `;
            lendTableBody.appendChild(row);
        }
    }

    // 分页
    function renderLendPagination() {
        renderPagination({
            totalItems: lends.length,
            rowsPerPage: lendRowsPerPage,
            currentPage: lendCurrentPage,
            container: lendPageNumbersContainer,
            onPageChange: (page) => {
                lendCurrentPage = page;
                renderLendTable();
                renderLendPagination();
            }
        });
    }

    // 延期
    async function delayLend(hid, newReturnDate) {
        try {
            const res = await fetch('/api/page/books/borrow/delay', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _hid: hid, newReturnDate })
            });
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '图书续借成功。');
                const index = lends.findIndex(l => l._hid == hid);
                if (index !== -1) {
                    lends[index]._end_date = newReturnDate;
                    renderLendTable();
                }
            } else {
                alert(result.message || '延期失败');
            }
        } catch (err) {
            alert('延期失败');
        }
    }

    //延期操作按钮
    lendTableBody.addEventListener('click', function (e) {
        if (e.target.classList.contains('delay-btn')) {
            const id = e.target.getAttribute('data-id');
            const lend = lends.find(l => l._hid == id);
            if (!lend) {
                alert('未找到该借阅记录');
                return;
            }
            let endDate = new Date(lend._end_date);
            endDate.setMonth(endDate.getMonth() + 1);
            const yyyy = endDate.getFullYear();
            const mm = String(endDate.getMonth() + 1).padStart(2, '0');
            const dd = String(endDate.getDate()).padStart(2, '0');
            const newReturnDate = `${yyyy}-${mm}-${dd}`;
            delayLend(id, newReturnDate);
        }
    });

    // 初始化
    fetchLends();
}

// ========== 公告管理 ==========
function initAnnouncementModule() {
    // 公告数据
    let announcements = [];
    let announcementCurrentPage = 1;
    const announcementRowsPerPage = 5;

    // DOM 元素
    const announcementTableBody = document.querySelector(".announcement_table tbody");
    const announcementPageNumbersContainer = document.querySelector("#announcement_admin .page-numbers");
    const addAnnouncementButton = document.querySelector('.addAnnouncementButton');
    const addAnnouncementModal = document.getElementById('addAnnouncementModal');
    const announcementCloseButton = addAnnouncementModal.querySelector('.close-button');
    const announcementSubmitButton = addAnnouncementModal.querySelector('.submit-button');

    // 获取公告数据
    async function fetchAnnouncements() {
        try {
            const res = await fetch('/api/page/announcement');
            const result = await res.json();
            if (res.status === 200) {
                announcements = result.data || [];
                renderAnnouncementTable();
                renderAnnouncementPagination();
            } else {
                announcements = [];
                renderAnnouncementTable();
                renderAnnouncementPagination();
                alert(result.message || '没有找到公告');
            }
        } catch (err) {
            alert('无法获取公告数据，请稍后再试');
            console.error(err);
        }
    }

    // 渲染公告表格
    function renderAnnouncementTable() {
        announcementTableBody.innerHTML = "";
        
        // 空数据状态
        if (announcements.length === 0) {
            announcementTableBody.innerHTML = `<tr><td colspan="4">暂无公告数据</td></tr>`;
            return;
        }
        
        // 确保页码在有效范围内
        const totalPages = Math.ceil(announcements.length / announcementRowsPerPage);
        announcementCurrentPage = Math.max(1, Math.min(announcementCurrentPage, totalPages));
        
        // 计算当前页的起始和结束索引
        const start = (announcementCurrentPage - 1) * announcementRowsPerPage;
        const end = Math.min(start + announcementRowsPerPage, announcements.length);
        
        for (let i = start; i < end; i++) {
            const announcement = announcements[i];
            const { _aid, _title, _content } = announcement;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${_aid}</td>
                <td>${_title}</td>
                <td>${_content}</td>
                <td>
                    <button class="edit-announcement" data-index="${i}">编辑</button>
                    <button class="delete-announcement" data-index="${i}">删除</button>
                </td>
            `;
            announcementTableBody.appendChild(row);
        }
    }

    // 分页
    function renderAnnouncementPagination() {
        renderPagination({
            totalItems: announcements.length,
            rowsPerPage: announcementRowsPerPage,
            currentPage: announcementCurrentPage,
            container: announcementPageNumbersContainer,
            onPageChange: (page) => {
                announcementCurrentPage = page;
                renderAnnouncementTable();
                renderAnnouncementPagination();
            }
        });
    }

    // 添加公告按钮
    addAnnouncementButton.addEventListener('click', () => {
        showModal(addAnnouncementModal, { title: '添加公告', resetForm: true });
    });

    // 关闭弹窗
    announcementCloseButton.addEventListener('click', () => {
        hideModal(addAnnouncementModal);
    });
    window.addEventListener('click', (event) => {
        if (event.target === addAnnouncementModal) hideModal(addAnnouncementModal);
    });

    // 编辑/删除事件委托
    announcementTableBody.addEventListener('click', function (e) {
        // 编辑
        if (e.target.classList.contains('edit-announcement')) {
            const idx = Number(e.target.getAttribute('data-index'));
            const announcement = announcements[idx];
            showModal(addAnnouncementModal, { title: '修改公告', resetForm: true, dataEditId: announcement._aid });
            addAnnouncementModal.querySelector('#announcementTitle').value = announcement._title;
            addAnnouncementModal.querySelector('#announcementContent').value = announcement._content;
        }
        // 删除
        if (e.target.classList.contains('delete-announcement')) {
            const idx = Number(e.target.getAttribute('data-index'));
            const id = announcements[idx]._aid;
            if (confirm('确定要删除该公告吗？')) {
                deleteAnnouncement(id);
            }
        }
    });

    // 新增公告
    async function addAnnouncement(data) {
        try {
            const res = await fetch('/api/page/announcement/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '添加公告成功');
                await fetchAnnouncements();
            } else {
                alert(result.message || '添加失败');
            }
        } catch (err) {
            alert('添加公告失败');
        }
    }

    // 编辑公告
    async function editAnnouncement(id, data) {
        try {
            const bodyData = { ...data, _aid: id };
            const res = await fetch('/api/page/announcement/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '公告编辑成功');
                await fetchAnnouncements();
            } else {
                alert(result.message || '修改失败');
            }
        } catch (err) {
            alert('修改公告失败');
        }
    }

    // 删除公告
    async function deleteAnnouncement(id) {
        try {
            const res = await fetch('/api/page/announcement/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _aid: id })
            });
            const result = await res.json();
            if (res.status === 200) {
                alert(result.message || '成功删除公告');
                await fetchAnnouncements();
            } else {
                alert(result.message || '删除失败');
            }
        } catch (err) {
            alert('删除公告失败');
        }
    }

    // 提交公告（添加/编辑）
    announcementSubmitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const _title = addAnnouncementModal.querySelector('#announcementTitle').value.trim();
        const _content = addAnnouncementModal.querySelector('#announcementContent').value.trim();

        if (!_title || !_content) {
            alert('请填写完整的公告信息！');
            return;
        }

        const editId = addAnnouncementModal.getAttribute('data-edit-id');
        if (editId) {
            await editAnnouncement(editId, { _title, _content });
            addAnnouncementModal.removeAttribute('data-edit-id');
        } else {
            await addAnnouncement({ _title, _content });
        }
        hideModal(addAnnouncementModal);
    });

    // 初始化
    fetchAnnouncements();
}

// 显示弹窗函数
function showModal(modal, options = {}) {
    modal.style.display = 'block';
    if (options.title) {
        modal.querySelector('h2').textContent = options.title;
    }
    if (options.resetForm) {
        modal.querySelector('form').reset();
    }
    if (options.dataEditId) {
        modal.setAttribute('data-edit-id', options.dataEditId);
    }
}

// 隐藏弹窗函数
function hideModal(modal) {
    modal.style.display = 'none';
}

//=========退出登录==========
document.querySelector('#sidebar .nav a[data-target="logout"]').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('rememberedUser');
        window.location.href = '../htmls/enter.html';
    } else {
        $('.page').hide();
        $('#home').show();
    }
});