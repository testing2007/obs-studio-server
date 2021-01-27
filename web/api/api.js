var macro = require('../common_macro.js')
var cors = require('cors');
const express = require('express')
const app = express();
app.use(cors()); //跨域访问

var roomId = 0 //直播房间号，默认从0开始

var roomInfo = {}

app.listen(macro.api_port, ()=>{
    console.log('---api server is launched----')
})

/* 拉流端调用：获取拉流地址信息
 * 请求：/getFlvLiveURL?roomId={roomId}&authCode={authCode}
 * roomId: 房间号
 * authCode: 授权码可以用户登录的时候产生, authCode = pull_{roomId}
 */
app.get('/getPullInfo', (req, res) => {
    console.log("%s", req.query)
   let roomId = req.query.roomId
    let authCode = req.query.authCode
    var pullAuthCode = 'pull_' + roomId //相当于登录时生成的拉流授权码
    // if(roomInfo[roomId] && authCode == pullAuthCode) {
    if(_checkBaseInfo(req) && roomInfo[roomId]) {
        console.log("if")
        res.write( JSON.stringify(roomInfo[roomId]) )
        res.end()
    } else {
        console.log("else")
        //TODO:转发到错误页面 或 404 页面
    }
})

/* 推流端调用：获取推送信息
 * 请求：/getFlvLiveURL?liveType={liveType}&authCode={authCode}
 * liveType: 推送直播类型(flv、hls 两种形式)
 * authCode: 授权码可以用户登录的时候产生
 */
app.get('/getPushInfo', (req, res) => {
        var info = null

        // std::string category = (pushCategory==0) ? "service" : "param";
        // std::string style = (pushStyle==0) ? "hls" : "flv";
        // std::string params = "?pushCategory=" + category  + "&pushStyle="+ style + "&authCode="+ authCode;

        console.log("%s", req.query)
        let pushCategory = req.query.pushCategory
        let pushStyle = req.query.pushStyle
        var authCode= req.query.authCode
        // var pushAuthCode = 'push_' + roomId //相当于登录时生成的推流授权码
        // if(pushStyle && authCode && authCode == pushAuthCode && res.statusCode >= 200 || res.statusCode <= 299) {
        if(_checkBaseInfo(req) && pushStyle && authCode && res.statusCode >= 200 || res.statusCode <= 299) {
            let pullPort = '8080' //默认80端口
            let pushPort = '1935'
            var domain = 'localhost'
            // var additionInfo = roomId.toString() //+ '_' + authCode //房间号_授权码
            let pushAddress = null
            var flvPullAddress = null
            var rtmpPullAddress = null
            var hlsPullAddress = null
            if(pushStyle.localeCompare('hls') == 0) {
                if(pushCategory.localeCompare('service') == 0) {
                    // hls推流地址：rtmp://localhost:1935/hls
                    pushAddress = 'rtmp://' + domain + ':' + pushPort + '/' + 'hls'
                } else {
                    // hls推流地址：rtmp://localhost:1935/hls/{roomId}
                    pushAddress = 'rtmp://' + domain + ':' + pushPort + '/' + 'hls' + '/'  +roomId.toString()
                }
                // flv拉流地址：http://localhost:8080/flv?port=1935&app=hls&stream={roomId}
                flvPullAddress = 'http://'+ domain + ':' + pullPort + '/' + 'flv' + '?port='+pushPort + '&app=hls' + '&stream='+roomId.toString()
                // rtmp拉流地址：rtmp://localhost:1935/hls/{roomId}
                rtmpPullAddress = 'rtmp://'+ domain + ':' + pushPort + '/' + 'hls' + '/' + roomId.toString() 
                // hls拉流地址：http://localhost:8080/hls/{roomId}.m3u8 #这一这种方式 监控服务器 不能监听直播状态，且目前 google 浏览器不支持, 估计是hls是苹果协议，所以 safari 就支持
                hlsPullAddress = 'http://' + domain + ':' + pullPort + '/' + 'hls' + '/' + roomId.toString() + '.m3u8'

            } else {
                // 默认就设置为flv
                // flv推流地址：rtmp://localhost:1935/flv/{roomId}
                if(pushCategory.localeCompare('service') == 0) {
                    // hls推流地址：rtmp://localhost:1935/hls
                    pushAddress = 'rtmp://' + domain + ':' + pushPort + '/' + 'flv'
                } else {
                    // hls推流地址：rtmp://localhost:1935/hls/{roomId}
                    pushAddress = 'rtmp://' + domain + ':' + pushPort + '/' + 'flv' + '/'  +roomId.toString()
                }
	            // flv拉流地址: http://localhost:8080/flv?port=1935&app=flv&stream={roomId}
                flvPullAddress = 'http://'+ domain + ':' + pullPort + '/' + 'flv' + '?port='+pushPort + '&app=flv' + '&stream='+roomId.toString()
                // rtmp拉流地址: rtmp://localhost:1935/flv/{roomId}
                rtmpPullAddress = 'rtmp://'+ domain + ':' + pushPort + '/' + 'flv' + '/' + roomId.toString() 
                // hls拉流地址: 空
                hlsPullAddress = "" //不能返回 null, 否则客户端解析会崩溃
            }

            var timestamp = new Date().getTime()
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
                    "startTimestamp" : timestamp //时间戳
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
                "startTimestamp" : info.data.startTime,
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

function _checkBaseInfo(req) {
    // console.log( req );
    if(req.headers['bxg-origin'] == 'bxg') {
        return true
    }
    return false
}
