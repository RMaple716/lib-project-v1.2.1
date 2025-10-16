document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const passwordError = document.getElementById('passwordError');
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    const remember = document.getElementById('remember');
    const loginAccount = document.getElementById('loginAccount');

    // 表单切换
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerForm.classList.add('active');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.remove('active');
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        loginForm.classList.add('active');
    });

    // 密码一致性验证
    confirmPassword.addEventListener('input', () => {
        if (registerPassword.value !== confirmPassword.value) {
            passwordError.textContent = '两次输入的密码不一致';
        } else {
            passwordError.textContent = '';
        }
    });

    // 密码强度检测
    registerPassword.addEventListener('input', () => {
        const password = registerPassword.value;
        let strength = 0;

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        strengthBars.forEach((bar, index) => {
            bar.style.backgroundColor = index < strength ?
                ['#ff4757', '#ffa502', '#2ed573'][Math.min(strength - 1, 2)] : '#eee';
        });

        strengthText.textContent = ['弱', '中', '强', '很强'][Math.min(strength - 1, 3)];
    });

    // 记住我功能
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
        const { account, userType } = JSON.parse(savedUser);
        loginAccount.value = account;
        document.getElementById('loginUserType').value = userType;
        remember.checked = true;
    }

    // 登录表单提交（连接后端）
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (remember.checked) {
            const user = {
                account: loginAccount.value,
                userType: document.getElementById('loginUserType').value
            };
            localStorage.setItem('rememberedUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('rememberedUser');
        }

        try {
            const res=await fetch('/api/auth/login', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    account: document.getElementById('loginAccount').value,
                    password: document.getElementById('loginPassword').value,
                    role: document.getElementById('loginUserType').value
                })
            });
            const data = await res.json();
            console.log("登录数据：",data);
            if (res.status === 200) {
                alert('登录成功！');
                if (data.role === 'admin') {
                    window.location.href = './adminpage.html';
                }else if (data.role === 'reader') {
                    window.location.href = './search.html';
                }
            } else if (res.status === 400){
                if(res.code===4002)
                    alert(res.message||'用户不存在');
                else if(res.code===4003)
                    alert(res.message||'密码错误');
                else 
                    alert(res.message||'登录失败');
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
    });


    // 注册表单提交（连接后端，注册后自动切换到登录并填充账号）
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (registerPassword.value !== confirmPassword.value) {
            passwordError.textContent = '请确认密码一致';
            return;
        }
        try {
              const res=await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify
                ({
                    account: document.getElementById('registerAccount').value,
                    name: document.getElementById('registerName').value,
                    email: document.getElementById('registerEmail').value,
                    userType: document.getElementById('registerUserType').value,
                    password: registerPassword.value
                })
            });
            
            const data = await res.json();
            console.log("状态码：",res.status);
            if (res.status===200) {
                console.log("切换至登录表单");
                registerForm.classList.remove('active'); // 移除注册表单的活动状态
                registerForm.classList.add('hidden');// 隐藏注册表单
                loginForm.classList.remove('hidden');// 显示登录表单
                loginForm.classList.add('active');//添加激活状态
                loginAccount.value = document.getElementById('registerAccount').value;// 填充登录账号
                document.getElementById('loginUserType').value = document.getElementById('registerUserType').value;// 填充用户类型
                document.getElementById('loginPassword').value = '';// 清空登录密码输入框
                alert(res.message || '注册成功。');
            } else {
                if(res.status===400&&res.code==4001)
                    alert('用户已存在，请重新注册。');
                else
                    alert(data.message||'注册失败');
            }
        } catch (err) {
            console.log("错误类型：", err.name);
            console.log("错误消息：", err.message);
            if (err.stack) {
                console.log("错误堆栈：", err.stack);
            }
            alert('网络错误，请稍后再试');
        }
    });

    // 邮箱格式验证
    document.getElementById('registerEmail').addEventListener('input', (e) => {
        const email = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            e.target.setCustomValidity('请输入有效的邮箱地址');
        } else {
            e.target.setCustomValidity('');
        }
    });
});