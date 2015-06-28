 var http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs");

//console.log(process.argv);
var hostport=5000;

// fs.writeFile('./session.json', "[]", function(wferr) {});

http.createServer(function(req, res) {
	var pathname = __dirname + url.parse(req.url).pathname;
	console.log("pathname: " + pathname);
	//console.log(url.parse(req.url).pathname);

	if (path.extname(pathname) == "") {
		pathname += "/";
	}
	if (pathname.charAt(pathname.length - 1) == "/") {
		pathname += "index.html";
	}

	fs.exists(pathname, function(exists) {
		if (exists) {
			switch (path.extname(pathname)) {
				case ".html":
					res.writeHead(200, {
						"Content-Type": "text/html"
					});
					reponseFile(req,res,fs,pathname);
					break;
				case ".htm":
					res.writeHead(200, {
						"Content-Type": "text/html"
					});
					reponseFile(req,res,fs,pathname);
					break;
				case ".js":
					res.writeHead(200, {
						"Content-Type": "text/javascript"
					});
					reponseFile(req,res,fs,pathname);
					break;
				case ".css":
					res.writeHead(200, {
						"Content-Type": "text/css"
					});
					reponseFile(req,res,fs,pathname);
					break;
				case ".gif":
					res.writeHead(200, {
						"Content-Type": "image/gif"
					});
					reponseFile(req,res,fs,pathname);
					break;
				case ".jpg":
					res.writeHead(200, {
						"Content-Type": "image/jpeg"
					});
					reponseFile(req,res,fs,pathname);
					break;
				case ".png":
					res.writeHead(200, {
						"Content-Type": "image/png"
					});
					reponseFile(req,res,fs,pathname);
					break;
				default:
					/*
					res.writeHead(200, {
						"Content-Type": "application/octet-stream"
					});*/
					res.writeHead(403, {
						"Content-Type": "text/html"
					});
					res.end("<h1>403 Forbidden. " + pathname + "</h1>");
			}

		} else { //非文件请求，ws请求
			if (path.extname(pathname) == ".ws") {
				//console.log("==wwwwssss=== " + pathname);
				webSrvProxy(req, res, pathname);
			}
			else if (path.extname(pathname) == ".node") {
				console.log("==node=== " + pathname);
				execNodejs(req, res, pathname);
			} else {
				res.writeHead(404, {
					"Content-Type": "text/html"
				});
				res.end("<h1>404 Not Found. " + pathname + "</h1>");
			}
		}
	});

}).listen(hostport);

console.log("OSS Query Server(ver 0.1) running at ... " + hostport);

function reponseFile(req,res,fs,pathname) {
	fs.readFile(pathname, function(err1, data) {
		if (err1) console.log("server.js :: err1: " + err1);
		res.end(data);
	});
}

function webSrvProxy(req, res, pathname) {
	try {
		var key = __dirname + "\\server.json";
        console.log(key);
        delete require.cache[key];
        var fn = path.basename(pathname, ".ws");

        var appdir = require("./server.json");
        //var rr = "./" + appdir.appdir+"/webSrvProxy_Http.js";
        var rr = "./" + appdir.appdir+"/webSrvProxy.js";
		console.log("fn: " + rr);
		zm = require(rr);

		var callfn = "zm.webServiceProxy" + "(req, res, fn)";
		console.log("callfn: " + callfn);
		eval(callfn);
	} catch (err2) {
		console.log("server.js :: err2: " + err2);
	}
}

function execNodejs(req, res, pathname) {
	console.log("======= enter ...  execnode ======");
	try {
		var key = __dirname + "\\server.json";
        console.log(key);
        delete require.cache[key];
        var fn = path.basename(pathname, ".node");

        var appdir = require("./server.json");
        var rr = "./" + appdir.appdir+"/execNode.js";
		console.log("fn: " + rr);
		zm = require(rr);

		var callfn = "zm.execNodejs" + "(req, res, fn)";
		console.log("server.js callfn: " + callfn);
		eval(callfn);
	} catch (err3) {
		console.log("server.js :: err3: " + err3);
	}
}