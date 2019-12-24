const express = require('express');
var svgCaptcha = require('svg-captcha');
const router = express.Router();








router.get('/getCaptcha', async (req, res, next)=>{
    console.log(11111)
    var captcha = svgCaptcha.create({  
        // 翻转  
        inverse: false,  
        // 字体大小  
        fontSize: 36,  
        // 噪声线条数  
        noise: 2,  
        // 宽度  
        width: 80,  
        // 高度  
        height: 30,  
      });  
      // 保存到session,忽略大小写  
      req.session = captcha.text.toLowerCase(); 
      //保存到cookie 方便前端调用验证
      res.cookie('captcha', req.session); 
      res.setHeader('Content-Type', 'image/svg+xml');
      res.write(String(captcha.data));
      res.status(200);
      res.end();
});

exports.captchaRouter = router;