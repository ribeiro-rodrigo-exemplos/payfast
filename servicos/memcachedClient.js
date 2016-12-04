var Memcached = require('memcached');

function createMemcachedClient(){

  var cliente = new Memcached('localhost:11211',{
    retries:10,
    retry: 10000,
    remove: true
  });

  return cliente;
}


module.exports = function(){
  return createMemcachedClient;
}

/*cliente.set('pagamento-21',{id:21},60000,function(erro){
  console.log('nova chave adicionada ao cache: pagamento-20');
}); */

/*cliente.get('pagamento-27',function(erro,retorno){
  if(erro || !retorno){
    console.log('MISS - chave não encontrada');
  }
  else{
    console.log('HIT - valor: '+JSON.stringify(retorno));
  }
}) */
