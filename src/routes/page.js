const express = require('express')
const path=require('path')
const dbPath=path.join(__dirname,'../config/db.js')
const router = express.Router()
const pool = require(dbPath)
const bcrypt = require('bcryptjs')
const session = require('express-session');

const pager=express.Router()
pager.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// 3.获取图书信息
router.get('/books', async (req, res) => {
  console.log('获取图书接口被调用');
  try {
    console.log('尝试获取图书列表');
    const { rows: booklist } = await pool.query
    (
      `SELECT * 
      FROM t_book,t_type
      WHERE t_book._tid=t_type._tid
      ORDER BY _bid ASC`
    );
    console.log('获取图书列表完毕');
    //console.table("rows",booklist);
  
    if(booklist.length === 0){
      return res.status(400).json({
        message: '没有找到图书'
      })
    }else if(booklist.length > 0){
        return res.status(200).json({ data:booklist });
    }
    else
    {
      return res.status(500).json({
        message: '服务器错误'
      });
    }
  } catch (err) {
    console.error(err);
  }
});

//7.读取图书种类信息
router.get('/categories', async (req, res) => {
  try {
    console.log('查询图书分类接口被调用');
    const { rows:catlist } = await pool.query('SELECT * FROM t_type');
    if(catlist.length === 0){
    return res.status(400).json({
      message: '没有找到分类'
    })
    }else{
      //console.log('返回图书种类列表');
        return res.status(200).json({ data:catlist, message: '成功获取分类' });
    }
  }catch (err) {
    console.error(err);
    res.status(500).json({
      message: '服务器错误'
    });
  }
})

