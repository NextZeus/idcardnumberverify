/**
 * Created by lixiaodong on 16/9/27.
 */
var fs = require('fs');
var async = require('async');


var check = require('./index');

var model = new check();

function verify(next){
    var inLicense = '';
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    async.waterfall([
        function (cb) {
            fs.readFile(__dirname + '/auth.txt', 'utf8', function (err, data) {
                if (!err && !!data) {
                    inLicense = data;
                }
                cb(err);
            });
        },
        function (cb) {
            model.init({
                inLicense: inLicense,
                SBM: '公司名称',
                FSD: '110105',//北京朝阳区
                YWLX: '网游防沉迷'
            }, function () {
                cb();
            });
        },
        function (cb) {
            var persons = [{card_id: '', card_name: ''}];
            model.check(persons, {}, function (err, data) {
                cb(err,data);
            });
        }
    ], function (err,result) {
        console.log('check-result--->>>', err, result);
        next(err,result);
    });
}

verify();


/**
 * 正确结果
 * [ { gmsfhm: {}, result_gmsfhm: '一致' },
 { xm: {}, result_xm: '一致' } ]

 身份证号不对
 [ { errormesage: '服务结果:库中无此号，请到户籍所在地进行核实' },
 { errormesagecol: {} } ]

 姓名不对
 [ { gmsfhm: {}, result_gmsfhm: '一致' },
 { xm: {}, result_xm: '不一致' } ]

 */