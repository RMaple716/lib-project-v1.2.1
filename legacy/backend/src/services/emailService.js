const nodemailer = require('nodemailer');

/**
 * 邮件服务类
 */
class EmailService {
  constructor() {
    // 创建邮件传输器
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.qq.com',
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_SECURE || 'true',
      auth: {
        user: process.env.SMTP_USER || 'your-email@example.com',
        pass: process.env.SMTP_PASS || 'your-password'
      }
    });
  }

  /**
   * 发送密码重置通知邮件
   * @param {string} to - 收件人邮箱
   * @param {string} username - 用户名
   * @param {Date} changeTime - 修改时间
   * @returns {Promise} - 发送结果
   */
  async sendPasswordChangeNotification(to, username, changeTime) {
    const formattedTime = new Date(changeTime).toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // 邮件内容
    const mailOptions = {
      from: `"图书管理系统" <${process.env.SMTP_USER || 'noreply@libsystem.com'}>`,
      to: to,
      subject: '密码重置通知',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">密码重置通知</h2>
          <p style="color: #555; font-size: 16px;">尊敬的 <strong>${username}</strong>：</p>
          <p style="color: #555; font-size: 16px;">您的账户密码已在 <strong>${formattedTime}</strong> 成功修改。</p>
          <p style="color: #555; font-size: 16px;">如果这不是您本人的操作，请立即联系管理员或重新修改您的密码。</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #777; font-size: 14px; margin: 0;">此邮件为系统自动发送，请勿直接回复。</p>
          </div>
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 20px;">图书管理系统团队：Untitled</p>
        </div>
      `
    };

    try {
      // 发送邮件
      const result = await this.transporter.sendMail(mailOptions);
      console.log('密码重置通知邮件已发送:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('发送密码重置通知邮件失败:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
