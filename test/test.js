var os = require('os');
var fs = require('fs');

var dd = new Date();
var ss = formatDate(dd, 'yyyy-MM-dd hh:mm:ss.lll');
console.log(ss);

addSession({
    "user": "11111",
    "token": "dXXXddddddd"
});


/*
var argtxt = require("../ws/getWeather.json");
console.log(argtxt.args);
for (var item in argtxt.args) {
       console.log(item + ":" + argtxt.args[item]);
}


console.log(getIPAdress());
console.log("======= 2 ==========");
console.log(getLocalIP());
console.log("======= 4 ==========");
*/

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
//   记录一下node如何获取本机local的ip：
function getIPAdress() {
    var interfaces = require('os').networkInterfaces();
    console.log(interfaces);
    console.log("===================")
    for (var devName in interfaces) {
        console.log(devName);
        console.log("------------")
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            console.log(iface);
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

function getLocalIP() {
    var map = [];
    var ifaces = os.networkInterfaces();
    console.log(ifaces);
    console.log("======= 3 ==========");

    for (var dev in ifaces) {
        if (dev.indexOf('eth0') != -1) {
            var tokens = dev.split(':');
            var dev2 = null;
            if (tokens.length == 2) {
                dev2 = 'eth1:' + tokens[1];
            } else if (tokens.length == 1) {
                dev2 = 'eth1';
            }
            if (null == ifaces[dev2]) {
                continue;
            }

            // 找到eth0和eth1分别的ip
            var ip = null,
                ip2 = null;
            ifaces[dev].forEach(function(details) {
                if (details.family == 'IPv4') {
                    ip = details.address;
                }
            });
            ifaces[dev2].forEach(function(details) {
                if (details.family == 'IPv4') {
                    ip2 = details.address;
                }
            });
            if (null == ip || null == ip2) {
                continue;
            }

            // 将记录添加到map中去
            if (ip.indexOf('10.') == 0 ||
                ip.indexOf('172.') == 0 ||
                ip.indexOf('192.') == 0) {
                map.push({
                    "intranet_ip": ip,
                    "internet_ip": ip2
                });
            } else {
                map.push({
                    "intranet_ip": ip2,
                    "internet_ip": ip
                });
            }
        }
    }
    return map;
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
    console.log(date);
    var y = date.getFullYear();
    var M = "0" + (date.getMonth() + 1);
    M = M.substring(M.length - 2);
    var d = "0" + date.getDate();
    d = d.substring(d.length - 2);
    var h = "0" + date.getHours();
    console.log(h);
    h = h.substring(h.length - 2);
    var m = "0" + date.getMinutes();
    m = m.substring(m.length - 2);
    var s = "0" + date.getSeconds();
    s = s.substring(s.length - 2);
    var l = "0" + date.getMilliseconds();
    l = l.substring(l.length - 3);
    return style.replace('yyyy', y).replace('MM', M).replace('dd', d).replace('hh', h).replace('mm', m).replace('ss', s).replace('lll',l);
}