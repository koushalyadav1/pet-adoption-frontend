
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = 5173;

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://localhost:${port}`).pathname;

  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pawfect Pet Adoption</title>
</head>
<body>
  <script src="/main.js"></script>
</body>
</html>`);
    return;
  }

  

const allowedFiles = {
  '/main.js': ['main.js', 'text/javascript; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],

  '/images/pets/salaar.png': [
    'images/pets/salaar.png', 'image/png'
  ],
  '/images/pets/scotch.png': [
    'images/pets/scotch.png', 'image/png'
  ],
  '/images/pets/whisky.png': [
    'images/pets/whisky.png', 'image/png'
  ]
};



  const file = allowedFiles[pathname];

  if (!file) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  fs.readFile(path.join(root, file[0]), (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': file[1] });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Frontend running at http://localhost:${port}`);
});
