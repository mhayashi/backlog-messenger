var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		sys = require('sys');

var server = http.createServer(function(req, res){
	var path = url.parse(req.url).pathname;
	switch (path){
	 case '/':
		fs.readFile(__dirname + '/test.html', function(err, data){
			if (err) return send404(res);
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(data);
			res.end();
    });
		break;
	default:
    if (/\.(js)$/.test(path)){
		  fs.readFile(__dirname + path, function(err, data){
			  res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.write(data);
        res.end();
      });
    } else if (/\.(css)$/.test(path)) {
		  fs.readFile(__dirname + path, function(err, data){
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(data);
        res.end();
      });
    }
    break;
	}
});
server.listen(8080);
