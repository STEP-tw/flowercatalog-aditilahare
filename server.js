let fs = require('fs');
let timeStamp = require('./time.js').timeStamp;
let http = require('http');
let WebApp = require('./webapp');
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


let getUpdatedComments = function (comment) {
  let existingComments = fs.readFileSync("data/comments.json","utf8");
  existingComments = JSON.parse(existingComments);
  existingComments.unshift(comment);
  let updatedComments = JSON.stringify(existingComments,null,2);
  return updatedComments;
};

let toHtml = function(allComments){
  return allComments.map((comment)=>{
    return `<p>date:${comment.date} name:${comment.name} comment:${comment.comment}</p>`
  })
}

let updateCommentsOnGuestBook = function(allComments){
  let comments = JSON.parse(allComments);
  let commentsInHtml = toHtml(comments).join("\n");
  fs.writeFileSync("public/allComments.html",commentsInHtml);
}

let updateCommentsInFiles = function(allComments){
  fs.writeFileSync("data/comments.json",allComments);
  updateCommentsOnGuestBook(allComments);
}


let handleComments = function(comment){
  comment = querystring.parse(comment);
  let date = new Date().toLocaleString();
  comment['date']=date;
  let allComments = getUpdatedComments(comment);
  updateCommentsInFiles(allComments);
};


let dealWithComments = function(req){
  let comment = "";
  req.on("data",(chunk)=>{
    comment+=chunk;
  });
  req.on("end",()=>{
    handleComments(comment);
  });
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

let requestHandler = (req,res)=>{
  setUrlForServeFile(req);
  if(req.method=='GET'){
    let path = './public' + req.url;
    res.setHeader('Content-type',`${getContentType(req)}`);
    res.write(fs.readFileSync(path));
    res.end();
  }
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
app.use(requestHandler);

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

let PORT = 5000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
