const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

var arr = ['/readall', '/read',
           '/create', '/update'];

const server = http.createServer((req, resp) => {
  //console.log('0');
  parseBodyJson(req, (err, data) => {
    resp.statusCode = 200;
    resp.setHeader('Content-Type', 'application/json');

    switchMethod(resp, req.url, data);

    resp.end();
  });
});

function switchMethod(resp, url, data) {
  let readJSON = fs.readFileSync('./articles.json');
  let jsonFile = JSON.parse(readJSON);
  let date = new Date();
  //console.log(jsonFile.Articles);

  switch (url) {
    case '/readall':
      fs.appendFileSync('./log.txt', 'readall --- ' + date + '\n');
      readAll(resp, data, jsonFile);
    break;

    case '/read':
      fs.appendFileSync('./log.txt', 'read --- ' + date + '\n');
      read(resp, data, jsonFile);
    break;

    case '/create':
      fs.appendFileSync('./log.txt', 'create --- ' + date + '\n');
      create(resp, data, jsonFile);
    break;

    case '/update':
      fs.appendFileSync('./log.txt', 'update --- ' + date + '\n');
      update(resp, data, jsonFile);
    break;

    case "/delete":
      delet(resp, data, jsonFile);
    break;

    default:
      let result = { code: 404, message: 'Not found'};
      resp.write(JSON.stringify(result));
      break;
  }
}
//---------------------------------------------------------
function readAll(resp, data, jsonFile) {
  resp.write(JSON.stringify(jsonFile.Articles));
}
//---------------------------------------------------------
function read(resp, data, jsonFile) {
  let id = data.id;
  let str;

  for(let i = 0; i < jsonFile.Articles.length; i++){
    if(id == jsonFile.Articles[i].id){
      str = "[id]: " + jsonFile.Articles[i].id + ", [text]: " + jsonFile.Articles[i].text;
      for(let j = 0; j < jsonFile.Articles[i].comments.length; j++){
        if(jsonFile.Articles[i].id == jsonFile.Articles[i].comments[j].articleId){
          str += ", [comments]: " + jsonFile.Articles[i].comments[j].text;
          resp.write(JSON.stringify(str));
          break;
        }
      }
      break;
    }
  }
}
//---------------------------------------------------------
function create(resp, data, jsonFile) {
  let flag = false;
  let str2;

  for(let i = 0; i < jsonFile.Articles.length; i++){
    if(data.id == jsonFile.Articles[i].id){
      flag = true;
      resp.write(JSON.stringify('Error'));
    }
  }

  if(!flag){
    jsonFile.Articles.push({id: data.id, author: data.author, comments: data.comments});
    fs.writeFileSync('./articles.json', JSON.stringify(jsonFile));

    for(let i = 0; i < jsonFile.Articles.length; i++){
      if(data.id == jsonFile.Articles[i].id){
        str2 = "[id]: " + jsonFile.Articles[i].id + ", [author]: " + jsonFile.Articles[i].author + ", [comments]: " + jsonFile.Articles[i].comments;
        resp.write(JSON.stringify(str2));
      }
    }
  }
}
//---------------------------------------------------------
function update(resp, data, jsonFile) {
  for(let i = 0; i < jsonFile.Articles.length; i++){
    if(data.id == jsonFile.Articles[i].id){
      //jsonFile.Articles[i].date = data.date;
      jsonFile.Articles[i].date = data.date;
    }
  }

  fs.truncate('./articles2.json', 0, function() {
      fs.writeFileSync('./articles2.json', JSON.stringify(jsonFile));
  });
}
//---------------------------------------------------------
function delet(resp, data, jsonFile) {
  for(let i = 0; i < jsonFile.Articles.length; i++){
    if(data.id == jsonFile.Articles[i].id){
      for(let j = 0; j < jsonFile.Articles[i].comments.length; j++){
        if(data.idComment == jsonFile.Articles[i].comments[j].id){
          jsonFile.Articles[i].comments[j] = null;
          fs.truncate('./articles2.json', 0, function() {
              fs.writeFileSync('./articles2.json', JSON.stringify(jsonFile));
          });
        }
      }
    }
  }
}
//---------------------------------------------------------

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});

function parseBodyJson(req, cb) {
  let body = [];

  req.on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();

    let params = JSON.parse(body);

    cb(null, params);
  });
}
