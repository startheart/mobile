/**
 * 服务范围
 *
 * @author yanting
 */

var $ = require('node').all,
    IO = require('io'),
    Overlay = require('overlay'),
    Event = require('event'),
    XTemplate = require('kg/xtemplate/3.3.3/runtime'),
    contentXtpl = require('./tpl/serviceCover'),
    popupXtpl = require('./tpl/popup'),
    coverBodyXtpl = require('./tpl/coverBody')
    BuyType = require('../buyType/');

module.exports =  {
    init: function(data) {
        if (data) {
            this.getCoverData(data);
        } else {
            var serviceComData = new Object();
            serviceComData.hook = '#J_serviceCover';

            this.getCoverData(serviceComData);
        }
    },
    /**
     * 异步获取服务范围数据
     *
     * @return {Promise} [Promise实例]
     */
    getCoverData: function(serviceComData) {
        var self = this;
        var dataUrl = 'http://localhost:5555/data/cover.json';
        var buyTypeComData = new Object();
        buyTypeComData.hook = '#J_buyType';

        //TODO 获取失败的处理
        IO.get(dataUrl, function(result) {
            //维护服务范围数据
            self.coverBodyData = result.data;
            //维护当前选择服务地点数据
            self.curSelectPlace = new Object();
            //更新默认服务点的数据
            self.updateCurData();
            //渲染服务范围组件
            self.renderServiceCom(serviceComData);
            //初始化购买方式组件
            BuyType.init(buyTypeComData);
            //创建弹层
            self.createPopup();
        });
    },
    /**
     * 更新当前服务点的数据
     *
     */
    updateCurData: function() {

        var coverBodyData = this.coverBodyData;

        if (!(coverBodyData || coverBodyData.default.prov || coverBodyData.default.city || coverBodyData.areaCodeList)) {
            console.log('后台服务范围数据出错！');
            return false;
        }

        var curSelectPlace = this.curSelectPlace,
            provCode = curSelectPlace.curProvCode || coverBodyData.default.prov,
            cityCode = curSelectPlace.curCityCode || coverBodyData.default.city,
            provArr,
            prov,
            cityArr,
            city;

        provArr = S.filter(coverBodyData.areaCodeList, function(item, index) {
            return item.code == provCode;
        });

        prov = provArr[0];

        cityArr = S.filter(prov.child, function(item) {
            return item.code == cityCode;
        });

        city = cityArr[0];

        if (!(prov.name || city.name)) {
            console.log('后台默认城市数据出错！');
            return false;
        }

        curSelectPlace.curProvCode = provCode;
        curSelectPlace.curProvName = prov.name;
        curSelectPlace.curCityCode = cityCode;
        curSelectPlace.curCityName = city.name;
        curSelectPlace.curSiblingCity = prov.child;
        //维护临时变量
        curSelectPlace.tmpProvCode = provCode;
        curSelectPlace.tmpProvName = prov.name;

    },
    /**
     *  渲染服务范围组件
     *
     */
    renderServiceCom: function(serviceComData) {
        var self = this;
        var $hook = $(serviceComData.hook);
        var html = new XTemplate(contentXtpl).render({
            data: self.curSelectPlace.curCityName
        });

        $hook.html(html);
    },
    /**
     * 创建服务范围选择弹层
     *
     * @return {*} [description]
     */
    createPopup: function() {
        var self = this;
        var coverBodyData = this.coverBodyData;

        if (!coverBodyData) return false;

        var popupHtml = new XTemplate(popupXtpl).render({
            curSelectPlace: self.curSelectPlace
        });

        var popup = new Overlay.Popup({
            trigger: $('#J_place'),
            toggle: true,
            content: popupHtml,
            align: {
                node: $('#J_place'),
                points: ['bl', 'tl'],
                offset: [0, 0]
            }
        });

        popup.on('show', function(el) {
            var $hook = $(el.currentTarget.contentEl);
            $('#J_place').addClass('active');

            self.updateCurData();

            var popupHtml = new XTemplate(popupXtpl).render({
                curSelectPlace: self.curSelectPlace
            });

            $hook.html(popupHtml);

            $('li', popup.contentEl).each(function(item) {
                if (item.attr('data-code') == self.curSelectPlace.curCityCode) {
                    item.addClass('selected').siblings().removeClass('selected');
                    return true;
                }
            });

            //TODO 把这段代码分离
            $('#J_close').on('click', function() {
                popup.hide();
            });

            popup.on('hide', function() {
                $('#J_place').removeClass('active');
            });
            Event.delegate(popup.contentEl, 'click', 'li', function(e) {

                var $target = $(e.target);

                var tarCode = $target.attr('data-code');
                var tarName = $target.attr('data-value');
                var tarType = parseInt($target.attr('data-type'));
                if (tarType == 3) {
                    //选择市
                    $('#J_placeText').html(tarName);
                    $('#J_secRangeText').html(tarName);
                    self.curSelectPlace.curProvCode = self.curSelectPlace.tmpProvCode;
                    self.curSelectPlace.curProvName = self.curSelectPlace.tmpProvName;
                    self.curSelectPlace.curCityCode = tarCode;
                    self.curSelectPlace.curCityName = tarName;
                    self.updateCurData();

                    popup.hide();
                } else {
                    //选择省
                    //存储临时变量
                    self.curSelectPlace.tmpProvCode = tarCode;
                    self.curSelectPlace.tmpProvName = tarName;
                    //渲染popupBody
                    self.renderPopupBody(tarType + 1, tarCode, tarName);
                }
            });

            //给一级title绑定事件
            $('#J_firstRange').on('click', function(e) {

                var $target = $(e.target);

                var tarCode = $target.attr('data-code');
                var tarName = $target.attr('data-value');
                var tarType = parseInt($target.attr('data-type'));

                self.renderPopupBody(tarType, tarCode, tarName);
            });
        });
    },
    renderPopupBody: function(type, code, value) {
        var coverBodyData = this.coverBodyData;

        var $fstRange = $('#J_firstRange');
        var $secRange = $('#J_secondRange');
        var $fstRangeText = $('#J_fstRangeText');
        var $secRangeText = $('#J_secRangeText');
        var selectedClass = 'selected';
        var hiddenClass = 'hidden';

        if (type == 2) {

            $fstRange.addClass(selectedClass).siblings().removeClass(selectedClass).addClass(hiddenClass);

            $fstRangeText.attr({
                'data-code':  '',
                'data-value':  ''
            }).html('请选择');

            //去除二级body的selected属性
            $('#J_coverBody li').each(function(item) {
                item.removeClass('selected');
            });
            //渲染一级body
            var coverBodyHtml = new XTemplate(coverBodyXtpl).render({
                data: coverBodyData.areaCodeList
            });
            $('#J_coverBody').html(coverBodyHtml);
        }

        if (type == 3) {
            $secRange.removeClass(hiddenClass).addClass(selectedClass).siblings().removeClass(selectedClass);

            $fstRangeText.attr({
                'data-code':  code,
                'data-value':  value
            }).html(value);

            $secRangeText.html('请选择');
            //渲染二级body
            var tarProvArr = S.filter(coverBodyData.areaCodeList, function(item) {

                return item.code == code;
            });
            var tarProv = tarProvArr[0];

            var coverBodyHtml = new XTemplate(coverBodyXtpl).render({
                data: tarProv.child
            });
            $('#J_coverBody').html(coverBodyHtml);
        }
    }
};