//8.管理员获取读者信息
router.get('/readers',async (req, res) => {
  try{
    const { rows:readerlist } = await pool.query(`
      SELECT * 
      FROM t_user 
      WHERE _role='reader' 
      ORDER BY _uid ASC`);
    if(readerlist.length === 0){
      return res.status(400).json({
        message: '没有找到读者信息'
      })
    }
    else{
        console.log('返回读者信息',readerlist);
        return res.status(200).json({ data:readerlist, message: '成功获取读者信息' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: '服务器错误'
    });
  }
})

//20.管理员获取读者借阅信息
router.get('/history',async (req, res) => {
  try{
    const { rows:historylist } = await pool.query(`
      SELECT *
      FROM t_history,t_book,t_user
      WHERE t_history._bid = t_book._bid AND t_user._uid = t_history._uid
      ORDER BY t_history._hid DESC
      `);
    if(typeof historylist === 'undefined'){
      return res.status(400).json({
        message: '没有找到历史记录'
      })
    }
    else{
      //console.log('返回历史记录');
      console.log(historylist);
        return res.status(200).json({ data:historylist, message: '成功获取历史记录' });
    }
  }catch (err) {
    console.error(err);
    res.status(500).json({
      message: '服务器错误'
    });
}
});

//21.读者获取自己的借阅信息
router.get('/r_history',async (req, res) => {
  try{
    // 查询所有借阅历史，包含图书信息和借阅状态
    const { rows:ownlist } = await pool.query(`
      SELECT t_history.*, t_book.* 
      FROM t_history, t_book 
      WHERE t_history._uid = $1 
      AND t_history._bid = t_book._bid
      ORDER BY t_history._begin_time DESC`,
      [req.session._uid]);

    if(typeof ownlist === 'undefined' || ownlist.length === 0){
      return res.status(400).json({
        message: '没有找到历史记录'
      })
    }
    else{
      console.log('返回历史记录');
      // 只在开发时打印记录数，避免打印所有数据
      console.log(`查询到 ${ownlist.length} 条借阅记录`);
      return res.status(200).json({ data:ownlist, message: '成功获取历史记录' });
    }
  }catch (err) {
    console.error(err);
    res.status(500).json({
      message: '服务器错误'
    });
  }
})

//4.搜索指定图书信息
router.get('/search', async (req, res) => {
  //console.log('查询图书接口被调用');
  const q=req.query.query;
  console.log(q);
  try {
      const { rows: booklist } = await pool.query('SELECT * FROM t_book,t_type WHERE t_book._tid = t_type._tid AND (_book_name LIKE $1 OR _author LIKE $1 ) ', ['%' + q + '%']);
      /*if(Array.isArray(booklist))
        console.log('数据类型正确，可以传送。');
      else
        console.log('数据类型错误，禁止传送。');*/
      if(booklist.length == 0){
        return res.status(400).json({
          code:4001,
          message: "没有找到图书"
        })
      }else{
        //console.log("rows:",booklist);
        //console.log('返回查询到的图书列表');
        return res.status(200).json({ message:"搜索图书成功。", data:booklist });
      }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

//9.获取公告信息
router.get('/announcement', async (req, res) => {
  console.log('查询公告接口被调用');
  try {
      const { rows: annlist } = await pool.query('SELECT * FROM t_ann');
      if(typeof (annlist) == 'undefined'){
        return res.status(400).json({
          message: "未找到公告"
        })
      }else{
        console.log("rows:",annlist);
        console.log('返回查询到的公告列表');
        return res.status(200).json({ message:"查询公告成功。", data:annlist });
      }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
  
});

//5.查询读者借阅数量
router.get('/books/borrow/count', async (req, res) => {
  console.log('查询读者借书数量接口被调用');
  const q=req.session._uid;
  //console.log(q);
  try {

      const { rows: bookcount } = await pool.query('SELECT * FROM t_user WHERE _uid = $1', [q]);
      
      if(bookcount.length == 0){
        return res.status(400).json({
          message: '没有找到读者'
        })
      }else{
        console.log("rows:",bookcount);
        //console.log('返回查询到的读者');
        _lend_num = bookcount[0]._lend_num;
        _name=bookcount[0]._name;
        return res.status(200).json({ message:"搜索读者成功。", name:_name,_lend_num:_lend_num });
      }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

//6.读者借阅图书
router.post('/books/borrow', async (req, res) => {
  console.log('借书接口被调用');
  try {
    const _bid=req.body._bid;
    const _uid=req.session._uid;
    const date=new Date();
    const days=30;
    const msperday=24*60*60*1000;
    const day = new Date(); // 获取当前时间
    const time = date.getTime(); // 获取当前时间的毫秒数
    const timezoneOffset = day.getTimezoneOffset() * 60 * 1000; // 获取当前时间与UTC时间的时差（以毫秒为单位）
    const timezoneOffsetBeijing = 8 * 60 * 60 * 1000; // 东八区的时差（以毫秒为单位）
    const newTime = time + timezoneOffset- timezoneOffsetBeijing+24*60*60*1000; // 计算新的时间
    const begin_time = new Date(newTime); // 创建新的Date对象

    //console.log(begin_time); // 输出新的时间

    const begintime=begin_time.getTime();
    const endtime=begintime+days*msperday;
    const enddate=new Date(endtime);
    const { rows: result }=await pool.query('SELECT * FROM t_book WHERE _bid = $1', [_bid]);
    const book=result[0];
    console.log(book);

    if(typeof book == 'undefined'){
      return res.status(400).json({
        message: '没有找到书籍'
      })
    }else{
      const num=book._num;
      if(num == 0){
        return res.status(400).json({
          message: '书籍已被借完'
        })
      }
    }
    const { rows: borrow_history } = await pool.query(
      `INSERT INTO t_history
      (_uid,_bid,_begin_time,_end_date,status) 
      VALUES($1,$2,$3,$4,$5) 
      RETURNING*`,
      [_uid,_bid,begin_time,enddate,0]);

    await pool.query(
      `UPDATE t_user 
       SET _lend_num=_lend_num+1 
       WHERE _uid=$1`,
       [_uid]);

    await pool.query(
      `UPDATE t_book 
      SET _num=_num-1 
      WHERE _bid=$1`,
      [_bid]);

    console.log("rows:",borrow_history);
      return res.status(200).json({ message:"借书成功。", data:borrow_history[0] });
    
}catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
}
})


//19.读者归还图书
router.put('/books/return', async (req, res) => {
  console.log('归还图书接口已被调用');
  try {
    const _hid = req.body._hid;
    //console.log("hid:",_hid);
    const { rows : returnrow }= await pool.query('SELECT * FROM t_history WHERE _hid=$1 ',[_hid]);
    const _uid = returnrow[0]._uid;
    //const _bid = returnrow[0]._bid;
    const date = new Date();
    const time = date.getTime(); // 获取当前时间的毫秒数
    const timezoneOffset = date.getTimezoneOffset() * 60 * 1000; // 获取当前时间与UTC时间的时差（以毫秒为单位）
    const timezoneOffsetBeijing = 8 * 60 * 60 * 1000; // 东八区的时差（以毫秒为单位）
    const newTime = time + timezoneOffset - timezoneOffsetBeijing+ 24*60*60*1000 ; // 计算新的时间
    const end_date = new Date(newTime); // 创建新的Date对象
    //console.log("还书时间：",end_date);
    //const isactive = false;
    const { rows: ReturnRow } = await pool.query('SELECT * FROM t_history WHERE _hid=$1', [_hid]);
    console.log("ReturnRow:",ReturnRow[0]);
    if (ReturnRow.length === 0) {
      return res.status(400).json({
        code: 4001,
        message: '没有找到书籍,请查询图书信息或联系管理员。'
      });
    } else {
      const _bid = ReturnRow[0]._bid;
      const book = ReturnRow[0];
      const deadline = book._end_date;

      const { rows:suc_return } = await pool.query(
        `UPDATE t_history 
        SET status = $1, _end_date = $2 
        WHERE _hid = $3 
        AND status = $4 RETURNING *`, 
        [true, end_date, _hid, false]);

      await pool.query(
        `UPDATE t_book 
        SET _num=_num+1 
        WHERE _bid=$1`, 
        [_bid]);

      await pool.query(
        `UPDATE t_user 
        SET _lend_num = _lend_num-1 
        WHERE _uid = $1`, [_uid]);

      if (deadline < time) {
        return res.status(400).json({
          code: 4002,
          message: "还书成功，本次还书存在超期，请养成及时归还借阅图书的良好习惯。",
          data: suc_return
        });
      } else {
        return res.status(200).json({ 
          message: "还书成功。", 
          data: suc_return 
        });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '服务器错误' });
  }
});


//10.新增图书数据
router.post('/books/add',async (req, res) => {
  console.log('添加图书接口被调用');
  try {
    const { _book_name , _isbn ,_num, _author , _press , _tid } = req.body;// 获取请求体中的参数
    //console.log("添加的图书数据：",req.body);
    if(_num<0){
      return res.status(400).json({ message: '图书数量不能为负数'})
    }else{
        const{ rows:addbook }=await pool.query
        (
          `SELECT * FROM t_book 
          WHERE _book_name=$1 AND _isbn=$2 AND _author=$3 AND _press=$4 `,
          [_book_name,_isbn,_author,_press]
        );
        if(addbook.length>0)
            {
               await pool.query('UPDATE t_book SET _num=_num+$1 WHERE _book_name=$2 AND _isbn=$3 AND _author=$4 AND _press=$5 AND _tid=$6',[_num,_book_name,_isbn,_author,_press,_tid]);
               return res.status(200).json({ message: '图书数量更新成功' })
            }
        else
            {
                await pool.query
                (
                  `INSERT INTO t_book 
                  (_book_name,_isbn,_num,_author,_press,_tid,_times) 
                  VALUES ($1,$2,$3,$4,$5,$6,$7)`
                  ,[_book_name,_isbn,_num,_author,_press,_tid,0]);
                return res.status(200).json({ message: '图书添加成功' })
            }
    }
  }catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
  }
})




//13.编辑图书数据
router.put('/books/edit',async (req, res) => {
  console.log('编辑图书接口被调用');
  try {
    const { _bid,_book_name , _isbn ,_num, _author ,  _press ,_tid} = req.body;// 获取请求体中的参数
    console.log("前端传来的信息：",req.body);
    const { rows: res_book } =await pool.query('SELECT * FROM t_book WHERE _bid=$1',[_bid]);
    //const { rows: res_type } =await pool.query('SELECT * FROM t_type WHERE _tid=$1',[_tid]);
    //console.log(res_book)

    const _times=res_book[0]._times;
    //const type_name=res_type[0]._type_name;
    /*if(typeof _tid== 'undefined'){
      console.log("_tid为空")
    }
    //const _times=rows[0]._times;
    if(typeof _times== 'undefined'){
      console.log("_times为空")
    }*/
    //console.log("更新后类型名:",type_name);
    //console.log("_times:",_times);
    //console.log("图书种类ID:",_tid);
        if (res_book.length > 0) {
          const{ rows: res_update }=await pool.query(
            `UPDATE t_book 
            SET _book_name=$1, _isbn=$2,
             _author=$3, _press=$4, _tid=$5, 
             _times=$6, _num=$7 
             WHERE _bid=$8
             RETURNING *`, 
            [_book_name, _isbn, _author, _press, _tid, _times, _num,_bid]);
            //console.log("_bid:",_bid);
      //console.log(res_update[0]);
      if(typeof res_update =='undefined')
      {
          console.log("result为空")
      }else
      {
        if (res_update.length > 0) {
            return res.status(200).json({ message: '图书信息更新成功' , data: res_update[0]});
        } else {
            return res.status(400).json({ message: '图书信息未找到' });
        }
    }
}
}catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
  }
})

//16.删除图书数据
router.delete('/books/delete',async (req, res) => {
  console.log('删除图书接口被调用');
  try {
    const _bid = req.body._bid;// 获取请求体中的参数
    const{ rows: res_delete }=await pool.query(
      `SELECT * FROM t_book 
      WHERE _bid=$1`,[_bid]
    );
        if(typeof res_delete !='undefined')
            {
              const { rows: res_check }=await pool.query(
                `SELECT * 
                FROM t_history 
                WHERE _bid=$1 `,
                [_bid]);

              if(res_check.length>0)
                return res.status(400).json({ message: '该图书有借阅记录，无法删除' })
              else{
                const { rows: res_del }=await pool.query(
                  `DELETE FROM t_book 
                  WHERE _bid=$1 
                  RETURNING *`,
                  [_bid]
                );
                 return res.status(200).json({ message: '图书信息删除成功' , data:res_del[0] })
              }
            }
          else{
            return res.status(400).json({ message: '未找到图书信息，请稍后重试。' })
          }
}catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误'});
    }
})

//11.新增读者数据
router.post('/readers/add',async (req, res) => {
  console.log('添加读者接口被调用');
  try {
    const { _account ,_name,_password,_role,_email } = req.body;// 获取请求体中的参数
    const{ rows: reader_add }=await pool.query('SELECT * FROM t_user WHERE _account=$1 AND _role=$2',[_account,_role]);
        if(reader_add.length>0){
               return res.status(400).json({ message: '该账号已存在，请重新输入' });
            }
        else
            {
              const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
              if (!passwordRegex.test(_password)) {
              console.log('密码复杂度校验未通过，请重试');
                return res.status(400).json({ 
                  code:4004,
                  message: '密码需至少8位，包含字母、数字和特殊符号其中的两类。' 
                })
              }
              else{
                const hashedPassword = await bcrypt.hash(_password, 10)
                const { rows: r_add }=await pool.query
                 (`INSERT INTO t_user 
                  (_account,_name,_password,_max_num,_lend_num,_role,_email) 
                  VALUES ($1,$2,$3,$4,$5,$6,$7)
                  RETURNING *`,
                  [_account,_name,hashedPassword,12,0,"reader",_email]);
                 // console.log(r_add[0]);
                return res.status(200).json({ message: '读者添加成功' ,data:r_add[0]});
              }   
            }
    }
   catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
  }
})

//编辑读者数据
router.put('/readers/edit',async (req, res) => {
  console.log('读者编辑接口被调用');
  try {
    const {_uid,_account ,_name,_email,} = req.body;// 获取请求体中的参数
    const{ rows: res_find }=await pool.query('SELECT * FROM t_user WHERE _uid=$1 ',[_uid]);
    if(typeof res_find[0]== 'undefined'){
      return res.status(400).json({ message: '读者不存在' });
    }else{
      const { rows: res_update} = await pool.query(
        `UPDATE t_user 
        SET _name=$1,_email=$2 
        WHERE _account=$3 
        RETURNING *`,
        [_name,_email,_account]
      )
      return res.status(200).json({ message: '读者信息更新成功' ,data:res_update[0]});
    }
  }catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
  }
})

//17.删除读者数据
router.delete('/readers/delete',async (req, res) => {
  console.log('读者删除接口被调用');
  try {
    const { _uid } = req.body;// 获取请求体中的参数
    const{ rows: res_find }=await pool.query('SELECT * FROM t_user WHERE _uid=$1 ',[_uid]);
    if(typeof res_find[0]== 'undefined'){
      return res.status(400).json({ message: '读者不存在' });
    }
    else{
      const {rows: findrow}=await pool.query(
        `SELECT * 
        FROM t_history 
        WHERE _uid=$1 `,
        [_uid]);

      //console.log(findrow);
      if(typeof findrow[0] !== 'undefined'){
        return res.status(400).json({ message: '读者有借阅记录，无法删除' });
      }
      else{
        const { rows: res_delete }=await pool.query(`DELETE FROM t_user WHERE _uid=$1 RETURNING *`,[_uid])
        return res.status(200).json({ message: '读者信息删除成功' ,data:res_delete[0]});
      }
    }
  }catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
    }
})

//12.新增公告数据
router.post('/announcement/add',async (req, res) => {
  console.log('公告添加接口被调用');
  try {
    const { _title,_content } = req.body;// 获取请求体中的参数
    if( _title== "" || _content== ""|| typeof _title== 'undefined' || typeof _content== 'undefined'){
      return res.status(400).json({ message: '标题和内容不能为空' });
    }
    const { rows: res_insert }=await pool.query
    (
      `INSERT INTO t_ann(_title,_content) 
      VALUES($1,$2) 
      RETURNING *`,
      [_title,_content]
    )
    return res.status(200).json({ message: '公告添加成功' ,data:res_insert[0]});
}catch (err){
  console.error(err);
  return res.status(500).json({ message: '服务器错误' });
}
})

//15.编辑公告数据
router.put('/announcement/edit',async (req, res) => {
  console.log('公告编辑接口被调用');
  try {
    const { _title,_content,_aid } = req.body;// 获取请求体中的参数
    if( _title== "" || _content== ""|| typeof _title== 'undefined' || typeof _content== 'undefined'){
      return res.status(400).json({ message: '标题和内容不能为空' });
    }
    else if( typeof _aid== 'undefined'){
      return res.status(400).json({ message: '公告id不能为空' });
    }
    const {rows: res_update}=await pool.query(`SELECT * FROM t_ann WHERE _aid=$1`,[_aid])
    if(res_update.length==0){
      return res.status(400).json({ message: '公告不存在,请重试。' });
    }
    else{
      const { rows: res_insert }=await pool.query
      (
        `UPDATE t_ann SET _title=$1,_content=$2 WHERE _aid=$3 
        RETURNING *`,
        [_title,_content,_aid]
      )
      return res.status(200).json({ message: '公告编辑成功' ,data:res_insert[0]});
    }
  }catch (err){
    console.error(err);
    return res.status(500).json({ message: '服务器错误' });
  }
})

//18.删除公告数据
router.delete('/announcement/delete',async (req, res) => {
  console.log('公告删除接口被调用');
  try {
    const { _aid } = req.body;// 获取请求体中的参数
    if( typeof _aid== 'undefined'){
      return res.status(400).json({ message: '公告id不能为空' });
    }
    const { rows: res_update }=await pool.query(
      `SELECT * 
      FROM t_ann 
      WHERE _aid=$1`,[_aid])

    if(res_update.length==0){
      return res.status(400).json({ message: '公告不存在,请重试。' });
    }
    else{
      const {rows: res_delete }=await pool.query(`
        DELETE FROM t_ann 
        WHERE _aid=$1 
        RETURNING *`,[_aid])

      return res.status(200).json({ message: '公告删除成功' ,data:res_delete[0]});
    }
  }catch (err){
    console.error(err);
    return res.status(500).json({ message: '服务器错误' });
  }
})

//22.图书续借
router.put('/books/borrow/delay',async (req, res) => {
  console.log('图书续借接口被调用');
  try {
    const _hid = req.body._hid;// 获取请求体中的参数
    console.log("_hid:",_hid);
    const { rows: res_find } =await pool.query(`
      SELECT * 
      FROM t_history 
      WHERE _hid=$1 
      AND status=0`,[_hid]);

        if(typeof res_find== 'undefined')
              return res.status(400).json({ message: '图书借阅信息未能查找成功或已归还，续借失败' })
          else
            {
              console.log("rows:",res_find[0]);
              const date=res_find[0]._end_date;
              console.log("date:",date);
              const time = date.getTime(); // 获取当前时间的毫秒数
              const timezoneOffset = date.getTimezoneOffset() * 60 * 1000; // 获取当前时间与UTC时间的时差（以毫秒为单位）
              const timezoneOffsetBeijing = 8 * 60 * 60 * 1000; // 东八区的时差（以毫秒为单位）
              const newTime = (time + timezoneOffset- timezoneOffsetBeijing+ 24 * 60 * 60 * 1000)+30*24*60*60*1000; // 计算新的时间(加30天)
              const new_end_date = new Date(newTime); // 创建新的Date对象
              const {rows: res_delay }=await pool.query(
                `UPDATE t_history
                SET _end_date=$1 
                WHERE _hid=$2  
                RETURNING *`,
                [new_end_date,_hid]
              );
               return res.status(200).json({ message: '图书续借成功' , data:res_delay[0] })
            }
        
  } catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
  }
})

