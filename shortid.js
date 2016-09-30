var shortid = require('shortid');

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#@');
var id = shortid.generate().toLowerCase().substring(0,6)+'';
