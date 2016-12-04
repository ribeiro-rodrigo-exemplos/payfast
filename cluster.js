var cluster = require('cluster');
var os = require('os');

console.log('executando cluster');


if(cluster.isMaster)
{
  console.log('is master');
  var cpus = os.cpus();

  cpus.forEach(function(){
    cluster.fork();
  })

  cluster.on('listening',function(worker){
    console.log('cluster conectado '+worker.process.pid);
  })

  cluster.on('exit',function(worker){
    console.log('cluster %d desconectado ',worker.process.pid);
    cluster.fork();
  })

}
else {
  console.log('thread slave');
  require('./index');
}
