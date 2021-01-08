var http = require('http')
var port = 8100; //web监听

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

开始直播：
/on_connect
call=connect&app=hls&flashver=&swfurl=&tcurl=rtmp://localhost/hls&pageurl=&epoch=117781638&&addr=127.0.0.1&clientid=15
----
/on_publish
call=publish&name=test&type=live&app=hls&tcurl=rtmp://localhost/hls&addr=127.0.0.1&clientid=15
----

每隔 30s 调用一次 （nginx->live.conf 中 rtmp 的 ping 30s 有关, 以下 time 参数体现）
/on_update
call=update_publish&time=30&timestamp=29909&name=test&app=hls&tcurl=rtmp://localhost/hls&addr=127.0.0.1&clientid=46
/on_update
call=update_publish&time=60&timestamp=55722&name=test&app=hls&tcurl=rtmp://localhost/hls&addr=127.0.0.1&clientid=46

结束直播：
/on_publish_
call=publish_done&name=test&bytes_in=69682&bytes_out=631&app=hls&tcurl=rtmp://localhost/hls&addr=127.0.0.1&clientid=15
----
/on_done
call=done&name=test&bytes_in=69682&bytes_out=631&app=hls&tcurl=rtmp://localhost/hls&addr=127.0.0.1&clientid=15
//*/
http.createServer(function(req, res) {
    console.log(req.url);
    req.pipe(process.stdout);
    req.on('end', function(){
        console.log('\n----');
    })
    res.writeHead(200, {'Content-Type' : 'text/plain'});
    res.end();

}).listen(port, function() {
    console.log('Server running at ' + port);
});
