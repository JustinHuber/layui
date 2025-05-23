/**
 * colorpicker
 * 颜色选择组件
 */

layui.define(['jquery', 'lay'], function(exports) {
  "use strict";

  var $ = layui.$;
  var lay = layui.lay;
  var hint = layui.hint();
  var device = layui.device();
  var clickOrMousedown = (device.mobile ? 'click' : 'mousedown');

  // 外部接口
  var colorpicker = {
    config: {},
    index: layui.colorpicker ? (layui.colorpicker.index + 10000) : 0,

    // 设置全局项
    set: function(options) {
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    },

    // 事件
    on: function(events, callback) {
      return layui.onevent.call(this, 'colorpicker', events, callback);
    }
  };

  // 操作当前实例
  var thisModule = function() {
    var that = this;
    var options = that.config;
    var id = options.id;

    thisModule.that[id] = that; // 记录当前实例对象

    return {
      config: options
    };
  }

  //字符常量
  ,MOD_NAME = 'colorpicker', SHOW = 'layui-show', THIS = 'layui-this', ELEM = 'layui-colorpicker'

  ,ELEM_MAIN = '.layui-colorpicker-main', ICON_PICKER_DOWN = 'layui-icon-down', ICON_PICKER_CLOSE = 'layui-icon-close'
  ,PICKER_TRIG_SPAN = 'layui-colorpicker-trigger-span', PICKER_TRIG_I = 'layui-colorpicker-trigger-i', PICKER_SIDE = 'layui-colorpicker-side', PICKER_SIDE_SLIDER = 'layui-colorpicker-side-slider'
  ,PICKER_BASIS = 'layui-colorpicker-basis', PICKER_ALPHA_BG = 'layui-colorpicker-alpha-bgcolor', PICKER_ALPHA_SLIDER = 'layui-colorpicker-alpha-slider', PICKER_BASIS_CUR = 'layui-colorpicker-basis-cursor', PICKER_INPUT = 'layui-colorpicker-main-input'

  //RGB转HSB
  ,RGBToHSB = function(rgb){
    var hsb = {h:0, s:0, b:0};
    var min = Math.min(rgb.r, rgb.g, rgb.b);
    var max = Math.max(rgb.r, rgb.g, rgb.b);
    var delta = max - min;
    hsb.b = max;
    hsb.s = max !== 0 ? 255*delta/max : 0;
    if(hsb.s !== 0){
      if(rgb.r == max){ // 因 rgb 中返回的数字为 string 类型
        hsb.h = (rgb.g - rgb.b) / delta;
      }else if(rgb.g == max){
        hsb.h = 2 + (rgb.b - rgb.r) / delta;
      }else{
        hsb.h = 4 + (rgb.r - rgb.g) / delta;
      }
    }else{
      hsb.h = -1;
    }
    if(max === min){
      hsb.h = 0;
    }
    hsb.h *= 60;
    if(hsb.h < 0) {
      hsb.h += 360;
    }
    hsb.s *= 100/255;
    hsb.b *= 100/255;
    return hsb;
  }

  //HEX转HSB
  ,HEXToHSB = function(hex){
    hex = hex.indexOf('#') > -1 ? hex.substring(1) : hex;
    if(hex.length === 3){
      var num = hex.split("");
      hex = num[0]+num[0]+num[1]+num[1]+num[2]+num[2]
    }
    hex = parseInt(hex, 16);
    var rgb = {r:hex >> 16, g:(hex & 0x00FF00) >> 8, b:(hex & 0x0000FF)};
    return RGBToHSB(rgb);
  }

  //HSB转RGB
  ,HSBToRGB = function(hsb){
    var rgb = {};
    var h = hsb.h;
    var s = hsb.s*255/100;
    var b = hsb.b*255/100;
    if(s === 0){
      rgb.r = rgb.g = rgb.b = b;
    }else{
      var t1 = b;
      var t2 = (255 - s) * b /255;
      var t3 = (t1 - t2) * (h % 60) /60;
      if(h === 360) h = 0;
      if(h < 60) {rgb.r=t1; rgb.b=t2; rgb.g=t2+t3}
      else if(h < 120) {rgb.g=t1; rgb.b=t2; rgb.r=t1-t3}
      else if(h < 180) {rgb.g=t1; rgb.r=t2; rgb.b=t2+t3}
      else if(h < 240) {rgb.b=t1; rgb.r=t2; rgb.g=t1-t3}
      else if(h < 300) {rgb.b=t1; rgb.g=t2; rgb.r=t2+t3}
      else if(h < 360) {rgb.r=t1; rgb.g=t2; rgb.b=t1-t3}
      else {rgb.r=0; rgb.g=0; rgb.b=0}
    }
    return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
  }

  //HSB转HEX
  ,HSBToHEX = function(hsb){
    var rgb = HSBToRGB(hsb);
    var hex = [
      rgb.r.toString(16)
      ,rgb.g.toString(16)
      ,rgb.b.toString(16)
    ];
    $.each(hex, function(nr, val){
      if(val.length === 1){
        hex[nr] = '0' + val;
      }
    });
    return hex.join('');
  }

  //转化成所需rgb格式
  ,RGBSTo = function(rgbs){
    var regexp = /[0-9]{1,3}/g;
    var re = rgbs.match(regexp) || [];
    return {r:re[0], g:re[1], b:re[2]};
  }

  ,$win = $(window)
  ,$doc = $(document)

  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++colorpicker.index;
    that.config = $.extend({}, that.config, colorpicker.config, options);
    that.render();
  };

  //默认配置
  Class.prototype.config = {
    color: ''  //默认颜色，默认没有
    ,size: null  //选择器大小
    ,alpha: false  //是否开启透明度
    ,format: 'hex'  //颜色显示/输入格式，可选 rgb,hex
    ,predefine: false //预定义颜色是否开启
    ,colors: [ //默认预定义颜色列表
      '#16baaa', '#16b777', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700'
      ,'#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'
    ]
  };

  //初始颜色选择框
  Class.prototype.render = function(){
    var that = this;
    var options = that.config;

    // 若 elem 非唯一，则拆分为多个实例
    var elem = $(options.elem);
    if(elem.length > 1){
      layui.each(elem, function(){
        colorpicker.render($.extend({}, options, {
          elem: this
        }));
      });
      return that;
    }

    // 合并 lay-options 属性上的配置信息
    $.extend(options, lay.options(elem[0]));

    //颜色选择框对象
    var elemColorBox = $(['<div class="layui-unselect layui-colorpicker">'
      ,'<span '+ (options.format == 'rgb' && options.alpha
          ? 'class="layui-colorpicker-trigger-bgcolor"'
        : '') +'>'
        ,'<span class="layui-colorpicker-trigger-span" '
          ,'lay-type="'+ (options.format == 'rgb' ? (options.alpha ? 'rgba' : 'torgb') : '') +'" '
          ,'style="'+ function(){
            var bgstr = '';
            if(options.color){
              bgstr = options.color;

              if((options.color.match(/[0-9]{1,3}/g) || []).length > 3){ //需要优化
                if(!(options.alpha && options.format == 'rgb')){
                  bgstr = '#' + HSBToHEX(RGBToHSB(RGBSTo(options.color)))
                }
              }

              return 'background: '+ bgstr;
            }

            return bgstr;
          }() +'">'
          ,'<i class="layui-icon layui-colorpicker-trigger-i '+ (options.color
            ? ICON_PICKER_DOWN
          : ICON_PICKER_CLOSE) +'"></i>'
        ,'</span>'
      ,'</span>'
    ,'</div>'].join(''))

    //初始化颜色选择框
    elem = options.elem = $(options.elem);
    options.size && elemColorBox.addClass('layui-colorpicker-'+ options.size); //初始化颜色选择框尺寸

    // 插入颜色选择框
    elem.addClass('layui-inline').html(
      that.elemColorBox = elemColorBox
    );

    // 初始化 id 属性 - 优先取 options > 元素 id > 自增索引
    options.id = 'id' in options ? options.id : (
      elem.attr('id') || that.index
    );

    // 获取背景色值
    that.color = that.elemColorBox.find('.'+ PICKER_TRIG_SPAN)[0].style.background;

    // 相关事件
    that.events();
  };

  //渲染颜色选择器
  Class.prototype.renderPicker = function(){
    var that = this
    ,options = that.config
    ,elemColorBox = that.elemColorBox[0]

    //颜色选择器对象
    ,elemPicker = that.elemPicker = $(['<div id="layui-colorpicker'+ that.index +'" data-index="'+ that.index +'" class="layui-anim layui-anim-downbit layui-colorpicker-main">'
      //颜色面板
      ,'<div class="layui-colorpicker-main-wrapper">'
        ,'<div class="layui-colorpicker-basis">'
          ,'<div class="layui-colorpicker-basis-white"></div>'
          ,'<div class="layui-colorpicker-basis-black"></div>'
          ,'<div class="layui-colorpicker-basis-cursor"></div>'
        ,'</div>'
        ,'<div class="layui-colorpicker-side">'
          ,'<div class="layui-colorpicker-side-slider"></div>'
        ,'</div>'
      ,'</div>'

      //透明度条块
      ,'<div class="layui-colorpicker-main-alpha '+ (options.alpha ? SHOW : '') +'">'
        ,'<div class="layui-colorpicker-alpha-bgcolor">'
          ,'<div class="layui-colorpicker-alpha-slider"></div>'
        ,'</div>'
      ,'</div>'

      //预设颜色列表
      ,function(){
        if(options.predefine){
          var list = ['<div class="layui-colorpicker-main-pre">'];
          layui.each(options.colors, function(i, v){
            list.push(['<div class="layui-colorpicker-pre'+ ((v.match(/[0-9]{1,3}/g) || []).length > 3
              ? ' layui-colorpicker-pre-isalpha'
            : '') +'">'
              ,'<div style="background:'+ v +'"></div>'
            ,'</div>'].join(''));
          });
          list.push('</div>');
          return list.join('');
        } else {
          return '';
        }
      }()

      //底部表单元素区域
      ,'<div class="layui-colorpicker-main-input">'
        ,'<div class="layui-inline">'
          ,'<input type="text" class="layui-input">'
        ,'</div>'
        ,'<div class="layui-btn-container">'
          ,'<button class="layui-btn layui-btn-primary layui-btn-sm" colorpicker-events="clear">清空</button>'
          ,'<button class="layui-btn layui-btn-sm" colorpicker-events="confirm">确定</button>'
        ,'</div'
      ,'</div>'
    ,'</div>'].join(''))

    ,elemColorBoxSpan = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)[0];

    //如果当前点击的颜色盒子已经存在选择器，则关闭
    if($(ELEM_MAIN)[0] && $(ELEM_MAIN).data('index') == that.index){
      that.removePicker(Class.thisElemInd);
    } else { //插入颜色选择器
      that.removePicker(Class.thisElemInd);
      $('body').append(elemPicker);
    }

    // 记录当前执行的实例索引
    colorpicker.thisId = options.id;

    Class.thisElemInd = that.index; //记录最新打开的选择器索引
    Class.thisColor =  elemColorBox.style.background //记录最新打开的选择器颜色选中值

    that.position();
    that.pickerEvents();
  };

  //颜色选择器移除
  Class.prototype.removePicker = function(index){
    var that = this;
    var options = that.config;
    var elem = $('#layui-colorpicker'+ (index || that.index));

    if(elem[0]){
      elem.remove();
      delete colorpicker.thisId;

      // 面板关闭后的回调
      typeof options.close === 'function' && options.close(that.color);
    }

    return that;
  };

  //定位算法
  Class.prototype.position = function(){
    var that = this
    ,options = that.config;
    lay.position(that.bindElem || that.elemColorBox[0], that.elemPicker[0], {
      position: options.position
      ,align: 'center'
    });
    return that;
  };

  //颜色选择器赋值
  Class.prototype.val = function(){
    var that = this
    ,options = that.config

    ,elemColorBox = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)
    ,elemPickerInput = that.elemPicker.find('.' + PICKER_INPUT)
    ,e = elemColorBox[0]
    ,bgcolor = e.style.backgroundColor;

    //判断是否有背景颜色
    if(bgcolor){

      //转化成hsb格式
      var hsb = RGBToHSB(RGBSTo(bgcolor))
      ,type = elemColorBox.attr('lay-type');

      //同步滑块的位置及颜色选择器的选择
      that.select(hsb.h, hsb.s, hsb.b);

      // 若格式要求为rgb
      if(type === 'torgb'){
        elemPickerInput.find('input').val(bgcolor);
      } else if(type === 'rgba'){ // 若格式要求为 rgba
        var rgb = RGBSTo(bgcolor);

        // 若开启透明度而没有设置，则给默认值
        if((bgcolor.match(/[0-9]{1,3}/g) || []).length === 3){
          elemPickerInput.find('input').val('rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', 1)');
          that.elemPicker.find('.'+ PICKER_ALPHA_SLIDER).css("left", 280);
        } else {
          elemPickerInput.find('input').val(bgcolor);
          var left = bgcolor.slice(bgcolor.lastIndexOf(",") + 1, bgcolor.length - 1) * 280;
          that.elemPicker.find('.'+ PICKER_ALPHA_SLIDER).css("left", left);
        }

        // 设置 span 背景色
        that.elemPicker.find('.'+ PICKER_ALPHA_BG)[0].style.background = 'linear-gradient(to right, rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', 0), rgb('+ rgb.r +', '+ rgb.g +', '+ rgb.b +'))';
      } else {
        elemPickerInput.find('input').val('#'+ HSBToHEX(hsb));
      }
    } else {
      // 若没有背景颜色则默认到最初始的状态
      that.select(0,100,100);
      elemPickerInput.find('input').val("");
      that.elemPicker.find('.'+ PICKER_ALPHA_BG)[0].style.background = '';
      that.elemPicker.find('.'+ PICKER_ALPHA_SLIDER).css("left", 280);
    }
  };

  //颜色选择器滑动 / 点击
  Class.prototype.side = function(){
    var that = this
    ,options = that.config

    ,span = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)
    ,type = span.attr('lay-type')

    ,side = that.elemPicker.find('.' + PICKER_SIDE)
    ,slider = that.elemPicker.find('.' + PICKER_SIDE_SLIDER)
    ,basis = that.elemPicker.find('.' + PICKER_BASIS)
    ,choose = that.elemPicker.find('.' + PICKER_BASIS_CUR)
    ,alphacolor = that.elemPicker.find('.' + PICKER_ALPHA_BG)
    ,alphaslider = that.elemPicker.find('.' + PICKER_ALPHA_SLIDER)

    ,_h = slider[0].offsetTop/180*360
    ,_b = 100 - (choose[0].offsetTop)/180*100
    ,_s = (choose[0].offsetLeft)/260*100
    ,_a = Math.round(alphaslider[0].offsetLeft/280*100)/100

    ,i = that.elemColorBox.find('.' + PICKER_TRIG_I)
    ,pre = that.elemPicker.find('.layui-colorpicker-pre').children('div')

    ,change = function(x,y,z,a){
      that.select(x, y, z);
      var rgb = HSBToRGB({h:x, s:y, b:z});
      var color = HSBToHEX({h:x, s:y, b:z});
      var elemInput = that.elemPicker.find('.' + PICKER_INPUT).find('input');

      i.addClass(ICON_PICKER_DOWN).removeClass(ICON_PICKER_CLOSE);
      span[0].style.background = 'rgb('+ rgb.r +', '+ rgb.g +', '+ rgb.b +')';

      if(type === 'torgb'){
        elemInput.val('rgb('+ rgb.r +', '+ rgb.g +', '+ rgb.b +')');
      } else if(type  === 'rgba'){
        var left = a * 280;
        alphaslider.css("left", left);
        elemInput.val('rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', '+ a +')');
        span[0].style.background = 'rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', '+ a +')';
        alphacolor[0].style.background = 'linear-gradient(to right, rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', 0), rgb('+ rgb.r +', '+ rgb.g +', '+ rgb.b +'))'
      } else {
        elemInput.val('#'+ color);
      }

      //回调更改的颜色
      options.change && options.change($.trim(that.elemPicker.find('.' + PICKER_INPUT).find('input').val()));
    }

    //拖拽元素
    ,elemMove = $(['<div class="layui-auxiliar-moving" id="LAY-colorpicker-moving"></div>'].join(''))
    ,createMoveElem = function(call){
      $('#LAY-colorpicker-moving')[0] || $('body').append(elemMove);
      elemMove.on('mousemove', call);
      elemMove.on('mouseup', function(){
        elemMove.remove();
      }).on('mouseleave', function(){
        elemMove.remove();
      });
    };
    // 移动端滑动模拟事件中
    // 1. 不触发游标上绑定的事件，以提高性能，使滑动更流畅
    // 2. 游标上的事件需要冒泡到颜色拾取区域，用来模拟拖动游标的效果
    var needTrigger = true;
    var needStopPropagation = true;

    //右侧主色选择
    slider.on('mousedown', function(e, triggerEvent){
      var oldtop = this.offsetTop;
      var oldy = e.clientY === undefined ? triggerEvent.clientY : e.clientY;
      var move = function(e){
        var top = oldtop + (e.clientY - oldy)
        ,maxh = side[0].offsetHeight;
        if(top < 0)top = 0;
        if(top > maxh)top = maxh;
        var h = top/180*360;
        _h = h;
        change(h, _s, _b, _a);
        e.preventDefault();
      };
      needStopPropagation && layui.stope(e);
      createMoveElem(move);
      e.preventDefault();
    });

    side.on('mousedown', function(e){
      var top = e.clientY - $(this).offset().top + $win.scrollTop();
      if(top < 0)top = 0;
      if(top > this.offsetHeight) top = this.offsetHeight;
      var h = top/180*360;
      _h = h;
      change(h, _s, _b, _a);
      e.preventDefault();
      needTrigger && slider.trigger('mousedown', e);
    });

    //中间小圆点颜色选择
    choose.on('mousedown', function(e, triggerEvent){
      var oldtop = this.offsetTop;
      var oldleft = this.offsetLeft;
      var oldy = e.clientY === undefined ? triggerEvent.clientY : e.clientY;
      var oldx = e.clientX === undefined ?  triggerEvent.clientX : e.clientX;
      var move = function(e){
        var top = oldtop + (e.clientY - oldy)
        ,left = oldleft + (e.clientX - oldx)
        ,maxh = basis[0].offsetHeight
        ,maxw = basis[0].offsetWidth;
        if(top < 0)top = 0;
        if(top > maxh)top = maxh;
        if(left < 0)left = 0;
        if(left > maxw)left = maxw;
        var s = left/260*100
        ,b = 100 - top/180*100;
        _b = b;
        _s = s;
        change(_h, s, b, _a);
        e.preventDefault();
      };
      needStopPropagation && layui.stope(e);
      createMoveElem(move);
      e.preventDefault();
    });

    basis.on('mousedown', function(e){
      var top = e.clientY - $(this).offset().top + $win.scrollTop()
      ,left = e.clientX - $(this).offset().left + $win.scrollLeft()
      if(top < 0)top = 0;
      if(top > this.offsetHeight)top = this.offsetHeight;
      if(left < 0)left = 0;
      if(left > this.offsetWidth)left = this.offsetWidth;
      var s = left/260*100
      ,b = 100 - top/180*100;
      _b = b;
      _s = s;
      change(_h, s, b, _a);
      layui.stope(e);
      e.preventDefault();
      needTrigger && choose.trigger('mousedown', e);
    });

    //底部透明度选择
    alphaslider.on('mousedown', function(e, triggerEvent){
      var oldleft = this.offsetLeft;
      var oldx = e.clientX === undefined ? triggerEvent.clientX : e.clientX;
      var move = function(e){
        var left = oldleft + (e.clientX - oldx)
        ,maxw = alphacolor[0].offsetWidth;
        if(left < 0)left = 0;
        if(left > maxw)left = maxw;
        var a = Math.round(left /280*100) /100;
        _a = a;
        change(_h, _s, _b, a);
        e.preventDefault();
      };

      needStopPropagation && layui.stope(e);
      createMoveElem(move);
      e.preventDefault();
    });
    alphacolor.on('mousedown', function(e){
      var left = e.clientX - $(this).offset().left
      if(left < 0)left = 0;
      if(left > this.offsetWidth)left = this.offsetWidth;
      var a = Math.round(left /280*100) /100;
      _a = a;
      change(_h, _s, _b, a);
      e.preventDefault();
      needTrigger && alphaslider.trigger('mousedown', e);
    });

    //预定义颜色选择
    pre.each(function(){
      $(this).on('click', function(){
        $(this).parent('.layui-colorpicker-pre').addClass('selected').siblings().removeClass('selected');
        var color = this.style.backgroundColor
        ,hsb = RGBToHSB(RGBSTo(color))
        ,a = color.slice(color.lastIndexOf(",") + 1, color.length - 1),left;
        _h = hsb.h;
        _s = hsb.s;
        _b = hsb.b;
        if((color.match(/[0-9]{1,3}/g) || []).length === 3) a = 1;
        _a = a;
        left = a * 280;
        change(hsb.h, hsb.s, hsb.b, a);
      })
    });

    if(!lay.touchEventsSupported()) return;
    // 触摸事件模拟
    layui.each([
      {elem: side, eventType: 'mousedown'},
      {elem: alphacolor, eventType: 'mousedown'},
      {elem: basis, eventType: 'mousedown'}
    ], function(i, obj){
      lay.touchSwipe(obj.elem, {
        onTouchStart: function(){
          needTrigger = false;
          needStopPropagation = false;
        },
        onTouchMove: function(e){
          touchHandler(e, obj.eventType)
        },
        onTouchEnd: function(){
          elemMove.remove();
          needTrigger = true;
          needStopPropagation = true;
        }
      })
    })

    function touchHandler(event, eventType) {
      var pointer = event.touches[0];
      var simulatedEvent = document.createEvent("MouseEvent");

      simulatedEvent.initMouseEvent(eventType,
        true, true, window, 1,
        pointer.screenX, pointer.screenY,pointer.clientX, pointer.clientY,
        false, false, false, false, 0, null
      );
      pointer.target.dispatchEvent(simulatedEvent);
    }
  };

  //颜色选择器hsb转换
  Class.prototype.select = function(h, s, b, type){
    var that = this;
    var options = that.config;
    var hex = HSBToHEX({h:h, s:100, b:100});
    var color = HSBToHEX({h:h, s:s, b:b});
    var sidetop = h/360*180;
    var top = 180 - b/100*180;
    var left = s/100*260;
    var basisElem = that.elemPicker.find('.' + PICKER_BASIS)[0];

    that.elemPicker.find('.' + PICKER_SIDE_SLIDER).css("top", sidetop); //滑块的top
    basisElem.style.background = '#' + hex; //颜色选择器的背景

    //选择器的top left
    that.elemPicker.find('.' + PICKER_BASIS_CUR).css({
      "top": top / basisElem.offsetHeight * 100 + '%',
      "left": left / basisElem.offsetWidth * 100 + '%'
    });

    // if(type === 'change') return;

    // 选中的颜色
    // that.elemPicker.find('.' + PICKER_INPUT).find('input').val('#'+ color);
  };

  Class.prototype.pickerEvents = function(){
    var that = this
    ,options = that.config

    ,elemColorBoxSpan = that.elemColorBox.find('.' + PICKER_TRIG_SPAN) //颜色盒子
    ,elemPickerInput = that.elemPicker.find('.' + PICKER_INPUT + ' input') //颜色选择器表单

    ,pickerEvents = {
      //清空
      clear: function(othis){
        elemColorBoxSpan[0].style.background ='';
        that.elemColorBox.find('.' + PICKER_TRIG_I).removeClass(ICON_PICKER_DOWN).addClass(ICON_PICKER_CLOSE);
        that.color = '';

        options.done && options.done('');
        that.removePicker();
      }

      //确认
      ,confirm: function(othis, change){
        var value =  $.trim(elemPickerInput.val())
        ,colorValue
        ,hsb;

        if(value.indexOf(',') > -1){
          hsb = RGBToHSB(RGBSTo(value));
          that.select(hsb.h, hsb.s, hsb.b);
          elemColorBoxSpan[0].style.background = (colorValue = '#' + HSBToHEX(hsb));

          if((value.match(/[0-9]{1,3}/g) || []).length > 3 && elemColorBoxSpan.attr('lay-type') === 'rgba'){
            var left = value.slice(value.lastIndexOf(",") + 1, value.length - 1) * 280;
            that.elemPicker.find('.' + PICKER_ALPHA_SLIDER).css("left", left);
            elemColorBoxSpan[0].style.background = value;
            colorValue = value;
          }
        } else {
          hsb = HEXToHSB(value);
          elemColorBoxSpan[0].style.background = (colorValue = '#' + HSBToHEX(hsb));
          that.elemColorBox.find('.' + PICKER_TRIG_I).removeClass(ICON_PICKER_CLOSE).addClass(ICON_PICKER_DOWN);
        }

        if(change === 'change'){
          that.select(hsb.h, hsb.s, hsb.b, change);
          options.change && options.change(colorValue);
          return;
        }
        that.color = value;

        options.done && options.done(value);
        that.removePicker();
      }
    };

    //选择器面板点击事件
    that.elemPicker.on('click', '*[colorpicker-events]', function(){
      var othis = $(this)
      ,attrEvent = othis.attr('colorpicker-events');
      pickerEvents[attrEvent] && pickerEvents[attrEvent].call(this, othis);
    });

    //输入框事件
    elemPickerInput.on('keyup', function(e){
      var othis = $(this);
      pickerEvents.confirm.call(this, othis, e.keyCode === 13 ?  null : 'change');
    });
  }

  // 颜色选择器输入
  Class.prototype.events = function(){
    var that = this;
    var options = that.config;

    // 弹出颜色选择器
    that.elemColorBox.on('click' , function(){
      that.renderPicker();
      if($(ELEM_MAIN)[0]){
        that.val();
        that.side();
      }
    });
  };

  //全局事件
  (function(){
    //绑定关闭控件事件
    $doc.on(clickOrMousedown, function(e){
      if(!colorpicker.thisId) return;
      var that = thisModule.getThis(colorpicker.thisId);
      if(!that) return;

      var options = that.config;
      var elemColorBoxSpan = that.elemColorBox.find('.' + PICKER_TRIG_SPAN);

      //如果点击的元素是颜色框
      if($(e.target).hasClass(ELEM)
        || $(e.target).parents('.'+ELEM)[0]
      ) return;

      //如果点击的元素是选择器
      if($(e.target).hasClass(ELEM_MAIN.replace(/\./g, ''))
        || $(e.target).parents(ELEM_MAIN)[0]
      ) return;

      if(!that.elemPicker) return;

      if(that.color){
        var hsb = RGBToHSB(RGBSTo(that.color));
        that.select(hsb.h, hsb.s, hsb.b);
      } else {
        that.elemColorBox.find('.' + PICKER_TRIG_I).removeClass(ICON_PICKER_DOWN).addClass(ICON_PICKER_CLOSE);
      }
      elemColorBoxSpan[0].style.background = that.color || '';

      // 取消选择的回调
      typeof options.cancel === 'function' && options.cancel(that.color);

      // 移除面板
      that.removePicker();
    });

    //自适应定位
    $win.on('resize', function(){
      if(!colorpicker.thisId) return;
      var that = thisModule.getThis(colorpicker.thisId);
      if(!that) return;

      if(!that.elemPicker ||  !$(ELEM_MAIN)[0]){
        return false;
      }
      that.position();
    });
  })();

  // 记录所有实例
  thisModule.that = {}; // 记录所有实例对象

  // 获取当前实例对象
  thisModule.getThis = function(id){
    var that = thisModule.that[id];
    if(!that) hint.error(id ? (MOD_NAME +' instance with ID \''+ id +'\' not found') : 'ID argument required');
    return that;
  };

  //核心入口
  colorpicker.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  exports(MOD_NAME, colorpicker);
});