//23.图书排名显示
router.get('/books/rank', async (req, res) => {
  console.log("获取图书排名显示接口被调用");
  try {
    const { rows: res_rank }=await pool.query
    (
      `SELECT * FROM t_book,t_type 
      WHERE t_book._tid=t_type._tid 
      ORDER BY _times DESC`
    );
    if(typeof res_rank == 'undefined' || res_rank.length==0){
      return res.status(404).json({ message: '获取图书排名失败' });
    }else{
      return res.status(200).json({ message: '获取图书排名成功' , data:res_rank })
    }
  }catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
  }
})

//24.读者排名显示
router.get('/readers/rank', async (req, res) => {
  console.log("获取读者排名显示接口被调用");
  try {
    const { rows: res_rank }=await pool.query
    (
      `SELECT r._uid AS _uid,
       r._name AS _name,
       COUNT(br._uid) AS borrow_count,
       RANK() OVER (ORDER BY COUNT(br._uid) DESC) AS _rank
       FROM t_user r LEFT JOIN t_history br ON r._uid = br._uid
       WHERE r._role = 'reader'
       GROUP BY r._uid, r._name
       ORDER BY borrow_count DESC;`
    );
    if(typeof res_rank == 'undefined' || res_rank.length==0){
        return res.status(400).json({ message: '获取读者排名失败' });
    }else{
        return res.status(200).json({ message: '获取读者排名成功' , data:res_rank })
    }
  }catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
  }
})

