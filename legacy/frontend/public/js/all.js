// 通用分页渲染函数
function renderPagination({totalItems, rowsPerPage, currentPage, container, onPageChange}) {
    // 计算总页数，确保至少为1页
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

    // 确保当前页在有效范围内
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    container.innerHTML = '';

    // 当没有数据时显示"无数据"但仍保持1页
    if (totalItems === 0) {
        container.innerHTML = '<span>无数据</span>';
        return;
    }

    // 当只有一页时也显示分页，但只有一个页码按钮
    if (totalPages <= 1) {
        const singlePageBtn = document.createElement('button');
        singlePageBtn.textContent = 1;
        singlePageBtn.classList.add('active');
        container.appendChild(singlePageBtn);
        return;
    }

    // 创建按钮的辅助函数，增强可点击性
    function createPageButton(text, pageNum, isDisabled) {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'button-wrapper';
        buttonWrapper.style.display = 'inline-block';
        buttonWrapper.style.position = 'relative';
        
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.disabled = isDisabled;
        btn.setAttribute('data-page', pageNum); // 存储页码数据
        
        // 防止连续快速点击导致的问题
        let isProcessing = false;
        
        // 为包装器添加点击事件，扩大可点击区域
        buttonWrapper.addEventListener('click', function(e) {
            // 如果按钮被禁用或正在处理点击，则不执行操作
            if (btn.disabled || isProcessing) return;
            
            // 阻止事件冒泡和默认行为
            e.preventDefault();
            e.stopPropagation();
            
            // 设置标志，防止重复点击
            isProcessing = true;
            
            // 添加点击反馈
            btn.style.transform = 'scale(0.98)';
            
            // 确保鼠标指针显示为等待状态
            document.body.style.cursor = 'wait';
            btn.style.cursor = 'wait';
            
            // 调用回调函数
            setTimeout(() => {
                btn.style.transform = '';
                document.body.style.cursor = '';
                btn.style.cursor = '';
                onPageChange(pageNum);
                
                // 重置处理标志
                setTimeout(() => {
                    isProcessing = false;
                }, 200);
            }, 50);
        });
        
        buttonWrapper.appendChild(btn);
        return buttonWrapper;
    }
    
    // 首页
    const firstBtn = createPageButton('首页', 1, currentPage === 1);
    container.appendChild(firstBtn);

    // 上一页
    const prevBtn = createPageButton('上一页', currentPage - 1, currentPage === 1);
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
        const pageBtn = createPageButton(i, i, false);
        // 将活动状态应用到按钮包装器内的实际按钮上
        if (i === currentPage) {
            const button = pageBtn.querySelector('button');
            if (button) button.classList.add('active');
            pageBtn.classList.add('active-wrapper'); // 也给包装器添加一个类，便于样式控制
        }
        container.appendChild(pageBtn);
    }

    // 下一页
    const nextBtn = createPageButton('下一页', currentPage + 1, currentPage === totalPages);
    container.appendChild(nextBtn);

    // 末页
    const lastBtn = createPageButton('末页', totalPages, currentPage === totalPages);
    container.appendChild(lastBtn);
}

// 获取全部图书
async function getBooks() {
    try {
        const res = await fetch('/api/page/books');
        const result = await res.json();
        if (res.status === 200) {
            return result.data || [];
        } else if (res.status === 400) {
            alert(result.message || '没有找到图书');
            return [];
        } else if (res.status === 500) {
            alert(result.message || '服务器错误');
            return [];
        } else {
            alert('获取图书失败');
            return [];
        }
    } catch (err) {
        console.error(err);
        alert('获取图书失败');
        return [];
    }
}

// 用户管理
// async function getCurrentUser() {
//     try {
//     const _suid= req.session._uid;
//        if (!_suid) {
//            throw new Error('用户未登录或会话已过期');
//         }
//          return _suid;
//          } catch (error) {
//          console.error("[用户] 获取失败:", error);
//          throw error;
//      }
// }
async function getCurrentUser() {
     try {
         const res = await fetch('/api/page/currentuser', {
             method: 'GET',
             //credentials: 'include'
         });
         const result = await res.json();
         if (res.status === 200) {
            {
                console.log("获得用户数据：",result);
                return result._uid; // 只返回用户对象
            }
             
         } else if (res.status === 400) {
             alert(result.message || '未登录');
             throw new Error(result.message || '未登录');
         } else if (res.status === 500) {
             alert(result.message || '服务器错误');
             throw new Error(result.message || '服务器错误');
         } else {
             alert('获取用户信息失败');
             throw new Error('获取用户信息失败');
     }
     } catch (error) {
         console.error("[用户] 获取失败:", error);
         alert('获取用户信息失败');
         throw error;
     }
}

