var app = require('./config/custom-express')()
//var http = require('http');

app.listen(3000,function(){
  console.log('Servidor rodando na porta 3000')
});

/*http.createServer(app).listen(3000,function(){
  console.log('servidor rodando');
})*/