//25.读者端显示公告
router.get('/readers/announcement', async (req, res) => {
  console.log("获取公告显示接口被调用");
  try {
    const { rows: res_find }=await pool.query
    (
      `SELECT * FROM t_ann 
      WHERE _aid=
      (SELECT MAX(_aid) FROM t_ann)`
    );
    if(typeof res_find == 'undefined' || res_find.length==0){
        return res.status(400).json({ message: '获取公告失败' });
    }else{
        return res.status(200).json({ message: '获取公告成功' , data:res_find })
    }
  }catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
  }
});

//27.新增分类信息
router.post('/category/add', async (req, res) => {
  console.log("添加分类接口被调用");
  try {
    const {_tid,_type_name}=req.body;
    if(_tid==null||_type_name==null)
    {
      return res.status(400).json({message:"图书类型和其ID不能为空"})
    }
    const { rows: find }=await pool.query
    (
      `SELECT * FROM t_type WHERE _tid=$1`,[_tid]
    );
    if(find.length>0)
      {
          return res.status(400).json({ message: '分类已存在' }); 
      }
    else if(typeof find == 'undefined'||find.length==0){
      const { rows:res_insert }=await pool.query
      (
        `INSERT INTO t_type (_tid, _type_name) 
        VALUES ($1,$2) 
        RETURNING *`,[_tid,_type_name]
      );
        return res.status(200).json({ message: '添加分类成功' , data:res_insert[0] })
    }else{
        return res.status(500).json({message:"服务器错误"});
    }
    
  }catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' });
    }
});

