var fs = require('fs');
var path = require('path');
var https = require('https');
var _ = require('underscore');
var soap = require('soap');
var builder= require('xmlbuilder');
var xml2json = require('xml2json');

var IdVerify = function(){
    this.soapClient = null;
};

IdVerify.prototype.init = function (options,next) {
    var self = this;

    var opts = {
        wsdl: path.join(__dirname,'NciicServices.wsdl')
    };

    options = _.extend(opts,options);
    self.options = options;

    soap.createClient(options.wsdl, function(err,client){
        if(!!err){
            throw err;
        }

        if(!err && !!client){
            self.soapClient = client;
        }
        next();
    });
}

IdVerify.prototype.protocol = 'soap';

IdVerify.prototype.hostname = 'api.nciic.com.cn';

IdVerify.prototype.wsdl = '/nciic_ws/services/NciicServices?wsdl';

IdVerify.prototype.check = function(persons,options,fn){
    var self = this;
    options = _.extend(this.options,options);
    if(!options.inLicense || !options.SBM || !options.FSD || ! options.YWLX){
        throw new Error('options arguments is lost.');
    }
    //build xml
    var rows = builder.create('ROWS');
    rows.ele('INFO').ele('SBM',options.SBM);
    var row = rows.ele('ROW');
    row.ele('GMSFHM','公民身份号码');
    row.ele('XM','姓名');
    for(var i in persons){
        row = rows.ele('ROW',{'FSD':options.FSD,'YWLX':options.YWLX});
        row.ele('GMSFHM',persons[i].card_id);
        row.ele('XM',persons[i].card_name);
    }
    var inConditions = rows.end();

    var args = {
        inLicense: options.inLicense,
        inConditions: inConditions
    };
    self.soapClient.nciicCheck(args,function(err,result){
        if(err){
            console.error('nciic remote server check: ');
            console.error(err);
            fn && fn({errcode: 500100, errmsg: 'remote server exceptions.'});
            return;
        }
        var out = xml2json.toJson(result.out.toLowerCase());
        try{
            out = JSON.parse(out);
        }catch(err){
            fn && fn({errcode: 500111, errmsg: 'remote数据解析异常'});
            return;
        }

        console.log('out--->>>>',out);

        if(!(out && out.rows && out.rows.row)){
            fn && fn({errcode: 500110, errmsg: 'remote数据不完整'});
            return;
        }

        var output = out.rows.row.output;
        var item = output.item;

        var isValid = false;

        if(!!item){
            console.log('item-->>',item);
            var gmsfhm = item[0];
            var xm = item[1];

            if(!gmsfhm.errormesage && gmsfhm.result_gmsfhm == '一致' && xm.result_xm == '一致'){
                isValid = true;
            }
        }

        fn && fn(err,isValid);
    });
};

module.exports = IdVerify;