// 搜索图书
async function searchBooks(query) {
    try {
        const res = await fetch(`/api/page/search?query=${encodeURIComponent(query)}`, {
            method: 'GET'
        });
        const result = await res.json();
        if (res.status === 200) {
            return result.data || [];
        } else if (res.status === 400) {
            alert(result.message || '没有找到图书');
            return [];
        } else if (res.status === 500) {
            alert(result.message || '服务器错误');
            return [];
        } else {
            alert('搜索图书失败');
            return [];
        }
    } catch (error) {
        console.error("[图书] 搜索失败:", error);
        alert('搜索图书失败');
        return [];
    }
}

// 获取借阅记录
async function getBorrowingRecords() {
    try {
        const res = await fetch('/api/page/r_history', {
            method: 'GET'
        });
        const result = await res.json();
        if (res.status === 200) {
            return result.data || [];
        } else if (res.status === 400) {
            alert(result.message || '没有找到历史记录');
            return [];
        } else if (res.status === 500) {
            alert(result.message || '服务器错误');
            return [];
        } else {
            alert('获取借阅记录失败');
            return [];
        }
    } catch (error) {
        console.error("[借阅] 获取失败:", error);
        alert('获取借阅记录失败');
        return [];
    }
}

// 借阅图书
async function borrowBook(bookId) {
    try {
        const currentUser = await getCurrentUser();
        const count=await fetch('/api/page/books/borrow/count', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const count_result = await count.json();
        if (count_result._lend_num>=12) {
            alert('借阅数量已达到12本，请先归还图书,再进行借阅。');
            return;
        }else{
        const res = await fetch('/api/page/books/borrow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                _bid: bookId,
                _uid: currentUser._uid
            })
        });
        const result = await res.json();
        if (res.status === 200) {
            alert(result.message || '借书成功！');
             if (typeof loadSearchPage === 'function') {
                 loadSearchPage();
             }
            return result;
        } else if (res.status === 400) {
            alert(result.message || '借书失败');
            return null;
        } else if (res.status === 500) {
            alert(result.message || '服务器错误');
            return null;
        } else {
            alert('借书失败');
            return null;
        }

    }
    } catch (error) {
        console.error("[借阅] 借书失败:", error);
        alert('借书失败');
        return null;
    }
}

// 归还图书
async function returnBook(historyId) {
    try {
        console.log("[归还] 归还图书:", historyId);
        const res = await fetch('/api/page/books/return', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _hid: historyId })
        });
        const result = await res.json();
        if (res.status === 200) {
            console.log("success");
            alert(result.message || '还书成功！');
            if (typeof loadReturnPage === 'function') {
                 loadReturnPage();
             }
            return result;
        } else if (res.status === 400) {
            alert(result.message || '还书失败');
            return null;
        } else if (res.status === 500) {
            alert(result.message || '服务器错误');
            return null;
        } else {
            alert('还书失败');
            return null;
        }
    } catch (error) {
        console.error("[借阅] 还书失败:", error);
        alert('还书失败');
        return null;
    }
}

// 续借图书
async function delayBook(historyId) {
    try {
        const res = await fetch('/api/page/books/borrow/delay', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _hid: historyId })
        });
        const result = await res.json();
        if (res.status === 200) {
            alert(result.message || '续借成功！');
            if (typeof loadSearchPage === 'function') {
                 loadReturnPage();
             }
            return result;
        } else if (res.status === 400) {
            alert(result.message || '续借失败');
            return null;
        } else if (res.status === 500) {
            alert(result.message || '服务器错误');
            return null;
        } else {
            alert('续借失败');
            return null;
        }
    } catch (error) {
        console.error("[借阅] 续借失败:", error);
        alert('续借失败');
        return null;
    }
}

