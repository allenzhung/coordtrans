//================ getWeather.js ==========================
var url1 = require("url");
var soap = require('soap');
var fs = require('fs');
var querystring = require('querystring');

/*
var redis = require('redis');
var redisClient = redis.createClient();
redisClient.on("error", function(err) {
    console.log("Error " + err);
});
*/

exports.execNodejs = function(req2, res2, fn) {
    try {
        //        var cstxt = url1.parse(req2.url, true).query;
        var cstxt = url1.parse(req2.url);
        console.log("===== execNodejs ======= ");
        console.log(cstxt);
        console.log("cookie: ...")
        //console.log(JSON.stringify(req2.headers.cookie));
        console.log(req2.headers.cookie);

        // 获得客户端的Cookie
        var Cookies = {};
        req2.headers.cookie && req2.headers.cookie.split(';').forEach(function(Cookie) {
            var parts = Cookie.split('=');
            Cookies[parts[0].trim()] = (parts[1] || '').trim();
        });
        console.log(Cookies)
        console.log(Cookies.sessionId);

        /*
        console.log("get from redis: ...")
        redisClient.get("sid", function(err, replay) {
            console.log(replay);
            //redisClient.end();     
        });
*/
        var postData = "";
        //设置request请求的数据编码。  
        req2.setEncoding("utf8");
        req2.addListener("data", function(data) {
            postData += data;
            console.log("------ Received POST data :") + data;
        });

        req2.addListener("end", function() {
            console.log("----------end data :");
            console.log(postData);
            info = querystring.parse(postData);

            var role;
            var ff = findUser(info, role);
            console.log("findUser:.......");
            console.log(ff);

            if (ff) {
                //redisClient.set("sid", sid, redis.print);
                require('crypto').randomBytes(16, function(ex, buf) {
                    var token = buf.toString('hex');
                    console.log("token=" + token + "..................");
                    var sid = {
                        'user': info.user,
                        'token': token,
                        'time': formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.lll')
                    };

                    //将seeionid写入文件中
                    addSession(sid);
                    repUserOK(res2, info, role, sid);

                    console.log(token);
                });
            } else {
                repUserNotFind(res2, info);
            }



        })

    } catch (err5) {
        console.log("execNode.js :: err5: " + err5);
    }

}

function dateCookieString(ms) {
    var d, wdy, mon
    d = new Date(ms)
    wdy = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return wdy[d.getUTCDay()] + ', ' + pad(d.getUTCDate()) + '-' + mon[d.getUTCMonth()] + '-' + d.getUTCFullYear() + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' GMT'
}

function pad(n) {
    return n > 9 ? '' + n : '0' + n
}

function addSession(jsid) {
    fs.readFile('./session.json', function(rferr, data) {
        if (rferr) throw rferr;
        console.log(data);
        console.log(data.toString("utf-8"));

        var fsid = JSON.parse(data.toString("utf-8"));

        console.log(jsid.user + " /" + jsid.token);
        var find = false;
        for (var item in fsid) {
            console.log(fsid[item].user + " /" + fsid[item].token);
            if (fsid[item].user == jsid.user) {
                console.log("find");
                find = true;
                fsid[item].token = jsid.token;
                break;
            }
        }

        if (!find) {
            fsid[fsid.length] = jsid;
            console.log(JSON.stringify(fsid));
        }

        console.log(JSON.stringify(fsid));
        var sidBuffer = new Buffer(JSON.stringify(fsid), "utf8");

        fs.writeFile('./session.json', sidBuffer, function(wferr) {
            if (wferr) throw wferr;
            console.log('has finished');
        });

    });
}

function repUserNotFind(res2, info) {
    console.log("not exist user=" + info.user);
    res2.writeHead(200, {
        "Content-Type": "text/html,charset=utf-8"
    });

    var rr = {};
    rr["verifyReturn"] = {
        "status": "invalid",
        "user": info.user
    };
    res2.write(JSON.stringify(rr));
    res2.end();
}

function repUserOK(res2, info, role, sid) {
    res2.writeHead(200, {
        "Set-Cookie": ["user=" + info.user, "role=" + role, "sessionId=" + JSON.stringify(sid)],
        "Content-Type": "text/html,charset=utf-8"
    });

    var rr = {};
    rr["verifyReturn"] = {
        "status": "valid",
        "user": info.user,
        "role": role
    };

    res2.write(JSON.stringify(rr));
    res2.end();
}

function findUser(info, role) {
    var ff = false;
    var user = info.user;
    var password = info.password;

    var key = __dirname + "\\data\\users.json";
    console.log(key);
    delete require.cache[key];

    var users = require("./data/users.json");
    console.log(users);

    console.log(user);
    for (var i = 0; i < users.length; i++) {
        console.log(users[i].name + " / " + users[i].role);
        if (user == users[i].name && password == users[i].pwd) {
            ff = true;
            role = users[i].role;
            break;
        }
    }
    return ff;
}

/**   
 * 格式化日期
 * <code>
 * yyyy-------年
 * MM---------月
 * dd---------日
 * hh---------时
 * mm---------分
 * formatDate(new Date() , 'yyyy-MM-dd mm:hh');
 * or formateDate(new Date(), 'yyyy/MM/dd mm/hh');
 * </code> * @param {Date}date 需要格式化的日期对象
 * @param {Object} style 样式
 * @return 返回格式化后的当前时间
 */
function formatDate(date, style) {
    var y = date.getFullYear();
    var M = "0" + (date.getMonth() + 1);
    M = M.substring(M.length - 2);
    var d = "0" + date.getDate();
    d = d.substring(d.length - 2);
    var h = "0" + date.getHours();
    h = h.substring(h.length - 2);
    var m = "0" + date.getMinutes();
    m = m.substring(m.length - 2);
    var s = "0" + date.getSeconds();
    s = s.substring(s.length - 2);
    var l = "0" + date.getMilliseconds();
    l = l.substring(l.length - 3);
    return style.replace('yyyy', y).replace('MM', M).replace('dd', d).replace('hh', h).replace('mm', m).replace('ss', s).replace('lll', l);
}