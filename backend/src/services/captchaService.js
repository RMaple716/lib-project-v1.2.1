const svgCaptcha = require('svg-captcha');

/**
 * 验证码服务
 */
class CaptchaService {
  /**
   * 生成SVG验证码
   * @param {Object} options - 验证码配置选项
   * @returns {Object} - 包含验证码文本和SVG图片的对象
   */
  generateCaptcha(options = {}) {
    const defaultOptions = {
      size: 4, // 验证码长度
      ignoreChars: '0o1il', // 排除容易混淆的字符
      noise: 2, // 干扰线条数量
      color: true, // 开启颜色
      width: 120, // 宽度
      height: 40, // 高度
      fontSize: 50, // 字体大小
      charPreset: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789' // 字符集
    };

    // 合并默认选项和用户选项
    const mergedOptions = { ...defaultOptions, ...options };

    // 生成验证码
    const captcha = svgCaptcha.create(mergedOptions);

    return {
      text: captcha.text, // 验证码文本
      svg: captcha.data // SVG图片内容
    };
  }
}

module.exports = new CaptchaService();
