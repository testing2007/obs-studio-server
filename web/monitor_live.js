var api = require('./api/api.js')

var qs = require('querystring');   //引入querystring模块，提取网络请求参数

var macro = require('./common_macro.js')

var http = require('http');
const { truncate } = require('fs');
var port = macro.monitor_port

/*
推流地址组成：(rtmp://域名/直播名称/直播房间号?auth=直播授权码） (直播名称：flv, 直播房间号： roomId, 直播授权码)
const char* RMTP_URL = "rtmp://localhost/flv/roomId?auth=123";    //http-flv推流
推流用户登录直播间 （参数：直播房间号）
    成功返回： rtmp://localhost/flv/roomId + 授权码 =》推流地址 =》obs（进行推流） =》 监听服务器on_publish（推流服务器数据库保存推流记录）
    失败返回：null
拉流用户登录成功：（参数：直播房间号）
    成功返回：
        拉流地址： 例如：（http://localhost:8080/live001?port=1935&app=flv&stream=roomId）
        flv.html 加载拉流地址
    失败返回：null
        flv.html 加载视频失败
//*/

var nums = 0
var isLiving = false

http.createServer(function(req, res) {
    console.log(req.url);

    if(req.method == 'POST') {
        var body = '';
        req.on('data', function(chunk) {
            body += chunk; //请求体参数合并
        })

        req.on('end', function() {
            console.log(body);
            if(req.url == '/on_publish') {
                // 当教师推流时触发，可以用作教师的推流权限验证。
                var arr = body.split('&')
                
                // TODO 校验处理 
                // 获取参数数组 [参数里面的name字段就是推流的房间号]
                // app=flv&flashver=&swfurl=&tcurl=rtmp://localhost/flv&pageurl=&addr=127.0.0.1&clientid=135&call=publish&name=aaaa&type=live&auth=123
                var params = new Object();
                for(var i = 0; i < arr.length; i++) {
                    var tmp_arr = arr[i].split("=");
                    params[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
                }

                isLiving = true
                nums = 0
            } else if(req.url == '/on_publish_done') {
                // 教师推流结束后触发，可以向通知主服务器教师关闭直播
                isLiving = false
                nums = 0
            } else if(req.url == '/on_play') {
                // 当用户拉流时触发，可用于增加观看人数
                nums += 1
            } else if(req.url == '/on_play_done') {
                // 用户结束拉流时触发，用于减少观看人数
                nums -= 1
                if(nums < 0) {
                    nums = 0
                }
            } else if(req.url == '/on_record_done') {
                // 流记录生成完成后触发，可用于通知主服务器最新截取的直播封面地址
            } else if(req.url == '/on_update' ) {
                // 定时触发的事件，可用于发送心跳和检验教师封禁状态
            }

            if(!isLiving) {
                res.writeHead(200, {'Content-Type' : 'text/html'});
                res.end('直播未开始或已结束');
                console.log('--直播授权码：' + qs.parse(body).auth + (isLiving ? '，直播进行中' : '，直播未开始或已结束') + '，观看直播人数：0');    
            } else {
                res.writeHead(200, {'Content-Type' : 'text/html'});
                res.end('直播进行中');
                console.log('--直播授权码：' + qs.parse(body).auth + (isLiving ? '，直播进行中' : '，直播未开始或已结束') + '，观看直播人数：' + nums.toString(10));    
            }

        })
    }

}).listen(port, function() {
    console.log('Server running at ' + port);
});