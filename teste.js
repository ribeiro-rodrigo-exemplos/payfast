let fs = require('fs');

function removeFiles(directory,files,cb){
  files.forEach(function(file,index,array){
    let fileDirectory = directory+'/'+file;

    fs.stat(fileDirectory,function(err,stats){
      if(stats.isDirectory())
        removeFolder(fileDirectory)
      else{
        //fs.unlinkSync(fileDirectory);
        if(index == array.length-1)
          cb();
        console.log(' - '+fileDirectory);
      }

    })
  })
}

function removeFolder(directory){

  console.log('lendo diretorio '+directory);

  if(fs.existsSync(directory)){
    let files = fs.readdirSync(directory);
    removeFiles(directory,files,function(){
      console.log('terminou '+directory);
    })
  }






}


removeFolder('logs');