// 获取热门图书排行
async function getHotBooks() {
    try {
        const res = await fetch('/api/page/books/rank', {
            method: 'GET'
        });
        const result = await res.json();
        if (res.status === 200) {
            return result.data || [];
        } else if (res.status === 400) {
            alert(result.message || '获取图书排名失败');
            return [];
        } else if (res.status === 500) {
            alert(result.message || '服务器错误');
            return [];
        } else {
            alert('获取热门图书失败');
            return [];
        }
    } catch (error) {
        console.error("[排行] 获取失败:", error);
        alert('获取热门图书失败');
        return [];
    }
}

// 获取最佳读者排行
async function getBestReaders() {
    try {
        const res = await fetch('/api/page/readers/rank', {
            method: 'GET'
        });
        const result = await res.json();
        if (res.status === 200) {
            return result.data || [];
        } else if (res.status === 400) {
            alert(result.message || '获取读者排名失败');
            return [];
        } else if (res.status === 500) {
            alert(result.message || '服务器错误');
            return [];
        } else {
            alert('获取最佳读者失败');
            return [];
        }
    } catch (error) {
        console.error("[排行] 获取失败:", error);
        alert('获取最佳读者失败');
        return [];
    }
}

// 获取公告信息
async function getAnnouncements() {
    try {
        const res = await fetch('/api/page/readers/announcement', {
            method: 'GET'
        });
        const result = await res.json();
        if (res.status === 200) {
            return result.data || [];
        } else {
            alert('获取公告失败');
            return [];
        }
    } catch (error) {
        alert('获取公告失败');
        return [];
    }
}

// 图书查询页面全局变量
let allBooks = [];
let bookCurrentPage = 1;
const bookRowsPerPage = 10;

// 热门图书页面全局变量
let hotBooks = [];
let hotBooksCurrentPage = 1;
const hotBooksRowsPerPage = 10;

// 最佳读者页面全局变量
let bestReaders = [];
let bestReadersCurrentPage = 1;
const bestReadersRowsPerPage = 10;

// 借阅历史页面全局变量
let historyRecords = [];
let historyCurrentPage = 1;
const historyRowsPerPage = 10;

// 借阅信息页面全局变量
let borrowingRecords = [];
let borrowingCurrentPage = 1;
const borrowingRowsPerPage = 10;

// 渲染图书表格（search.html）
async function loadSearchPage() {
    try {
        // 获取图书数据
        allBooks = await getBooks();
        
        renderBookTable();
        renderBookPagination();
        
        // 更新总页数显示
        updateTotalPagesInfo();
    } catch (error) {
        alert('加载图书数据失败: ' + error.message);
    }
}

// 更新总页数信息
function updateTotalPagesInfo() {
    // 确保页数至少为1，不显示0页
    const totalPages = Math.max(1, Math.ceil(allBooks.length / bookRowsPerPage));
    const totalPagesSpan = document.querySelector('.pagination .total-pages');
    if (totalPagesSpan) {
        totalPagesSpan.textContent = `共${totalPages}页，${allBooks.length}条记录`;
    }
}

