## 后端数据库表一览

>#### 提醒:
> VSCode中查看markdown文件的预览的快捷键：`ctrl + shift + v`
  VSCode中导出markdown文件为pdf的快捷键：`ctrl + shift + p`，然后输入`Markdown PDF`，选择`Markdown PDF: Export`，然后选择导出路径。
  VSCode中在预览中查找特定词汇的快捷键：`ctrl + f`

---

### 用户表(t_user)

| 字段名 | 类型 | 描述 |
| :----: | :----: | :----: |
| _uid | int4 | 用户ID |
| _utype | varchar(7) | 用户类型 |
| _account | varchar(10) | 用户账号 |
| _name | varchar(50) | 用户名 |
| _password | varchar(127) | 用户密码 |
| _email | varchar(20) | 用户邮箱 |
| _max_num | int4 | 最大借书数量 |
| lend_num | int4 | 当前借书数量 |
| _access | int4 | 用户能否登录系统 |

### 书籍表(t_book)

| 字段名 | 类型 | 描述 |
| :----: | :----: | :----: |
| _bid | int4 | 书籍ID |
| _book_name | varchar(741) | 书籍名 |
| _ISBN | varchar(20) | ISBN码 |
| _num | int4 | 馆藏书籍数量 |
| _author | varchar(50) | 作者 |
| _press | varchar(30) | 出版社 |
| _tid | int4 | 图书类型ID |
| _times | int4 | 借阅次数 |

### 图书类型表(t_type)

| 字段名 | 类型 | 描述 |
| :----: | :----: | :----: |
| _tid | int4 | 图书类型ID |
| _type_name | varchar(8) | 图书类型名 |

### 借阅记录表(t_history)

| 字段名 | 类型 | 描述 |
| :----: | :----: | :----: |
| _hid | int4 | 借阅记录ID |
| _uid | int4 | 用户ID |
| _bid | int4 | 书籍ID 
| _begin_time | date | 借阅时间 |
| _end_date | date | 归还时间 |
| _status | int4 | 借阅状态 |

### 预约记录表(t_order)

| 字段名 | 类型 | 描述 |
| :----: | :----: | :----: |
| _oid | int4 | 预约记录ID |
| _uid | int4 | 用户ID |
| _bid | int4 | 书籍ID |
| _otime | date | 预约时间 |