//28.编辑分类信息
router.put('/category/edit', async (req, res) => {
  console.log("修改分类接口被调用");
  try {
    const {_tid,_type_name}=req.body;
    if(_tid==null)
    {
      return res.status(400).json
      ({message:"图书类型ID出现问题，请联系管理员"})
    }
    const { rows: typeRows } = await pool.query(`SELECT * FROM t_type WHERE _tid=$1`, [_tid]);
    const { rows: findRows } = await pool.query(`SELECT * FROM t_type WHERE _type_name=$1`, [_type_name]);

console.log(findRows[0]);
if (typeRows.length === 0) {
    return res.status(400).json({ message: '分类不存在，请重试' });
}
if (findRows.length !== 0) {
    return res.status(400).json({ message: '分类名已存在，请重新输入' });
} else if (typeRows.length !== 0) {
    const { rows: updateRows } = await pool.query(`UPDATE t_type SET _type_name=$1 WHERE _tid=$2 RETURNING *`, [_type_name, _tid]);
    return res.status(200).json({ message: '修改分类成功', data: updateRows[0] });
} else {
    return res.status(500).json({ message: '服务器错误' });
}
  }catch (err){
      console.error(err);
      res.status(500).json({ message: '服务器错误' })
  }
})

//29.删除分类信息
router.delete('/category/delete', async (req, res) => {
  console.log(req.body);
  const {_tid}=req.body;
  if(_tid==null)
  {
    return res.status(400).json
    ({message:"图书类型ID出现问题，请联系管理员"})
  }
  try {
    const { rows: typeRows } = await pool.query(`SELECT * FROM t_type WHERE _tid=$1`, [_tid]);
    console.log(_tid);
    const { rows: bookRows}=await pool.query(`SELECT * FROM t_book WHERE _tid=$1`,[_tid]);
    if(bookRows.length!=0)
    {
      return res.status(400).json({message:"该分类下存在图书，请先删除图书"})
    }
    if (typeRows.length === 0) {
      return res.status(400).json({ message: '分类不存在，请重试' });
    }
    const { rows: deleteRows } = await pool.query(`DELETE FROM t_type WHERE _tid=$1`, [_tid]);
    return res.status(200).json({ message: '删除分类成功', data: deleteRows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '服务器错误' });
  }
});

