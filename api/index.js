var fs = require('fs');
var path = require('path');

module.exports = function(req, res) {
  // Handle /api/songs
  if (req.url === '/api/songs') {
    var tabsDir = path.join(__dirname, 'tabs');
    fs.readdir(tabsDir, function(err, files) {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({error: 'Could not read tabs directory', details: err.message}));
        return;
      }
      var songs = files.filter(function(f) { return f.endsWith('.txt'); });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(songs));
    });
    return;
  }

  // Handle /tabs/*
  if (req.url.startsWith('/tabs/')) {
    var fileName = path.basename(req.url);
    var filePath = path.join(__dirname, 'tabs', fileName);
    
    fs.readFile(filePath, function(err, content) {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Tab file not found.');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(content);
    });
    return;
  }

  // Fallback
  res.writeHead(404);
  res.end('Not Found');
};