// 渲染图书表格
function renderBookTable() {
    const tableBody = document.getElementById('book-table').querySelector('tbody');
    tableBody.innerHTML = '';
    
    // 空数据处理
    if (!allBooks.length) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">暂无图书信息</td></tr>';
        return;
    }
    
    // 计算当前页的起始和结束索引
    const start = (bookCurrentPage - 1) * bookRowsPerPage;
    const end = Math.min(start + bookRowsPerPage, allBooks.length);
    
    // 渲染当前页的数据
    for (let i = start; i < end; i++) {
        const book = allBooks[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${book._book_name}</td>
            <td>${book._author}</td>
            <td>${book._type_name}</td>
            <td>${book._press}</td>
            <td>${book._num}</td>
            <td>
                <button onclick="borrowBook(${book._bid})" ${book._num <= 0 ? 'disabled' : ''}>
                    ${book._num <= 0 ? '已借完' : '借阅'}
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// 渲染图书分页控件
function renderBookPagination() {
    const pageNumbersContainer = document.querySelector('.pagination .page-numbers');
    if (!pageNumbersContainer) return;
    
    renderPagination({
        totalItems: allBooks.length,
        rowsPerPage: bookRowsPerPage,
        currentPage: bookCurrentPage,
        container: pageNumbersContainer,
        onPageChange: (page) => {
            bookCurrentPage = page;
            renderBookTable();
            renderBookPagination();
        }
    });
}

// 搜索并渲染图书
async function searchAndRenderBooks() {
    const query = document.getElementById('search-input').value.trim();
    if (query.length === 0) {
        // 如果搜索框为空，则显示所有图书
        loadSearchPage();
        return;
    }

    try {
        // 调用后端搜索API
        allBooks = await searchBooks(query);
        
        // 重置为第一页
        bookCurrentPage = 1;
        
        // 渲染表格和分页
        renderBookTable();
        renderBookPagination();
        updateTotalPagesInfo();
    } catch (error) {
        console.error('搜索图书失败:', error);
        alert('搜索图书失败，请稍后再试');
    }
}

// 渲染借阅信息表格（return.html）
async function loadReturnPage() {
    try {
        const records = await getBorrowingRecords();
        console.log("待渲染的借阅记录：",records);
        const tableBody = document.getElementById('borrowing-table').querySelector('tbody');
        tableBody.innerHTML = '';
        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">暂无借阅记录</td></tr>';
            return;
        }
        records.forEach((record, index) => {
        if(record.status === false){
            const canOperate = record.status !== true;
            const row = document.createElement('tr');
            // 格式化借阅日期和归还日期，只保留日期部分
            const formattedBeginTime = new Date(record._begin_time).toISOString().split('T')[0];
            const formattedEndDate = new Date(record._end_date).toISOString().split('T')[0];
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${record._book_name || '-'}</td>
                <td>${formattedBeginTime}</td>
                <td>${formattedEndDate || '-'}</td>
                <td>
                    ${canOperate ? `<button class="return-btn" onclick="returnBook('${record._hid}')">还书</button>` : '-'}
                </td>
                <td>
                    ${canOperate ? `<button class="delay-btn" onclick="delayBook('${record._hid}')">续借</button>` : '-'}
                </td>
            `;
            tableBody.appendChild(row);
        }  
        });
    } catch (error) {
        alert('加载借阅记录失败: ' + error.message);
    }
}

// 渲染借阅历史表格（history.html）
async function loadHistoryPage() {
    try {
        const records = await getBorrowingRecords();
        const tableBody = document.getElementById('history-table').querySelector('tbody');
        tableBody.innerHTML = '';
        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">暂无借阅记录</td></tr>';
            return;
        }
        records.forEach((record, index) => {
            const row = document.createElement('tr');
            // 格式化借阅日期和归还日期，只保留日期部分
            const formattedBeginTime = new Date(record._begin_time).toISOString().split('T')[0];
            const formattedEndDate = new Date(record._end_date).toISOString().split('T')[0];
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${record._book_name || '-'}</td>
                <td>${formattedBeginTime}</td>
                <td>${formattedEndDate || '-'}</td>
                <td class="${record.status == true ? 'text-success' : 'text-warning'}">
                    ${record.status == true ? '已归还' : '未归还'}
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        alert('加载借阅历史失败: ' + error.message);
    }
}


// 渲染热门图书排行（hot.html）
async function loadHotPage() {
    try {
        const books = await getHotBooks();
        
        const tableBody = document.getElementById('hot-table').querySelector('tbody');
        tableBody.innerHTML = '';
        books.forEach((book, index) => {
            const row = document.createElement('tr');
            if(index==2)console.log("213333:",book);

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${book._times}</td>
                <td>${book._book_name}</td>
                <td>${book._type_name || '未知'}</td>
                <td>${book._author}</td>
                <td>${book._press}</td>
                <td>${book._num}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        alert('加载热门图书排行失败: ' + error.message);
    }
}

// 渲染最佳读者排行（best.html）
async function loadBestPage() {
    try {
        const readers = await getBestReaders();
        const tableBody = document.getElementById('best-table').querySelector('tbody');
        tableBody.innerHTML = '';
        readers.forEach((reader, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${reader._name}</td>
                <td>${reader._uid}</td>
                <td>${reader.borrow_count}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        alert('加载读者排行失败: ' + error.message);
    }
}

// 渲染公告（Aid.html）
async function loadAnnouncements() {
    try {
        const announcements = await getAnnouncements();
        const list = document.getElementById('announcement-list');
        list.innerHTML = '';
        announcements.forEach(announcement => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="announcement-title">${announcement._title}</div>
                <div class="announcement-content">${announcement._content}</div>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        alert('加载公告失败: ' + error.message);
    }
}

// 页面初始化
async function initializePage() {
    try {
        console.log('初始化页面');
        const pageMap = {
            'search.html': loadSearchPage,
            'return.html': optimizedLoadReturnPage, // 使用优化后的借阅信息页面加载函数
            'history.html': loadHistoryPage,
            'hot.html': loadHotPage,
            'best.html': loadBestPage,
            'aid.html': loadAnnouncements
        };
        
        // 获取当前页面名称
        const page = window.location.pathname.split('/').pop().toLowerCase();
        console.log('当前页面:', page);
        
        // 确保DOM完全加载
        if (document.readyState === 'loading') {
            console.log('等待DOM加载完成...');
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // 添加错误处理，如果加载失败不会导致整个页面崩溃
        if (pageMap[page]) {
            console.log('调用页面加载函数:', page);
            await pageMap[page]();
            
            // 确保分页控件初始化
            if (page === 'hot.html' && typeof renderHotBooksPagination === 'function') {
                setTimeout(renderHotBooksPagination, 100);
            } else if (page === 'best.html' && typeof renderBestReadersPagination === 'function') {
                setTimeout(renderBestReadersPagination, 100);
            } else if (page === 'history.html' && typeof renderHistoryPagination === 'function') {
                setTimeout(renderHistoryPagination, 100);
            }
        } else {
            console.log('未找到对应的页面加载函数');
        }
    } catch (error) {
        console.error('页面初始化失败:', error);
        alert('页面初始化失败: ' + error.message);
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    initializePage().catch(error => {
        alert('系统初始化失败: ' + error.message);
    });
});

// 全局函数导出
window.borrowBook = borrowBook;
window.returnBook = returnBook;
window.delayBook = delayBook;
window.searchBooks = searchBooks;
window.searchAndRenderBooks = searchAndRenderBooks;

// 以下是新增的分页相关函数

// 更新热门图书总页数信息
function updateHotBooksTotalPagesInfo() {
    // 确保页数至少为1，不显示0页
    const totalPages = Math.max(1, Math.ceil(hotBooks.length / hotBooksRowsPerPage));
    const totalPagesSpan = document.querySelector('.pagination .total-pages');
    if (totalPagesSpan) {
        totalPagesSpan.textContent = `共${totalPages}页，${hotBooks.length}条记录`;
    }
}

// 渲染热门图书表格
function renderHotBooksTable() {
    const tableBody = document.getElementById('hot-table')?.querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // 空数据处理
    if (!hotBooks || hotBooks.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">暂无热门图书数据</td></tr>';
        return;
    }
    
    // 计算当前页的起始和结束索引
    const start = (hotBooksCurrentPage - 1) * hotBooksRowsPerPage;
    const end = Math.min(start + hotBooksRowsPerPage, hotBooks.length);
    
    // 渲染当前页的数据
    for (let i = start; i < end; i++) {
        const book = hotBooks[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${book._times}</td>
            <td>${book._book_name}</td>
            <td>${book._type_name || '未知'}</td>
            <td>${book._author}</td>
            <td>${book._press}</td>
            <td>${book._num}</td>
        `;
        tableBody.appendChild(row);
    }
}

// 渲染热门图书分页控件
function renderHotBooksPagination() {
    // 确保我们只找当前页面的分页容器，避免干扰其他页面
    const paginationElement = document.getElementById('hot-table')?.closest('main')?.querySelector('.pagination');
    if (!paginationElement) return;
    
    const pageNumbersContainer = paginationElement.querySelector('.page-numbers');
    if (!pageNumbersContainer) return;
    
    // 更新总页数显示
    const totalPagesSpan = paginationElement.querySelector('.total-pages');
    if (totalPagesSpan) {
        const totalPages = Math.ceil(hotBooks.length / hotBooksRowsPerPage) || 1;
        totalPagesSpan.textContent = `共${totalPages}页，${hotBooks.length}条记录`;
    }
    
    renderPagination({
        totalItems: hotBooks.length,
        rowsPerPage: hotBooksRowsPerPage,
        currentPage: hotBooksCurrentPage,
        container: pageNumbersContainer,
        onPageChange: (page) => {
            console.log('热门图书页面切换到第', page, '页');
            hotBooksCurrentPage = page;
            renderHotBooksTable();
            // 确保分页控件反映当前页面状态
            renderHotBooksPagination();
        }
    });
}

// 更新最佳读者总页数信息
function updateBestReadersTotalPagesInfo() {
    // 确保页数至少为1，不显示0页
    const totalPages = Math.max(1, Math.ceil(bestReaders.length / bestReadersRowsPerPage));
    const totalPagesSpan = document.querySelector('.pagination .total-pages');
    if (totalPagesSpan) {
        totalPagesSpan.textContent = `共${totalPages}页，${bestReaders.length}条记录`;
    }
}

// 渲染最佳读者表格
function renderBestReadersTable() {
    const tableBody = document.getElementById('best-table')?.querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // 空数据处理
    if (!bestReaders || bestReaders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">暂无读者排行数据</td></tr>';
        return;
    }
    
    // 计算当前页的起始和结束索引
    const start = (bestReadersCurrentPage - 1) * bestReadersRowsPerPage;
    const end = Math.min(start + bestReadersRowsPerPage, bestReaders.length);
    
    // 渲染当前页的数据
    for (let i = start; i < end; i++) {
        const reader = bestReaders[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${reader._name}</td>
            <td>${reader._uid}</td>
            <td>${reader.borrow_count}</td>
        `;
        tableBody.appendChild(row);
    }
}

// 渲染最佳读者分页控件
function renderBestReadersPagination() {
    // 确保我们只找当前页面的分页容器，避免干扰其他页面
    const paginationElement = document.getElementById('best-table')?.closest('main')?.querySelector('.pagination');
    if (!paginationElement) return;
    
    const pageNumbersContainer = paginationElement.querySelector('.page-numbers');
    if (!pageNumbersContainer) return;
    
    // 更新总页数显示
    const totalPagesSpan = paginationElement.querySelector('.total-pages');
    if (totalPagesSpan) {
        const totalPages = Math.ceil(bestReaders.length / bestReadersRowsPerPage) || 1;
        totalPagesSpan.textContent = `共${totalPages}页，${bestReaders.length}条记录`;
    }
    
    renderPagination({
        totalItems: bestReaders.length,
        rowsPerPage: bestReadersRowsPerPage,
        currentPage: bestReadersCurrentPage,
        container: pageNumbersContainer,
        onPageChange: (page) => {
            console.log('最佳读者页面切换到第', page, '页');
            bestReadersCurrentPage = page;
            renderBestReadersTable();
            // 确保分页控件反映当前页面状态
            renderBestReadersPagination();
        }
    });
}

// 更新借阅历史总页数信息
function updateHistoryTotalPagesInfo() {
    // 确保页数至少为1，不显示0页
    const totalPages = Math.max(1, Math.ceil(historyRecords.length / historyRowsPerPage));
    const totalPagesSpan = document.querySelector('.pagination .total-pages');
    if (totalPagesSpan) {
        totalPagesSpan.textContent = `共${totalPages}页，${historyRecords.length}条记录`;
    }
}

// 渲染借阅历史表格
function renderHistoryTable() {
    const tableBody = document.getElementById('history-table')?.querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // 空数据处理
    if (!historyRecords || historyRecords.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">暂无借阅历史记录</td></tr>';
        return;
    }
    
    // 计算当前页的起始和结束索引
    const start = (historyCurrentPage - 1) * historyRowsPerPage;
    const end = Math.min(start + historyRowsPerPage, historyRecords.length);
    
    // 渲染当前页的数据
    for (let i = start; i < end; i++) {
        const record = historyRecords[i];
        const row = document.createElement('tr');
        // 格式化借阅日期和归还日期，只保留日期部分
        const formattedBeginTime = new Date(record._begin_time).toISOString().split('T')[0];
        const formattedEndDate = new Date(record._end_date).toISOString().split('T')[0];
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${record._book_name || '-'}</td>
            <td>${formattedBeginTime}</td>
            <td>${formattedEndDate || '-'}</td>
            <td class="${record.status == true ? 'text-success' : 'text-warning'}">
                ${record.status == true ? '已归还' : '未归还'}
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// 渲染借阅历史分页控件
function renderHistoryPagination() {
    // 确保我们只找当前页面的分页容器，避免干扰其他页面
    const paginationElement = document.getElementById('history-table')?.closest('main')?.querySelector('.pagination');
    if (!paginationElement) return;
    
    const pageNumbersContainer = paginationElement.querySelector('.page-numbers');
    if (!pageNumbersContainer) return;
    
    // 更新总页数显示
    const totalPagesSpan = paginationElement.querySelector('.total-pages');
    if (totalPagesSpan) {
        const totalPages = Math.ceil(historyRecords.length / historyRowsPerPage) || 1;
        totalPagesSpan.textContent = `共${totalPages}页，${historyRecords.length}条记录`;
    }
    
    renderPagination({
        totalItems: historyRecords.length,
        rowsPerPage: historyRowsPerPage,
        currentPage: historyCurrentPage,
        container: pageNumbersContainer,
        onPageChange: (page) => {
            console.log('借阅历史页面切换到第', page, '页');
            historyCurrentPage = page;
            renderHistoryTable();
            // 确保分页控件反映当前页面状态
            renderHistoryPagination();
        }
    });
}

// 覆盖原始加载函数，添加分页功能
async function loadHotPage() {
    try {
        console.log('加载热门图书页面');
        // 重置全局状态
        hotBooksCurrentPage = 1;
        hotBooks = [];
        
        // 清空表格，显示加载中
        const tableBody = document.getElementById('hot-table')?.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">加载中...</td></tr>';
        }
        
        // 获取数据
        hotBooks = await getHotBooks();
        console.log(`获取到${hotBooks.length}条热门图书数据`);
        
        // 渲染表格和分页
        renderHotBooksTable();
        renderHotBooksPagination();
    } catch (error) {
        console.error('加载热门图书排行失败:', error);
        alert('加载热门图书排行失败: ' + error.message);
        
        // 显示错误信息
        const tableBody = document.getElementById('hot-table')?.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">加载失败: ${error.message}</td></tr>`;
        }
    }
}

async function loadBestPage() {
    try {
        console.log('加载最佳读者页面');
        // 重置全局状态
        bestReadersCurrentPage = 1;
        bestReaders = [];
        
        // 清空表格，显示加载中
        const tableBody = document.getElementById('best-table')?.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">加载中...</td></tr>';
        }
        
        // 获取数据
        bestReaders = await getBestReaders();
        console.log(`获取到${bestReaders.length}条最佳读者数据`);
        
        // 渲染表格和分页
        renderBestReadersTable();
        renderBestReadersPagination();
    } catch (error) {
        console.error('加载读者排行失败:', error);
        alert('加载读者排行失败: ' + error.message);
        
        // 显示错误信息
        const tableBody = document.getElementById('best-table')?.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center">加载失败: ${error.message}</td></tr>`;
        }
    }
}

async function loadHistoryPage() {
    try {
        console.log('加载借阅历史页面');
        // 重置全局状态
        historyCurrentPage = 1;
        historyRecords = [];
        
        // 清空表格，显示加载中
        const tableBody = document.getElementById('history-table')?.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">加载中...</td></tr>';
        }
        
        // 获取数据
        historyRecords = await getBorrowingRecords();
        console.log(`获取到${historyRecords.length}条借阅历史数据`);
        
        // 渲染表格和分页
        renderHistoryTable();
        renderHistoryPagination();
    } catch (error) {
        console.error('加载借阅历史失败:', error);
        alert('加载借阅历史失败: ' + error.message);
        
        // 显示错误信息
        const tableBody = document.getElementById('history-table')?.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">加载失败: ${error.message}</td></tr>`;
        }
    }
}

