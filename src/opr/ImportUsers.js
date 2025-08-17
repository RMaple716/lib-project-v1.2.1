const { Client } = require('pg');
const XLSX = require('xlsx');
const crypto = require('crypto');

// 数据库连接配置
const dbConfig = {
  user: 'test',
  host: '192.168.72.151',
  database: 'library',
  password: 'Test@123',
  port: 5432,
};

// Excel 文件路径
const excelFilePath = './用户数据.xlsx';

// 加密密码函数
function encryptPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function importUsers() {
  const client = new Client(dbConfig);
  
  try {
    // 连接到数据库
    await client.connect();
    console.log('成功连接到数据库');

    // 读取Excel文件
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 将Excel数据转换为JSON
    const users = XLSX.utils.sheet_to_json(worksheet);
    
    // 统计信息
    let totalUsers = 0;
    let importedUsers = 0;
    let skippedUsers = 0;
    let updatedUsers = 0;
    
    // 遍历每一行数据
    for (const user of users) {
      totalUsers++;
      
      // 跳过管理员账号（如果需要）
      if (user['用户角色'] === 'admin') {
        console.log(`跳过管理员账号: ${user['用户账号']}`);
        skippedUsers++;
        continue;
      }
      
      // 准备插入数据
      const userData = {
        _account: user['用户账号'],
        _name: user['姓名'],
        _password: encryptPassword(user['用户密码']),
        _max_num: user['最多借阅量'] || 12, // 默认12
        _lend_num: user['已借阅量'] || 0,   // 默认0
        _email: user['用户邮箱'],
        _role: user['用户角色'] || 'reader' // 默认reader
      };
      
      // 检查必填字段
      if (!userData._account || !userData._name || !userData._password) {
        console.log(`跳过无效用户数据: ${JSON.stringify(userData)}`);
        skippedUsers++;
        continue;
      }
      
      try {
        // 先检查用户是否已存在
        const checkQuery = 'SELECT _uid FROM t_user WHERE _account = $1';
        const checkResult = await client.query(checkQuery, [userData._account]);
        const HashedPassword = encryptPassword(userData._password);
        if (checkResult.rows.length > 0) {
          // 用户已存在，更新信息
          const updateQuery = `
            UPDATE t_user SET
              _name = $1,
              _password = $2,
              _max_num = $3,
              _lend_num = $4,
              _email = $5,
              _role = $6
            WHERE _account = $7
          `;
          
          const updateValues = [
            userData._name,
            HashedPassword,
            userData._max_num,
            userData._lend_num,
            userData._email,
            userData._role,
            userData._account
          ];
          
          await client.query(updateQuery, updateValues);
          console.log(`更新用户信息: ${userData._account}`);
          updatedUsers++;
        } else {
          // 用户不存在，插入新记录
          const insertQuery = `
            INSERT INTO t_user (
              _account, _name, _password, _max_num, _lend_num, _email, _role
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          
          const insertValues = [
            userData._account,
            userData._name,
            HashedPassword,
            userData._max_num,
            userData._lend_num,
            userData._email,
            userData._role
          ];
          
          await client.query(insertQuery, insertValues);
          console.log(`成功导入用户: ${userData._account}`);
          importedUsers++;
        }
      } catch (err) {
        console.error(`处理用户 ${userData._account} 时出错:`, err.message);
        skippedUsers++;
      }
    }
    
    console.log('\n导入完成:');
    console.log(`总用户数: ${totalUsers}`);
    console.log(`新增用户: ${importedUsers}`);
    console.log(`更新用户: ${updatedUsers}`);
    console.log(`跳过/失败: ${skippedUsers}`);
    
  } catch (err) {
    console.error('导入过程中出错:', err);
  } finally {
    // 关闭数据库连接
    await client.end();
    console.log('数据库连接已关闭');
  }
}

// 执行导入
importUsers();