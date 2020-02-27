const express = require('express');
const server = express();

// Environment variables
const dotenv = require('dotenv');
dotenv.config();

// nunjucks = template engine // permite usar {{}} 
const nunjucks = require("nunjucks");
nunjucks.configure('./',{
    express: server,
    noCache: true 
})

// configurações do servidor  

    // arquivos estaticos 
    server.use(express.static('public'));

    // habilitar uso do body 
    server.use(express.urlencoded({ extended: true}))

    // config db
    const Pool = require('pg').Pool;
    const db = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port:  process.env.DB_PORT,
        database: process.env.DB_DB_NAME,
        ssl: true
    })


//-- configurações do servidor  

server.get("/", function(req,res){

    db.query("select * from donors", function(err,result){
        if (err) {
            console.log(err)
                return res.send("erro no banco de dados.")
        }else{
                const donors = result.rows;
                return res.render("index.html",{ donors });
        }
    })
    
});

server.post('/', function(req,res){
    // ler conteúdo do form enviado
    const name = req.body.name
    const email = req.body.email
    const blood = req.body.bloodtype

    /*
    // valida antes do insert ( to usando o required do html pra impossibilitar envio de branco)
    if (trim(name) == "" || trim(email) == "" || trim(blood) == ""){
        return res.send("Todos os campos são obrigatórios")
    }
    */

    // insert no banco 
    const query = `
        insert into "donors" ("name","email","blood")
        values($1,$2,$3)`

    const values = [name,email,blood];

    db.query(query,values,function(err){
        if (err) {
            console.log(err)
                return res.send("erro no banco de dados.")
            }else{
                 // após o envio redirecione
                return res.redirect("/")
        }
    });

   

});



const port = normalizePort(process.env.PORT || '3000');

console.log('API rodando na porta ' + port);

 function normalizePort(val) {
   const port = parseInt(val, 10);
   if (isNaN(port)) {
     return val;
   }
   if (port >= 0) {
     return port;
   }
   return false;
 }

 function onError(error) {
   if (error.syscall !== 'listen') {
     throw error;
   }
   const bind = typeof port === 'string'
     ? 'Pipe ' + port
     : 'Port ' + port;
   switch (error.code) {
     case 'EACCES':
       console.error(bind + ' requires elevated privileges');
       process.exit(1);
       break;
     case 'EADDRINUSE':
       console.error(bind + ' is already in use');
       process.exit(1);
       break;
     default:
       throw error;
   }
 }

 function onListening() {
   const addr = server.address();
   const bind = typeof addr === 'string'
     ? 'pipe ' + addr
     : 'port ' + addr.port;
   debug('Listening on ' + bind);
 }
