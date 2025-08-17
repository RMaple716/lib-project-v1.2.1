const express = require('express')
const app = express();
app.use(express.json());
const bcrypt = require('bcryptjs')
const pool = require('../config/db')
const router = express.Router()
const session = require('express-session');
const captchaService = require('../services/captchaService');
const emailService = require('../services/emailService');

router.use(session
  ({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

//2.用户注册
router.post('/register', async (req, res) => {
  console.log('注册接口被调用');
  const{account, name, email, userType, password } = req.body;

  // 密码复杂度校验
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) 
      {
        console.log('密码复杂度校验未通过，请重试');
        return res.status(400).json
        ({ 
            code:4004,
            message: '密码需至少8位，包含字母、数字和特殊符号。' 
        })
      }
  try 
  {
    console.log('开始注册');
    // 先检查用户名是否存在（可选，数据库约束是最终保障）
    const {rows: existResult} = await pool.query(
      'SELECT * FROM t_user WHERE _name = $1 OR _account=$2',
      [name,account]
    )
    
    if (existResult.length > 0) 
    {
        console.log('用户已存在');
        return res.status(400).json
        ({ 
            code:4001,
            message: '用户已存在'
        })
    }
      // 插入新用户
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("准备插入新用户");
    const { rows:newuser } = await pool.query
    (
      `INSERT INTO t_user (_name, _password, _account, _email, _role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING _name, _password, _account, _email, _role`,
      [name, hashedPassword,account,email,userType]
    )
     return res.status(200).json
     ({ 
        message: '注册成功，请登录。',
        role: newuser[0]._role
      })
  } 
  catch (err) 
  {
      console.error('注册错误:', err)
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      })
  }
})


// 1.用户登录
router.put('/login', async (req, res) => {
  console.log("登录接口被调用。");
  const useraccount  = req.body.account
  const userpassword = req.body.password
  const userrole = req.body.role
  //console.log(useraccount,userpassword,userrole);

  try {
    const { rows:userResult } = await pool.query
    (
      'SELECT * FROM t_user WHERE _account = $1 AND _role = $2',
      [useraccount, userrole]
    )
  if(userResult.length === 0)
  {
      console.log("用户不存在");
      return res.status(400).json({
        code:4002,
        message: '用户不存在,请检查账号输入是否正确。'
      })
  }
   // console.log(userResult.rows[0]);

  if (userResult.length == 0 || !await bcrypt.compare(userpassword, userResult[0]._password)) {
        return res.status(400).json({
            code:4003,
            message: '密码输入有误，请重试。'
          })
    }else{
      const user = userResult[0]
      req.session._uid=user._uid;
      return res.status(200).json({ 
          code:2001,
          message: '登录成功', 
          role: user._role
      })
  }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ 
      message: '服务器错误，请稍后重试' 
    })
  }
})


// 30.生成验证码
router.get('/captcha', (req, res) => {
  try {
    const captcha = captchaService.generateCaptcha();

    // 将验证码文本存储在会话中，用于后续验证
    req.session.captcha = captcha.text;

    // 设置HTTP头部，防止缓存
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // 发送SVG图片
    res.status(200).send(captcha.svg);
  } catch (error) {
    console.error('生成验证码错误:', error);
    res.status(500).json({
      message: '生成验证码失败，请重试'
    });
  }
});

// 31.修改并重置密码
router.post('/reset-password', async (req, res) => {
  const { account, newPassword, captchaInput, userType } = req.body;

  // 验证码校验
  if (!req.session.captcha || req.session.captcha.toLowerCase() !== captchaInput.toLowerCase()) {
    return res.status(400).json({
      code: 4005,
      message: '验证码错误，请重新输入'
    });
  }

  // 清除会话中的验证码，防止重复使用
  delete req.session.captcha;

  // 密码复杂度校验
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      code: 4004,
      message: '新密码需至少8位，包含字母、数字和特殊符号。'
    });
  }

  try {
    // 查询用户
    const { rows: userResult } = await pool.query(
      'SELECT * FROM t_user WHERE _account = $1 AND _role = $2',
      [account, userType]
    );

    if (userResult.length === 0) {
      return res.status(400).json({
        code: 4002,
        message: '用户不存在'
      });
    }

    const user = userResult[0];

    // 哈希新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await pool.query(
      'UPDATE t_user SET _password = $1 WHERE _uid = $2',
      [hashedNewPassword, user._uid]
    );

    // 发送密码重置通知邮件
    const changeTime = new Date();
    // 确保用户有邮箱并发送通知
    if (user._email) {
      emailService.sendPasswordChangeNotification(user._email, user._name, changeTime)
        .then(result => {
          if (result.success) {
            console.log(`成功发送密码重置通知邮件到用户邮箱: ${user._email}`);
          } else {
            console.error(`发送到 ${user._email} 的邮件失败:`, result.error);
          }
        })
        .catch(err => console.error('发送密码重置通知邮件失败:', err));
    } else {
      console.warn(`用户 ${user._account} (${user._name}) 没有关联邮箱，无法发送密码重置通知`);
    }

    return res.status(200).json({
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('密码重置错误:', error);
    res.status(500).json({
      message: '服务器错误，请稍后重试'
    });
  }
});

module.exports = router