/**
 * Created by zhenwu.czw on 15/6/2.
 * detail页的主逻辑入口模块
 */
'use strict';

require('./index.css');

var $ = require('node').all,
    ServiceCover = require('./c/serviceCover/');

module.exports =  {
    init: function(data) {
        ServiceCover.init(data);
    }
};
