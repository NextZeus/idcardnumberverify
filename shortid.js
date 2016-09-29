var fs = require('fs');

var shortid = require('shortid');

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#@');
var code  = {

};
var array = [];

console.time('costTime:')
for(var i = 0 ; i < 100000; i++){
    var id = shortid.generate().toLowerCase().substring(0,6)+'';

    if(id.indexOf('#') != -1 || id.indexOf('@') != -1){
        continue;
    }

    if(code[id]){
        continue;
    } else {
        array.push(id);
        code[id] = 1;
    }
}
console.timeEnd('costTime:');
//console.log(array);

fs.writeFile('./sharecode.json',JSON.stringify(code), function () {

});


//console.log(shortid.isValid('hynnc0gqp'));