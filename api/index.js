var http = require('http');
var fs = require('fs');
var path = require('path');

var PORT = process.env.PORT || 3000;

var mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
};

var server = http.createServer(function(req, res) {
  if (req.url === '/api/songs') {
    fs.readdir(path.join(__dirname, 'tabs'), function(err, files) {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({error: 'Could not read tabs directory'}));
        return;
      }
      var songs = files.filter(function(f) { return f.endsWith('.txt'); });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(songs));
    });
    return;
  }

  var filePath = '.' + (req.url === '/' ? '/index.html' : req.url);
  var ext = path.extname(filePath);
  var contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, function(err, content) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, function() {
  console.log('Server running at http://localhost:' + PORT);
});