//26.获取当前登录用户信息
router.get('/currentuser', async (req, res) => {
  try{
    /*if(typeof req =='undefined' || typeof req.session == 'undefined' || typeof req.session._uid == 'undefined') {
      console.log("未定义的session");
    }*/
      const user = req.session._uid;
  //console.log("duzheID:",user);
  if (user) {
    res.status(200).json({message:"成功获得登陆者信息",_uid:user});
  } else {
    res.status(400).json({ message: '未登录' });
  }

} catch (err) {
  console.error(err);
  res.status(500).json({ message: '服务器错误' });
}
});

// 获取用户个人资料
router.get('/user/profile/:id', async (req, res) => {
  console.log('获取用户个人资料接口被调用');
  try {
    const userId = req.params.id;
    const sessionUserId = req.session._uid;

    // 安全检查：确保只能获取自己的个人资料
    if (sessionUserId != userId) {
      return res.status(403).json({
        message: '权限不足，只能查看自己的个人资料'
      });
    }

    const { rows: userProfile } = await pool.query('SELECT _uid, _account, _name, _email, _max_num, _lend_num, _role FROM t_user WHERE _uid = $1', [userId]);

    if (userProfile.length === 0) {
      return res.status(404).json({
        message: '未找到用户信息'
      });
    }

    return res.status(200).json({
      message: '获取用户资料成功',
      data: userProfile[0]
    });
  } catch (err) {
    console.error('获取用户资料错误:', err);
    return res.status(500).json({
      message: '服务器错误'
    });
  }
});

