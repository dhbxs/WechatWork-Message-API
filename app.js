// 0. 导入 Express
const express = require('express');

const crypto = require('@wecom/crypto');


// 1. 调用 express() 得到一个 app
//    类似于 http.createServer()
const app = express();

// 2. 设置请求对应的处理函数
//    当客户端以 GET 方法请求 /api 的时候就会调用第二个参数：请求处理函数
app.get('/api', (req, res) => {

    const TOKEN = process.env.TOKEN;
    const EncodingAESKey = process.env.ENCODING_AES_KEY;

    console.log("url: " + req.url);

    let echostr = req.query.echostr;
    if (echostr != undefined) { //来自企业微信验证接收消息的验证回调url
        console.log("")
        let timestamp = decodeURIComponent(req.query.timestamp);
        let nonce = decodeURIComponent(req.query.nonce);
        let msg_signature = decodeURIComponent(req.query.msg_signature);
        echostr = decodeURIComponent(echostr);
        console.log("msg_signature: " + msg_signature);
        console.log("timestamp: " + timestamp);
        console.log("nonce: " + nonce);
        console.log("echostr: " + echostr);
        console.log("开始验证签名");

        let newSign = crypto.getSignature(TOKEN, timestamp, nonce, echostr);
        console.log("newSign: " + newSign);
        if (newSign == msg_signature) {
            console.log("签名验证通过，正在解密信息");
            let rand_msg = crypto.decrypt(EncodingAESKey, echostr);
            console.log("rand_msg:");
            console.log(rand_msg);
            let message = rand_msg["message"];
            res.send(message);
        }
        else {
            res.json({
                "url": req.url,
                "error": "签名验证不通过，请检查企业微信配置中Token和EncodingAESKey与后台配置是否一致",
            });
        }
    }
    else {
        res.json({
            "url": req.url,
            "error": "请求无参数"
        });
    }
})

app.get('/', (req, res) => {
    res.json({
        "url": req.url,
        "message": "部署成功"
    });
})

const PORT = process.env.PORT || 3000;
// 3. 监听端口号，启动 Web 服务
app.listen(PORT, () => console.log(`app listening on port ${PORT}!`));