var express = require('express');
var app = express();
var fs = require("fs");

//get
app.get('/listUsers', function (req, res) {
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
})

//add 添加新用户数据
var user = {
    "user4" : {
       "name" : "mohit",
       "password" : "password4",
       "profession" : "teacher",
       "id": 4
    }
 }
app.get('/addUser', function(req, res) {
    fs.readFile(__dirname + "/" + "users.json", "utf8", function(err, data) {
        data = JSON.parse( data );
        data['user4'] = user['user4'];
        console.log( data );
        res.end( JSON.stringify(data) );
    })
})

//deleteUser:id 删除指定用户
app.get('/deleteUser/:id', function (req, res) {
    // 首先我们读取已存在的用户
    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
        data = JSON.parse( data );

        var user = data["user" + req.params.id] 
        delete data["user" + req.params.id];
        console.log( user );
        res.write( JSON.stringify(user) );
        res.write( '\n-----\n' )
        res.write( JSON.stringify(data) )
        res.end( '\n-----\n' )
    });
 })

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})