// 更新用户个人资料
router.put('/user/profile/update', async (req, res) => {
  console.log('更新用户个人资料接口被调用');
  try {
    const { _uid, _account, _name, _email } = req.body;
    const sessionUserId = req.session._uid;

    // 安全检查：确保只能更新自己的个人资料
    if (sessionUserId != _uid) {
      return res.status(403).json({
        message: '权限不足，只能更新自己的个人资料'
      });
    }

    // 验证提交的数据
    if (!_name || !_email) {
      return res.status(400).json({
        message: '姓名和邮箱不能为空'
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(_email)) {
      return res.status(400).json({
        message: '请提供有效的邮箱地址'
      });
    }

    // 更新用户信息
    const { rows: updatedUser } = await pool.query(
      `UPDATE t_user
       SET _name = $1, _email = $2
       WHERE _uid = $3 AND _account = $4
       RETURNING _uid, _name, _email`,
      [_name, _email, _uid, _account]
    );

    if (updatedUser.length === 0) {
      return res.status(404).json({
        message: '未找到用户或账号不匹配'
      });
    }

    return res.status(200).json({
      message: '用户资料更新成功',
      data: updatedUser[0]
    });
  } catch (err) {
    console.error('更新用户资料错误:', err);
    return res.status(500).json({
      message: '服务器错误'
    });
  }
});

module.exports = router;