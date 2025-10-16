const { pool } = require('../config/db')
async function ConnectandConfirm()
  {
    try {
        console.log('尝试连接到 PostgreSQL 数据库');
        // 连接到 PostgreSQL 数据库
        const client=await pool.connect();
        console.log('连接成功');
      } 
      catch (err) 
      {
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
      } 
  };
async function display_time() {
  try 
  {
    // 设置时区为北京时间
    const client=await pool.query('SET TIME ZONE \'Asia/Shanghai\'');
    console.log('执行查询: SELECT NOW() AS current_time');
    // 示例查询，获取当前数据库时间
    const res = await pool.query('SELECT TO_CHAR(NOW() AT TIME ZONE \'Asia/Shanghai\', \'YY-MM-DD HH24:MI:SS\') AS current_time');
    //强制输出抓取到的时间，不允许其进行转换，防止其出错。
    console.log('查询结果:', res.rows[0].current_time);
  } 
  finally 
  {
    console.log('时间显示执行完毕');
    await pool.release();
  }
}

module.exports = {pool,ConnectandConfirm, display_time};