// 渲染借阅信息表格
function renderBorrowingTable() {
    const tableBody = document.getElementById('borrowing-table')?.querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // 空数据处理
    if (!borrowingRecords || borrowingRecords.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">暂无借阅记录</td></tr>';
        return;
    }
    
    // 计算当前页的起始和结束索引
    const start = (borrowingCurrentPage - 1) * borrowingRowsPerPage;
    const end = Math.min(start + borrowingRowsPerPage, borrowingRecords.length);
    
    // 渲染当前页的数据
    for (let i = start; i < end; i++) {
        const record = borrowingRecords[i];
        const canOperate = record.status !== true;
        const row = document.createElement('tr');
        // 格式化借阅日期和归还日期，只保留日期部分
        const formattedBeginTime = new Date(record._begin_time).toISOString().split('T')[0];
        const formattedEndDate = new Date(record._end_date).toISOString().split('T')[0];
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${record._book_name || '-'}</td>
            <td>${formattedBeginTime}</td>
            <td>${formattedEndDate || '-'}</td>
            <td>
                ${canOperate ? `<button class="return-btn" onclick="returnBook('${record._hid}')">还书</button>` : '-'}
            </td>
            <td>
                ${canOperate ? `<button class="delay-btn" onclick="delayBook('${record._hid}')">续借</button>` : '-'}
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// 渲染借阅信息分页控件
function renderBorrowingPagination() {
    // 确保我们只找当前页面的分页容器，避免干扰其他页面
    const paginationElement = document.getElementById('borrowing-table')?.closest('main')?.querySelector('.pagination');
    if (!paginationElement) return;
    
    const pageNumbersContainer = paginationElement.querySelector('.page-numbers');
    if (!pageNumbersContainer) return;
    
    // 更新总页数显示
    const totalPagesSpan = paginationElement.querySelector('.total-pages');
    if (totalPagesSpan) {
        // 确保页数至少为1，不显示0页
        const totalPages = Math.max(1, Math.ceil(borrowingRecords.length / borrowingRowsPerPage));
        totalPagesSpan.textContent = `共${totalPages}页，${borrowingRecords.length}条记录`;
    }
    
    renderPagination({
        totalItems: borrowingRecords.length,
        rowsPerPage: borrowingRowsPerPage,
        currentPage: borrowingCurrentPage,
        container: pageNumbersContainer,
        onPageChange: (page) => {
            console.log('借阅信息页面切换到第', page, '页');
            borrowingCurrentPage = page;
            renderBorrowingTable();
            // 确保分页控件反映当前页面状态
            renderBorrowingPagination();
        }
    });
}

// 优化后的借阅信息页面加载函数
async function optimizedLoadReturnPage() {
    try {
        console.log('加载借阅信息页面');
        // 重置全局状态
        borrowingCurrentPage = 1;
        borrowingRecords = [];
        
        // 清空表格，显示加载中
        const tableBody = document.getElementById('borrowing-table')?.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">加载中...</td></tr>';
        }
        
        // 获取数据
        borrowingRecords = await getBorrowingRecords();
        // 筛选未归还的记录
        borrowingRecords = borrowingRecords.filter(record => record.status === false);
        console.log(`获取到${borrowingRecords.length}条借阅信息数据`);
        
        // 渲染表格和分页
        renderBorrowingTable();
        renderBorrowingPagination();
    } catch (error) {
        console.error('加载借阅信息失败:', error);
        alert('加载借阅信息失败: ' + error.message);
        
        // 显示错误信息
        const tableBody = document.getElementById('borrowing-table')?.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center">加载失败: ${error.message}</td></tr>`;
        }
    }
}

// 搜索并渲染图书
async function searchAndRenderBooks() {
    const input = document.getElementById('search-input').value.trim();
    if (!input) {
        alert('请输入图书名称或作者');
        return;
    }
    try {
        const books = await searchBooks(input);
        const tableBody = document.getElementById('book-table').querySelector('tbody');
        tableBody.innerHTML = '';
        if (!books.length) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">暂无图书信息</td></tr>';
            return;
        }
        books.forEach((book, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${book._book_name}</td>
                <td>${book._author}</td>
                <td>${book._type_name}</td>
                <td>${book._press}</td>
                <td>${book._num}</td>
                <td>
                    <button onclick="borrowBook(${book._bid})" ${book._num <= 0 ? 'disabled' : ''}>
                        ${book._num <= 0 ? '已借完' : '借阅'}
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        alert('搜索图书失败: ' + error.message);
    }
}