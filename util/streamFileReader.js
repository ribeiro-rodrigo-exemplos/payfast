var fs = require('fs');

fs.createReadStream('imagem.jpg')
  .pipe(fs.createWriteStream('imagem-com-stream.jpg')
            .on('finish',function(event){
                console.log('arquivo escrito com stream');
            })

       );
