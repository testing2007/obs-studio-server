var macro = require('../common_macro.js')
var cors = require('cors');
const express = require('express')
const app = express();
app.use(cors()); //跨域访问

var roomId = 1 //直播房间号

var roomInfo = {}
// var roomInfo = {
//     "1" : {
//         "roomId": "1", 
//         "liveImage" : "",
//         "liveSecret" : "111",
//         "rtmpAddress" : "rtmp://localhost/flv", //flv就是推流名称，需要解析出来
//         "startTime" : "2021-01-17 13:46:30",
//         // http://服务器ip:端口号/拉流uri?port=推流端口号&app=推流名称&stream=房间号&auth=授权码
//         // http://localhost:8080/live?port=1935&app=flv&stream=1&auth=111
//         "pullAddress": "http://localhost:8080/live?port=1935&app=flv&stream=11111&auth=111"
//     },
//     "2" : {
//         "roomId": "2", 
//         "liveImage" : "",
//         "liveSecret" : "222",
//         "rtmpAddress" : "rtmp://localhost/flv", 
//         "startTime" : "2021-01-21 08:30:00",
//         "pullAddress": "http://localhost:8080/live?port=1935&app=flv&stream=2&auth=222"
//     }
// }

app.listen(macro.api_port, ()=>{
    console.log('---api server is launched----')
})

app.get('/getFlvLiveURL/:roomId', (req, res) => {
    //浏览器：/getFlvLiveURL/2， 2 就是roomId
    console.log("roomId=%s", req.params.roomId)
    if(roomInfo[req.params.roomId] != undefined) {
        console.log("if")
        res.write( JSON.stringify(roomInfo[req.params.roomId]) )
        res.end()
    } else {
        console.log("else")
        //TODO:转发到错误页面 或 404 页面
    }
})

/* getPushInfo: 获取推送信息
 * liveType: 推送直播类型(flv、hls 两种形式)
 */
app.get('/getPushInfo/:liveType', (req, res) => {
        var info = null
        console.log("liveType=%s", req.params.liveType)
        let liveType = req.params.liveType
        if(liveType && res.statusCode >= 200 || res.statusCode <= 299) {
            let pullPort = '8080' //默认80端口
            let pushPort = '1935'
            var authCode='111' //TODO: 生成校验码
            var domain = 'localhost'
            var additionInfo = roomId.toString()
            let pushAddress = null
            var flvPullAddress = null
            var rtmpPullAddress = null
            var hlsPullAddress = null
            if(liveType.localeCompare('hls') == 0) {
                // hls推流地址：rtmp://localhost:1935/hls/{roomId}_{authCode}
                pushAddress = 'rtmp://' + domain + ':' + pushPort + '/' + 'hls' + '/' + additionInfo
                // flv拉流地址：http://localhost:8080/flv?port=1935&app=hls&stream={roomId}_{authCode}			
                flvPullAddress = 'http://'+ domain + ':' + pullPort + '/' + 'flv' + '?port='+pushPort + '&app=hls' + '&stream='+additionInfo
                // rtmp拉流地址：rtmp://localhost:1935/hls/{roomId}_{authCode}
                rtmpPullAddress = 'rtmp://'+ domain + ':' + pushPort + '/' + 'hls' + '/' + additionInfo 
                // hls拉流地址：http://localhost:8080/hls/{roomId}_{authCode}.m3u8 #这一这种方式 监控服务器 不能监听直播状态，且目前 google 浏览器不支持, 估计是hls是苹果协议，所以 safari 就支持
                hlsPullAddress = 'http://' + domain + ':' + pullPort + '/' + 'hls' + '/' + additionInfo + '.m3u8'

            } else {
                // 默认就设置为flv
                // flv推流地址：rtmp://localhost:1935/flv/{roomId}_{authCode}
                pushAddress = 'rtmp://' + domain + ':' + pushPort + '/' + 'flv' + '/' + additionInfo
	            // flv拉流地址: http://localhost:8080/flv?port=1935&app=flv&stream={roomId}_{authCode}
                flvPullAddress = 'http://'+ domain + ':' + pullPort + '/' + 'flv' + '?port='+pushPort + '&app=flv' + '&stream='+additionInfo
                // rtmp拉流地址: rtmp://localhost:1935/flv/{roomId}_{authCode}
                rtmpPullAddress = 'rtmp://'+ domain + ':' + pushPort + '/' + 'flv' + '/' + additionInfo 
                // hls拉流地址: null
                hlsPullAddress = "" //不能返回 null, 否则客户端解析会崩溃
            }

            info = {
                "status": res.statusCode,
                "message": "成功",
                "data" : {
                    "roomId": roomId.toString(), //对应 /on_publish 的 name 字段
                    "liveImage" : "",
                    "liveSecret" : authCode,
                    "livePushAddress" : pushAddress, 
                    "livePullFlvAddress" : flvPullAddress,
                    "livePullRtmpAddress" : rtmpPullAddress,
                    "livePullHlsAddress" : hlsPullAddress,
                    "startTime" : "2021-01-17 13:46:30" //TODO 时间戳
                }
            }

            roomInfo[roomId.toString()] = {
                "roomId": info.data.roomId,
                "liveImage" : info.data.liveImage,
                "liveSecret" : info.data.liveSecret,
                "livePushAddress" : pushAddress, 
                "livePullFlvAddress" : flvPullAddress,
                "livePullRtmpAddress" : rtmpPullAddress,
                "livePullHlsAddress" : hlsPullAddress,
                "startTime" : info.data.startTime,
            }
            roomId += 1;
        } else {
            info = {
                "status": res.statusCode,
                "message": "失败",
                "data" : null
            }
        }
    
        console.log( info );
        res.write( JSON.stringify(info) )
        res.end()

})