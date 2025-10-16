const { Pool } = require('pg')
require('dotenv').config()

// 创建连接池（推荐使用连接池而不是单连接）
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// 连接测试
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.log('捕获到错误:', err);
    // 捕获连接或查询错误，并打印错误信息
    console.error('连接或查询出错:', err.stack);
    // 根据错误类型和内容进行处理
    if (err.code === 'ECONNREFUSED') {
      console.error('数据库连接被拒绝，请检查数据库服务器是否运行。');
    } else if (err.code === 'ENOTFOUND') {
      console.error('无法找到数据库服务器，请检查主机地址是否正确。');
    } else {
      console.error('发生未知错误:', err.message);
    }
  } else {
    console.log('成功连接到 PostgreSQL 数据库<=')
  }
})

module.exports = pool