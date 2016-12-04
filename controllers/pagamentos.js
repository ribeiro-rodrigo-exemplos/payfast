var logger = require('../servicos/logger');

module.exports = function(app){

  function createResponse(content){

    return {

            content:content,
            links:[
                    {
                        rel:'confirmar',
                        href:'http://localhost:3000/pagamentos/pagamento/'+content["dados_do_pagamento"].id,
                        method: 'PUT'
                    },
                    {
                        rel:'cancelar',
                        href:'http://localhost:3000/pagamentos/pagamento/'+content["dados_do_pagamento"].id,
                        method:'DELETE'
                    }
                  ]
          }

  }


  app.get('/pagamentos/pagamento/:id',function(req,res){
    var id = req.params.id;
    logger.info('consultando pagamento '+id);

    var memcachedClient = app.servicos.memcachedClient();

    memcachedClient.get('pagamento-'+id,function(erro,retorno){
      if(erro || !retorno){
        console.log('MISS - chave não encontrada');

        var connection = app.persistencia.connectionFactory();
        var pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.buscaPorId(id,function(erro,resultado){

          if(erro){
            console.log('erro ao consultar no banco '+erro);
            res.status(500).send(erro);
            return;
          }

          console.log('pagamento encontrado: '+JSON.stringify(resultado));
          //logger.info('pagamento encontrado: '+JSON.stringify(resultado));
          res.json(resultado);
          return;

        });

      }
      else{
        console.log('HIT - valor: '+JSON.stringify(retorno));
        res.json(retorno);
      }
    });

  });

  app.delete('/pagamentos/pagamento/:id',function(req,res){

    var pagamento = {};
    var id = req.params.id;

    pagamento.id = id;
    pagamento.status = 'CANCELADO';

    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.atualiza(pagamento,function(erro,resultado){

      if(erro){
        res.status(500).send(erro);
        return;
      }

      if(resultado.affectedRows == 0)
        res.sendStatus(404);
      else
        res.sendStatus(204);

    })

  })

  app.put('/pagamentos/pagamento/:id',function(req,res){

    var pagamento = {}
    var id = req.params.id;

    pagamento.id = id;
    pagamento.status = 'CONFIRMADO';

    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.atualiza(pagamento,function(erro,resultado){
      if(erro){
        res.status(500).send(erro);
        return;
      }

      console.log(resultado);

      if(resultado.affectedRows == 0)
        res.sendStatus(404)
      else
        res.send(pagamento);

    });

  });

  app.post('/pagamentos/pagamento',function(req,res){
    var pagamento = req.body.pagamento;
    console.log('processando uma requisicao de um novo pagamento');

    req.assert("pagamento.forma_de_pagamento",
               "Forma de pagamento eh obrigatorio").notEmpty();

   req.assert('pagamento.valor','O valor é obrigatório e deve ser um decimal')
      .notEmpty()
      .isFloat();

   var erros = req.validationErrors();

   if(erros){
     console.log('Erros de validação encontrados')
     res.status(400).send(erros);
     return;
   }

    pagamento.status = 'CRIADO';
    pagamento.data = new Date();

    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.salva(pagamento,function(erro,resultado){
      if(erro)
      {
        console.log('Erro ao inserir no banco');
        res.status(500)
            .send(erro);
      }
      else{

        console.log('pagamento criado');

        pagamento.id = resultado.insertId;

        var memcachedClient = app.servicos.memcachedClient();

        memcachedClient.set('pagamento-'+pagamento.id,pagamento,60000,function(erro){
          console.log('nova chave adicionada ao cache '+pagamento.id);
        })

        if(pagamento.forma_de_pagamento == 'cartao'){
          var cartao = req.body.cartao;

          var clienteCartoes = new app.servicos.clienteCartoes();
          clienteCartoes.autoriza(cartao,function(exception,request,response,retorno){

            if(exception){
              console.log(exception)
              res.status(400).send(exception);
              return;
            }

            console.log(retorno);
            res.location('http://localhost:3000/'+pagamento.id);
            pagamento.cartao = retorno;
            res.status(201).json(createResponse({"dados_do_pagamento":pagamento,"cartao":cartao}));
            return;

          });

          return;

        }

        var response = {

          content:pagamento,
          links:[
                  {
                      rel:'confirmar',
                      href:'http://localhost:3000/pagamentos/pagamento/'+pagamento.id,
                      method: 'PUT'
                  },
                  {
                      rel:'cancelar',
                      href:'http://localhost:3000/pagamentos/pagamento/'+pagamento.id,
                      method:'DELETE'
                  }
                ]
        }

        res.location('/pagamentos/pagamento/'+pagamento.id);
        res.status(201)
           .json(response);
      }
    });

    connection.end();

  });

}
