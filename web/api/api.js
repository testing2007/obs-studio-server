var macro = require('../common_macro.js')
var cors = require('cors');
const express = require('express')
const app = express();
app.use(cors()); //跨域访问

// var roomInfo = {}
var roomInfo = {
    "1" : {
        "roomId": "1", 
        "liveImage" : "",
        "liveSecret" : "111",
        "rtmpAddress" : "rtmp://localhost/flv", //flv就是推流名称，需要解析出来
        "startTime" : "2021-01-17 13:46:30",
        // http://服务器ip:端口号/拉流uri?port=推流端口号&app=推流名称&stream=房间号&auth=授权码
        // http://localhost:8080/live?port=1935&app=flv&stream=1&auth=111
        "pullHttpFlvAddress": "http://localhost:8080/live?port=1935&app=flv&stream=11111&auth=111"
    },
    "2" : {
        "roomId": "2", 
        "liveImage" : "",
        "liveSecret" : "222",
        "rtmpAddress" : "rtmp://localhost/flv", 
        "startTime" : "2021-01-21 08:30:00",
        "pullHttpFlvAddress": "http://localhost:8080/live?port=1935&app=flv&stream=2&auth=222"
    }
}

app.listen(macro.api_port, ()=>{
    console.log('---api server is launched----')
})

app.get('/', (req, res) => {
    console.log('api sever is running')
    res.send('<p style="color:red">API服务已启动</p>');
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

app.get('/getPushInfo', (req, res) => {
        var info = null
        if(res.statusCode >= 200 || res.statusCode <= 299) {
            info = {
                "status": res.statusCode,
                "message": "成功",
                "data" : {
                    "roomId": "1", //对应 /on_publish 的 name 字段
                    "liveImage" : "",
                    "liveSecret" : "123",
                    "rtmpAddress" : "rtmp://localhost/flv", 
                    "startTime" : "2021-01-17 13:46:30"
                }
            }
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