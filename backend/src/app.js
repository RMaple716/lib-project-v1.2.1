const winston = require('winston');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config()

const pool = require('./config/db') // 新增数据库引用

staticpath = path.join(__dirname, '../../frontend/public')
const session = require('express-session');
const express = require('express');
const app = express();
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// 中间件配置
app.use(bodyParser.json())
// 允许所有来源访问（仅限开发环境）
app.use(cors());
app.use(express.static(staticpath)) // 托管前端静态资源
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 基础路由测试
app.get('/', (req, res) => {
  res.send('Library System Backend Running')
})
const hostname = process.env.HOSTNAME || 'localhost'
const PORT = process.env.PORT || 3000
app.listen(PORT, hostname, () => {
  console.log(`Server running on port ${PORT}`)
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// 请求日志中间件
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request for '${req.url}'`);
  next();
});

// 添加认证路由
const authRouter = require('./routes/auth')
app.use('/api/auth', authRouter)

const pageRouter= require('./routes/page')
app.use('/api/page', pageRouter)



