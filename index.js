const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, resp) => {
  let fromJSON = fs.readFileSync('./articles.json');
  let text = JSON.parse(fromJSON);
  console.log(text.Model[1]);

  resp.end('hello');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
