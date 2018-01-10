let fs = require('fs');
let guestBook = fs.readFileSync('./public/guestBook.html','utf8');
let commentBook = fs.readFileSync('./public/commentPage.html','utf8');
let timeStamp = require('./time.js').timeStamp;
let http = require('http');
let WebApp = require('./webapp');
let toS = o=>JSON.stringify(o,null,2);
let registered_users = [{userName:'aditi',name:'Aditi Lahare'}];
let linkForLogin = `<a href="./login.html">Click For Login </a>`

let logRequest = (req,res)=>{
  let text = ['------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toS(req.headers)}`,
    `COOKIES=> ${toS(req.cookies)}`,
    `BODY=> ${toS(req.body)}`,''].join('\n');
  fs.appendFile('request.log',text,()=>{});

  // console.log(`${req.method} ${req.url}`);
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

let serveFile = function(req,res){
  let fileName = `public${req.url}`;
  try {
    let fileContent = fs.readFileSync(fileName);
    res.write(fileContent);
    res.end();
  } catch (e) {
    return;
  }
}

let redirectToGuestBook = function(req,res){
  dealWithComments(req);
  res.redirect('guestBook.html');
  res.end();
}

let allowUserToLogin = function(req,res){
  let guestPage = guestBook.replace('placeHolder',linkForLogin);
  res.write(guestPage);
  res.end();
}


let allowUserToEnterComments = function(req,res){
  let guestPage = guestBook.replace('placeHolder',commentBook);
  res.write(guestPage);
  res.end();
}

let app = WebApp.create();
app.use(logRequest);
app.use(loadUser);
app.use(serveFile);
app.use(allowUserToLogin);
app.use(allowUserToEnterComments);


app.get('/',(req,res)=>{
  res.redirect('/index.html');
});


app.post('guestBook',redirectToGuestBook);

app.get('/logout',(req,res)=>{
  res.redirect('index.html');
});

let PORT = 5000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
