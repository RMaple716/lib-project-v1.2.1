const { Client } = require('pg');
const xlsx = require('xlsx');
const path = require('path');

// 数据库配置
const dbConfig = {
    user: 'test',
    host: '192.168.72.151',
    database: 'library',
    password: 'Test@123',
    port: 5432,
};

// 标签映射
/*const tagMap = { 
    'T': 1, 'B': 2, 'L': 3, 'K': 4,
    'M': 5, 'P': 6, 'C': 7, 'S': 8 
};*/

async function ensureTableExists(client) {
    try {
        const res = await client.query(`
            SELECT 1 FROM pg_tables 
            WHERE tablename = 't_book' AND schemaname = 'public';
        `);
        if (res.rowCount === 0) {
            await client.query(`
                CREATE TABLE public.t_book (
                    id SERIAL PRIMARY KEY,
                    _book_name VARCHAR(255) NOT NULL,
                    _author VARCHAR(255),
                    _press VARCHAR(255),
                    _isbn VARCHAR(50) UNIQUE NOT NULL,
                    _tid INTEGER,
                    _num INTEGER DEFAULT 0
                )
            `);
            console.log('表 t_book 创建成功');
        }
    } catch (err) {
        console.error('确保表存在时出错:', err);
        throw err;
    }
}

async function importBooks() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('已连接到数据库:', dbConfig.database);

        // 确保表存在
        await ensureTableExists(client);

        // 读取Excel文件
        const excelPath = path.join(__dirname, '初步处理的图书列表.xlsx');
        console.log('正在读取文件:', excelPath);
        
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (!data || data.length === 0) {
            throw new Error('Excel文件数据为空或读取失败');
        }

        for (const row of data) {
            const { 书名, 作者, 出版社, ISBN号, 标签, 馆藏数量 } = row;
            //const tid = 标签 || null;

            const checkQuery = `SELECT 1 FROM public.t_book WHERE _isbn = $1`;
            const exists = await client.query(checkQuery, [ISBN号]);

            if (exists.rowCount === 0) {
                const insertQuery = `
                    INSERT INTO public.t_book (_book_name, _author, _press, _isbn, _tid, _num,_times)
                    VALUES ($1, $2, $3, $4, $5, $6,0)
                `;
                await client.query(insertQuery, [
                    书名, 作者, 出版社, ISBN号, 
                    标签, 馆藏数量 || 0
                ]);
                console.log(`已导入: ${书名}`);
            } else {
                console.log(`已存在，跳过: ${书名}`);
            }
        }
        
        console.log('所有图书导入完成！');
    } catch (err) {
        console.error('导入失败:', err.stack);
    } finally {
        await client.end();
    }
}

// 执行导入
importBooks();