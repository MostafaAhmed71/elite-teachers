import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=process.cwd(),args=process.argv.slice(2),port=Number(args[args.indexOf('--port')+1])||4173;
http.createServer(async(req,res)=>{try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path==='/')path='/index.html';if(path==='/admin')path='/admin.html';const file=resolve(root,'.'+path);if(!file.startsWith(root+'/')||/(^|\/)\./.test(path))throw Error();const bytes=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json'}[extname(file)]??'application/octet-stream')});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'0.0.0.0',()=>console.log('Ready http://0.0.0.0:'+port));
