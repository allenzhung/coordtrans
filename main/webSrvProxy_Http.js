//================ getWeather.js ==========================
var url1 = require("url");
var http = require("http");

exports.webServiceProxy = function(req2, res2, fn) {
    console.log("===== websrvWeather =======");
    var theCityCode = url1.parse(req2.url, true).query.theCityCode;
    var soapData11 = '<?xml version="1.0" encoding="utf-8"?>';
    soapData11 = soapData11 + '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
    soapData11 = soapData11 + '<soap:Body>';
    soapData11 = soapData11 + '<getWeatherbyCityName xmlns="http://WebXml.com.cn/">';
    soapData11 = soapData11 + '<theCityName>' + theCityCode + '</theCityName>';
    soapData11 = soapData11 + '</getWeatherbyCityName>';
    soapData11 = soapData11 + '</soap:Body>';
    soapData11 = soapData11 + '</soap:Envelope>';

    var soapData12 = '<?xml version="1.0" encoding="utf-8"?>';
    soapData12 = soapData12 + '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">';
    //soapData12 = soapData12 + '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
    soapData12 = soapData12 + '<soap12:Body>';
    soapData12 = soapData12 + '<getWeatherbyCityName xmlns="http://WebXml.com.cn/">';
    soapData12 = soapData12 + '<theCityName>' + theCityCode + '</theCityName>';
    soapData12 = soapData12 + '</getWeatherbyCityName>';
    soapData12 = soapData12 + '</soap12:Body>';
    soapData12 = soapData12 + '</soap12:Envelope>';

    //使用options1，不成功，后来在headers中加上"User-Agent":"zm node",就成功了
    var options_soap11 = {
        host: "www.webxml.com.cn",
        port: 80,
        path: "/WebServices/WeatherWebService.asmx",
        method: "POST",
        headers: {
            //"Accept": "text/xml",  //这个可以不要
            //"Connect": "Keep-Alive",
            "User-Agent": "zm node",         
            //"Content-length": soapData11.length,   //nodejs http 不能有这行，否则返回400错误
            "Content-length": Buffer.byteLength(soapData11),   //如果要用，这个可以
            "Content-Type": "text/xml;charset=UTF-8",   
            //"SOAPAction": "http://WebXml.com.cn/getWeatherbyCityName"//经过测试不要也可以
        }
    };
    var options_soap12 = {
        host: "www.webxml.com.cn",
        port: 80,
        path: "/WebServices/WeatherWebService.asmx",
        method: "POST",
        headers: {
            //"Accept": "text/xml",  //这个可以不要
            //"User-Agent": "zm node",         
            //"Content-Length": soapData12.length,  /不能有这行，否则返回400错误
            "Content-Type": "application/soap+xml;charset=utf-8",
            //"SOAPAction": "http://WebXml.com.cn/getWeatherbyCityName",  //经过测试不要也可以
        }
    };

    //使用options,成功
    var options_httpget = {
        host: "www.webxml.com.cn",
        port: 80,
        path: "/WebServices/WeatherWebService.asmx/getWeatherbyCityName?theCityName=" + theCityCode,
        method: "GET",
    };

    var options = options_soap11;
    var soapData = soapData11;
    var reqWebWeather = http.request(options, function(ddd) {
        console.log(ddd.statusCode);
        console.log(ddd.httpVersion);
        console.log(ddd.headers);
        ddd.setEncoding('utf8');
        var www = "";
        ddd.on('data', function(hdata) {
            console.log(" ====== hdata ======");
            www = www + hdata;
        });
        ddd.on('end', function(enddata) {
            console.log(" ====== end1 ======");
            console.log(www);
            res2.writeHead(200, {
                "Content-Type": "text/html,charset=utf-8"
            });
            res2.write(www);
            res2.end();
        });
        ddd.on('error', function(err) {
            console.log("====== error =====");
            console.log(err);
        });
    });
    /* var reqWebWeather = http.request(options);
    reqWebWeather.on('response', responseHandler);
*/
    console.log(" ========== req send ==========");
    console.log(soapData);
    console.log(soapData.length);
    console.log(options);

    debugger; 
    reqWebWeather.end(soapData); //发送http请求
}

function responseHandler(res) {
    console.log("===== responseHandler =======");
    console.log("web weather return:");
}
