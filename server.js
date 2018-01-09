let fs = require('fs');
const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');
let toS = o=>JSON.stringify(o,null,2);
let registered_users = [{userName:'aditi',name:'Aditi Lahare'}];

let logRequest = (req,res)=>{
  let text = ['------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toS(req.headers)}`,
    `COOKIES=> ${toS(req.cookies)}`,
    `BODY=> ${toS(req.body)}`,''].join('\n');
  fs.appendFile('request.log',text,()=>{});

  console.log(`${req.method} ${req.url}`);
}
let loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};


let getContentType = (req)=>{
  let extension = req.url.slice(req.url.lastIndexOf('.'));
  let contentTypes = {
    ".jpg" : "img/jpg",
    ".txt" : "text/txt",
    ".html" : "text/html",
    ".css" : "text/css",
    ".pdf" : "application/pdf",
    ".gif" : "img/gif",
    ".js" : "text/javascript"
  };
  return contentTypes[extension];
};


let setUrlForServeFile = function(req){
  if(req.url=='/home'){
    return req.url = '/index.html';
  }
  if(req.url=='/login'){
    return req.url = '/login.html';
  }
  if(req.url=='/logout'){
    return req.url = '/index.html';
  }
}

let serveFile = (req,res)=>{
  setUrlForServeFile(req);
  if(req.method=='GET'){
    let path = './public' + req.url;
    res.setHeader('Content-type',`${getContentType(req)}`);
    res.write(fs.readFileSync(path));
    res.end();
  }
  // console.log(req.user);
  if(req.method=='POST'){
    let path = './public/guestBook.html'
    res.setHeader('Content-type',`${getContentType(req)}`);
    res.write(fs.readFileSync(path));
    res.end();
  }
}

let app = WebApp.create();
app.use(logRequest);
app.use(loadUser);
app.use(serveFile);

app.get('/login',(req,res)=>{
  res.setHeader('Content-type',`${getContentType(req)}`);
  res.write(fs.readFileSync('public/login.html'));
  res.end();
});

app.get('/home',(req,res)=>{
  res.setHeader('Content-type',`${getContentType(req)}`);
  res.write(fs.readFileSync('public/index.html'));
  res.end();
});

app.post('/login',(req,res)=>{
  if(user) {
    res.setHeader('Content-type',`${getContentType(req)}`);
    res.write(fs.readFileSync('public/guestBook.html'));
    res.end();
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.write(fs.readFileSync('public/index.html'));
  res.end();
  return;
});

app.get('/logout',(req,res)=>{
  res.setHeader('Content-type',`${getContentType(req)}`);
  res.write(fs.readFileSync('public/index.html'));
  res.end();
});

const PORT = 5000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
