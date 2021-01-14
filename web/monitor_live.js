var api = require('./api/api.js')
// api.test()

var macro = require('./common_macro.js')

var http = require('http')
// var port = 8100; //web监听
var port = macro.monitor_port

/*
nginx->live.conf设置
    on_connect http://localhost:8100/on_connect;
    on_play http://localhost:8100/on_play;
    on_publish http://localhost:8100/on_publish;
    on_done http://localhost:8100/on_done;
    on_play_done http://localhost:8100/on_play_done;
    on_publish_done http://localhost:8100/on_publish_done;
    on_record_done http://localhost:8100/on_record_done;
    on_update http://localhost:8100/on_update;

// 推流/拉流回调
// on_publish ： 当教师推流时触发，可以用作教师的推流权限验证。
// on_publish_done : 教师推流结束后触发，可以向通知主服务器教师关闭直播
// on_play：当用户拉流时触发，可用于增加观看人数
// on_play_done: 用户结束拉流时触发，用于减少观看人数
// on_record_done ：流记录生成完成后触发，可用于通知主服务器最新截取的直播封面地址
// on_update：定时触发的事件，可用于发送心跳和检验教师封禁状态

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
http.createServer(function(req, res) {
    console.log(req.url);

    /*
    processData(res)
    //*/

    req.pipe(process.stdout);
    req.on('end', function(){
        console.log('\n----');
    })
    res.writeHead(200, {'Content-Type' : 'text/plain'});
    res.end();

}).listen(port, function() {
    console.log('Server running at ' + port);
});

function processData(req) {
// 推流/拉流回调
// on_publish ： 当教师推流时触发，可以用作教师的推流权限验证。
// on_publish_done : 教师推流结束后触发，可以向通知主服务器教师关闭直播
// on_play：当用户拉流时触发，可用于增加观看人数
// on_play_done: 用户结束拉流时触发，用于减少观看人数
// on_record_done ：流记录生成完成后触发，可用于通知主服务器最新截取的直播封面地址
// on_update：定时触发的事件，可用于发送心跳和检验教师封禁状态
}
