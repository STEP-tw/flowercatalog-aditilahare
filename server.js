let fs = require('fs');
// const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');
let toS = o=>JSON.stringify(o,null,2);

// let logRequest = (req,res)=>{
//   let text = ['------------------------------',
//     `${timeStamp()}`,
//     `${req.method} ${req.url}`,
//     `HEADERS=> ${toS(req.headers)}`,
//     `COOKIES=> ${toS(req.cookies)}`,
//     `BODY=> ${toS(req.body)}`,''].join('\n');
//   fs.appendFile('request.log',text,()=>{});

  // console.log(`${req.method} ${req.url}`);
// }
// let loadUser = (req,res)=>{
//   let sessionid = req.cookies.sessionid;
//   let user = registered_users.find(u=>u.sessionid==sessionid);
//   if(sessionid && user){
//     req.user = user;
//   }
// };
// let redirectLoggedInUserToGuestBook = (req,res)=>{
//   if(req.urlIsOneOf(['/','/login']) && req.user) res.redirect('/public/guestBook.html');
// }
// let redirectLoggedOutUserToIndex = (req,res)=>{
//   if(req.urlIsOneOf(['/','/home','/logout']) && req.user) res.redirect('/public/index.html');
// }


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


let serveFile = (req,res)=>{
  if(req.url=='/login'){
    req.url = '/index.html';
  }
  let path = './public' + req.url;
  if(req.method=='GET'){
    res.setHeader('Content-type',`${getContentType(req)}`);
    res.write(fs.readFileSync(path));
    res.end();
  }
}

let app = WebApp.create();
// app.use(logRequest);
// app.use(loadUser);
// app.use(redirectLoggedInUserToGuestBook);
// app.use(redirectLoggedOutUserToIndex);
app.use(serveFile);

app.get('/login',(req,res)=>{
  res.setHeader('Content-type',`${getContentType(req)}`);
  res.write(fs.readFileSync('public/guestBook.html'));
  res.end();
});

app.get('/home',(req,res)=>{
  res.setHeader('Content-type',`${getContentType(req)}`);
  res.write(fs.readFileSync('public/index.html'));
  res.end();
});

// app.post('/login',(req,res)=>{
//   if(!user) {
//     res.setHeader('Set-Cookie',`logInFailed=true`);
//     res.redirect('/login');
//     return;
//   }
//   let sessionid = new Date().getTime();
//   res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
//   user.sessionid = sessionid;
//   res.redirect('/home');
// });
// app.get('/home',(req,res)=>{
//   res.setHeader('Content-type','text/html');
//   res.write(`<p>Hello ${req.user.name}</p>`);
//   res.end();
// });
// app.get('/logout',(req,res)=>{
//   res.setHeader('Set-Cookie',[`loginFailed=false,Expires=${new Date(1).toUTCString()}`,`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
//   delete req.user.sessionid;
//   res.redirect('/login');
// });

const PORT = 5000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
