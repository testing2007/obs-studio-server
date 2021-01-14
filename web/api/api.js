var macro = require('../common_macro.js')

const express = require('express')
const app = express();

app.listen(macro.api_port, ()=>{
    console.log('---api server is launched----')
})

app.get('/', (req, res) => {
    console.log('api sever is running')
    res.send('<p style="color:red">服务已启动2222</p>');
})


module.exports = {
    
}