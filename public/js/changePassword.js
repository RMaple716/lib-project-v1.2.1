document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('changePasswordForm');
    const passwordError = document.getElementById('passwordError');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    const captchaImage = document.getElementById('captchaImage');
    const successMessage = document.getElementById('successMessage');

    // 加载验证码
    loadCaptcha();

    // 点击验证码图片刷新
    captchaImage.addEventListener('click', loadCaptcha);

    // 密码一致性验证
    confirmPassword.addEventListener('input', () => {
        if (newPassword.value !== confirmPassword.value) {
            passwordError.textContent = '两次输入的密码不一致';
        } else {
            passwordError.textContent = '';
        }
    });

    // 密码强度检测
    newPassword.addEventListener('input', () => {
        const password = newPassword.value;
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

    // 加载验证码函数
    function loadCaptcha() {
        captchaImage.src = `/api/auth/captcha?t=${new Date().getTime()}`;
    }

    // 表单提交
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 验证两次密码输入是否一致
        if (newPassword.value !== confirmPassword.value) {
            passwordError.textContent = '两次输入的密码不一致';
            return;
        }

        // 验证密码强度
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(newPassword.value)) {
            passwordError.textContent = '密码需至少8位，包含字母、数字和特殊符号';
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    account: document.getElementById('account').value,
                    userType: document.getElementById('userType').value,
                    newPassword: newPassword.value,
                    captchaInput: document.getElementById('captchaInput').value
                })
            });

            const data = await response.json();

            if (response.status === 200) {
                // 密码修改成功
                successMessage.textContent = data.message || '密码重置成功！';
                successMessage.style.display = 'block';

                // 清空表单
                changePasswordForm.reset();

                // 重置密码强度显示
                strengthBars.forEach(bar => {
                    bar.style.backgroundColor = '#eee';
                });
                strengthText.textContent = '';

                // 刷新验证码
                loadCaptcha();

                // 3秒后隐藏成功消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            } else {
                // 处理各种错误情况
                if (response.status === 400) {
                    if (data.code === 4002) {
                        alert(data.message || '用户不存在');
                    } else if (data.code === 4003) {
                        alert(data.message || '当前密码错误');
                    } else if (data.code === 4004) {
                        alert(data.message || '新密码格式不符合要求');
                    } else if (data.code === 4005) {
                        alert(data.message || '验证码错误');
                        // 刷新验证码
                        loadCaptcha();
                    } else {
                        alert(data.message || '密码重置失败');
                    }
                } else {
                    alert(data.message || '服务器错误，请稍后重试');
                }
            }
        } catch (err) {
            console.error('错误:', err);
            alert('网络错误，请稍后再试');
        }
    });
});
