/**
 * 购买方式
 *
 * @author yanting
 */

var $ = require('node').all,
    IO = require('io'),
    XTemplate = require('kg/xtemplate/3.3.3/runtime'),
    contentXtpl = require('./tpl/buyType');

module.exports =  {
    init: function(data) {
        this.render(data);
    },
    render: function(data) {
        console.log(data);
        if (!(data || data.hook)) { return false; }

        var $hook = $(data.hook);
        var html = new XTemplate(contentXtpl).render();
        $hook.html(html);
    }
};
