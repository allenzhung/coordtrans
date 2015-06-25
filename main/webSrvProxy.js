//================ getWeather.js ==========================
var url1 = require("url");
var soap = require('soap');
var fs = require('fs');

exports.webServiceProxy = function(req2, res2, fn) {
    console.log("===== websrvWeather ======= " + fn);
    verifySession(req2, function(status) {
        if (!status) {
            repNoSession(res2);
            return;
        }

        console.log("===== pass session verify ======= " + fn);

        jArgs = initSoapArgs(req2, fn);
        soap.createClient(jArgs.soapUrl, function(err2, client) {
            if (err2) {
                console.log("webSrvProxy.js :: err2: " + err2);
                return;
            }
            console.log("createClient ok");

            try {
                client.setSOAPAction(jArgs.soapAction);
            } catch (err3) {
                console.log("webSrvProxy.js :: err3: " + err3);
            }

            var callback = function(err4, result) {
                if (err4) {
                    console.log("webSrvProxy.js :: err4: " + err4);
                    return;
                }

                try {
                    res2.writeHead(200, {
                        "Content-Type": "text/html,charset=utf-8"
                    });
                    console.log(result);
                    res2.write(JSON.stringify(result));
                    res2.end();
                } catch (err5) {
                    console.log("webSrvProxy.js :: err5: " + err5);
                }
            }

            var callfn = "client." + jArgs.soapMethod + "(jArgs.args,callback)";
            console.log("callfn ... " + callfn);
            try {
                eval(callfn);
            } catch (err6) {
                console.log("webSrvProxy.js :: err6: " + err6);
            }
        }); //end createClient
    });
}

function verifySession(req2, aaa) {
    var find = false;
    // 获得客户端的Cookie
    console.log("cookies........ from file .........compare .....");
    console.log(req2.headers.cookie);

    var Cookies = {};
    req2.headers.cookie && req2.headers.cookie.split(';').forEach(function(Cookie) {
        var parts = Cookie.split('=');
        console.log("****" + parts[1] + "***");
        var jj = parts[1].trim();
        var tt = jj.indexOf("\{");
        console.log(tt);
        if (parts[1].indexOf("\{") >= 0) {
            var jj = JSON.parse(parts[1]);
            Cookies[parts[0].trim()] = jj;
        } else
            Cookies[parts[0].trim()] = (jj || '').trim();
    });
    console.log(Cookies);
    console.log(Cookies.sessionId.user);
    console.log(Cookies.sessionId.token);
    //读服务器中的session文件
    fs.readFile('./session.json', function(rferr, data) {
        console.log("session.json --------");
        console.log(data);
        if (rferr) throw rferr;
        var sid = JSON.parse(data.toString("utf-8"));
        console.log("session file ...");
        console.log(data.toString("utf-8"));
        console.log("cookie.....")
        console.log(Cookies.sessionId.user);
        console.log(Cookies.sessionId.token);

        for (var item in sid) {
            console.log(item);
            if (sid[item].user == Cookies.sessionId.user && sid[item].token == Cookies.sessionId.token) {
                console.log("verify ok");
                find = true;
                break;
            }
        }
        aaa(find);
    });
}

function initSoapArgs(req2, fn) {
    var jArgs = {};
    try {
        var jArgs = require("./ws/" + fn + ".json");
        var cstxt = url1.parse(req2.url, true).query;
        //console.log("jArgs: ");
        //console.log(jArgs);
        //console.log("cstxt: ");
        //console.log(cstxt);
        for (var cs in cstxt) {
            for (var item in jArgs.args) {
                console.log(cs + " / " + item);
                if (cs == item) {
                    console.log("find" + jArgs.args[item] + " / " + cstxt[cs]);
                    jArgs.args[item] = cstxt[cs];
                }
            }
        }

        console.log("args...");
        console.log(jArgs.args);
    } catch (err1) {
        console.log("webSrvProxy.js :: err1: " + err1);
    }
    return jArgs;
}

function repNoSession(res2) {
    res2.writeHead(200, {
        "Content-Type": "text/html,charset=utf-8"
    });
    res2.write("you have not login.");
    res2.end();
}