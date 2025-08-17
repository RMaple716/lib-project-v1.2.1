
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 获取当前登录用户的ID
        const userId = await getCurrentUser();
        console.log("当前用户ID:", userId);

        if (!userId) {
            showNotification('请先登录', 'error');
            setTimeout(() => {
                window.location.href = 'enter.html';
            }, 2000);
            return;
        }

        // 加载用户数据
        await loadUserProfile(userId);

        // 获取借阅历史统计
        await loadBorrowHistory(userId);

        // 设置编辑按钮事件
        setupEditButtonListeners();

    } catch (error) {
        console.error('加载个人主页失败:', error);
        showNotification('加载个人信息失败，请重试', 'error');
    }
});

// 加载用户个人信息
async function loadUserProfile(userId) {
    try {
        const response = await fetch(`/api/page/user/profile/${userId}`);
        const result = await response.json();

        if (response.status !== 200) {
            throw new Error(result.message || '获取用户信息失败');
        }

        const userData = result.data;

        // 设置头像首字母
        const avatarInitial = document.getElementById('avatar-initial');
        avatarInitial.textContent = userData._name.charAt(0).toUpperCase();

        // 设置个人资料表单
        document.getElementById('profile-name').textContent = userData._name;
        document.getElementById('account').value = userData._account;
        document.getElementById('name').value = userData._name;
        document.getElementById('email').value = userData._email || '';

        // 设置最大借阅数量
        document.getElementById('books-max').textContent = userData._max_num || 12;

        // 注意：当前借阅数量会在loadBorrowHistory函数中更准确地计算和更新

    } catch (error) {
        console.error('加载用户资料失败:', error);
        showNotification('加载用户资料失败: ' + error.message, 'error');
    }
}

// 加载借阅历史统计
async function loadBorrowHistory(userId) {
    try {
        // 获取所有借阅历史
        const historyResponse = await fetch('/api/page/r_history');
        const historyResult = await historyResponse.json();

        if (historyResponse.status !== 200) {
            throw new Error(historyResult.message || '获取借阅历史失败');
        }

        const historyData = historyResult.data;

        // 计算历史借阅总数
        document.getElementById('borrow-history-count').textContent = historyData.length;

        // 计算当前未归还的图书数量（状态为0表示未归还）
        const currentBorrowCount = historyData.filter(item => item.status === false).length;

        // 更新当前借阅数量显示
        const borrowedElement = document.getElementById('books-borrowed');
        if (borrowedElement) {
            borrowedElement.textContent = currentBorrowCount;
        }

    } catch (error) {
        console.error('加载借阅历史失败:', error);
        document.getElementById('borrow-history-count').textContent = '?';
    }
}

// 设置编辑按钮的事件监听器
function setupEditButtonListeners() {
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');
    const form = document.getElementById('profile-form');

    // 原始数据备份
    let originalData = {};

    // 编辑按钮点击事件
    editButton.addEventListener('click', function() {
        // 备份当前表单数据
        originalData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value
        };

        // 启用可编辑字段
        document.getElementById('name').disabled = false;
        document.getElementById('email').disabled = false;

        // 显示保存和取消按钮，隐藏编辑按钮
        editButton.classList.add('hidden');
        saveButton.classList.remove('hidden');
        cancelButton.classList.remove('hidden');
    });

    // 取消按钮点击事件
    cancelButton.addEventListener('click', function() {
        // 恢复原始数据
        document.getElementById('name').value = originalData.name;
        document.getElementById('email').value = originalData.email;

        // 禁用编辑
        document.getElementById('name').disabled = true;
        document.getElementById('email').disabled = true;

        // 显示编辑按钮，隐藏保存和取消按钮
        editButton.classList.remove('hidden');
        saveButton.classList.add('hidden');
        cancelButton.classList.add('hidden');
    });

    // 保存按钮点击事件
    saveButton.addEventListener('click', async function() {
        try {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const account = document.getElementById('account').value;

            // 验证邮箱格式
            if (email && !isValidEmail(email)) {
                showNotification('请输入有效的邮箱地址', 'error');
                return;
            }

            // 获取用户ID
            const userId = await getCurrentUser();

            // 发送更新请求
            const response = await fetch('/api/page/user/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    _uid: userId,
                    _account: account,
                    _name: name,
                    _email: email
                })
            });

            const result = await response.json();

            if (response.status !== 200) {
                throw new Error(result.message || '更新资料失败');
            }

            // 更新成功
            showNotification('个人信息更新成功', 'success');

            // 更新UI
            document.getElementById('profile-name').textContent = name;
            document.getElementById('avatar-initial').textContent = name.charAt(0).toUpperCase();

            // 禁用编辑
            document.getElementById('name').disabled = true;
            document.getElementById('email').disabled = true;

            // 显示编辑按钮，隐藏保存和取消按钮
            editButton.classList.remove('hidden');
            saveButton.classList.add('hidden');
            cancelButton.classList.add('hidden');

        } catch (error) {
            console.error('更新个人信息失败:', error);
            showNotification('更新失败: ' + error.message, 'error');
        }
    });
}

// 显示通知
function showNotification(message, type) {
    const notificationElement = document.getElementById('notification');
    notificationElement.textContent = message;
    notificationElement.className = `notification ${type}`;
    notificationElement.classList.remove('hidden');

    // 5秒后自动隐藏通知
    setTimeout(() => {
        notificationElement.classList.add('hidden');
    }, 5000);
}

// 验证邮箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
