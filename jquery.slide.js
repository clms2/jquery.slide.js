/**
 * 切换和无缝滚插件
 * @author qq:648003174
 */
$.fn.extend({
	/**
	 * 上左切换
	 * 
	 * @param object ul $(this) 需滚动元素的直接上级ul, ul>li
	 * @param number auto 自动
	 * @param number interval 自动切换时间
	 * @param number speed 切换速度
	 * @param number stepLen 切换数量
	 * @param number showNum 展示数量
	 * @param enum   pos left/top 运动方向
	 * @param object prev 上一个
	 * @param object next 下一个
	 * @param object control 控制的ul,$("ul"),可传递多个控制器,直接父级
	 * @param enum   ctltrigger click/hover 控制触发事件
	 * @param string easing 默认swing
	 * @param function beforeSlide 切换之前执行的函数,第一个参数为方向(prev/next)，第二个参数为移动个数，第三个参数为ul
	 * @param function afterSlide 切换之后执行的函数,参数为ul
	 * @param function click li点击事件
	 * @param boolean rewidth 是否重新计算li宽度，适用于li元素宽度不一致的情况(css里给li固定height,width:auto)
	 */
	slide:function(param){
		var config = $.extend({
				auto:1,
				interval:3000,
				speed:600,
				stepLen:1,
				showNum:3,
				pos:'left',
				prev:null,
				next:null,
				control:null,
				ctltrigger:'click',
				easing:'swing',
				afterSlide:null,
				beforeSlide:null,
				click:null,
				rewidth:false
			}, param),ul = $(this), li = ul.children(), num = li.length-1, wh, w = li.outerWidth(1), h = li.outerHeight(1),stop=0,ulcss = {},t,cur,wrap_div = ul.parent('.wrap_div'),max,shift,move,aobj = {};

		if(wrap_div.length == 0){
			var warp_css;
			switch(config['pos']){
				case 'left':
					max = config['showNum']*w;
					warp_css = 'width:'+max +'px;height:'+h+'px';
					ulcss['width'] = max+num*w+'px';
					ulcss['top'] = 0;
					li.css('float','left');
					wh = w;
				break;
				case 'top':
					max = config['showNum']*h;
					warp_css = 'height:'+max+'px;width:'+w+'px';
					ulcss['height'] = max+num*h+'px';
					ulcss['left'] = 0;
					wh = h;
				break;
				default:
					alert('unsupport position:'+config['pos']);
					return;
			}
			ul.wrap('<div class="wrap_div" style="position:relative;overflow:hidden;'+warp_css+'"></div>')
			ulcss['position'] = 'absolute';
			ulcss['overflow'] = 'hidden';
			ul.css(ulcss)
		}
		if(config['control'] != null){
			li.each(function(){
				$(this).attr('index',$(this).index());
			});
		}

		switch(config['pos']){
			case 'top':
			case 'left':
				shift = function(p, len){
					if(typeof p == 'undefined') var p = 'next';
					if(typeof len == 'undefined') var len = config['stepLen'];

					ul.stop(true, true);
					if(config['rewidth']){
						cur = 0;
						ul.children().filter(':lt('+len+')').map(function(){
							cur += $(this).outerWidth(1);
						})
					}else{
						cur = wh*len;
					}
					
					aobj[config['pos']] = -cur + 'px';
					if(config['control'] != null){
						var i = p == 'next' ? len : (num-len+1);
						i = ul.children().eq(i).attr('index');
						config['control'].each(function(){
							$(this).children().eq(i).addClass('in').siblings().removeClass('in');
						});
					}
					if(config['beforeSlide'] != null) config['beforeSlide'].call(null, p, len, ul);
					if(p == 'next'){
						ul.append(ul.children().filter(':lt('+len+')').clone(true,true));
						ul.animate(aobj, config['speed'], config['easing'], function(){
							ul.children().filter(':lt('+len+')').remove();
							aobj[config['pos']] = 0;
							ul.css(aobj);
							if(config['afterSlide'] != null) config['afterSlide'].call(null, $(this));
						})
					}else if(p == 'prev'){
						ul.prepend(ul.children().filter(':gt('+(num-len)+')').clone(true,true)).css(aobj);
						aobj[config['pos']] = 0;
						ul.animate(aobj, config['speed'], config['easing'], function(){
							ul.children().filter(':gt('+num+')').remove();
							if(config['afterSlide'] != null) config['afterSlide'].call(null, $(this));
						})
					}
				}
				move = function(){
					if(!config['auto']) return;
					t = setInterval(shift, config['interval']);
				};
				move();
			break;
			default:
				return;
		}
		var obj = ul;
		if(config['next'] != null){
			obj = obj.add(config['next']);
			config['next'].click(function() {
				clearInterval(t);
				shift('next',1);
				move();
			});
		}
		if(config['prev'] != null){
			obj = obj.add(config['prev']);
			config['prev'].click(function() {
				clearInterval(t);
				shift('prev',1);
				move();
			});
		}
		obj.hover(function() {
			clearInterval(t);
		}, function() {
			clearInterval(t);
			move();
		});
		if(config['click'] != null){
			ul.children().click(function() {
				config['click'].call(null, $(this));
			});
		}
		if(config['control'] != null){
			if(config['ctltrigger'] == 'hover') config['ctltrigger'] = 'mouseover';
			config['control'].each(function(){
				var chd = $(this).children();
				chd.bind(config['ctltrigger'],function(){
					clearInterval(t);
					var tari = $(this).index(),curi = ul.children().filter(':first').attr('index');
					if(tari == curi) {
						move();
						return;
					}
					var p = tari < curi ? 'prev' : 'next';
					shift(p, Math.abs(tari-curi));
					$(this).addClass('in').siblings().removeClass('in');
				});
				chd.mouseout(function() {
					clearInterval(t);
					move();
				});
			});
			
		}
	},
	/**
	 * 上下左无缝滚动
	 * 
	 * @param object ul $(this) 需滚动li的直接父级
	 * @param number config['showNum']
	 * @param enum config['pos'] left/top/bottom
	 * @param number config['speed']
	 * @param int step 点击prev next加速移动的li数量  pos为top或bottom不支持prev next step 暂时不折腾了 要用到的时候再说~
	 * @param jquery object prev 加速往前按钮
	 * @param jquery object next 加速往后按钮
	 * @param function click li点击事件
	 */
	nslide:function(param){
		var config = $.extend({
			speed:9000,
			speedup:700,
			pos:'left',
			showNum:2,
			step:1,
			click:null,
			prev:null,
			next:null
		},param);
		var ul = $(this), li = ul.children(), len = li.length;
		var wh, max, cur, init, licss = {}, ulcss = {}, wrap_css, move, uwh,w = li.outerWidth(1),h=li.outerHeight(1),hasBind=ul.parent('.nslide_wrap').length == 1,t,aobj={},left_time,fn;

		if(!hasBind){
			switch(config['pos']){
				case 'left':
				// case 'right':
					wh = w;
					uwh = 'width';
					licss['float'] = 'left';
					wrap_css = 'width:'+config['showNum']*wh + 'px;height:'+h+'px;';
				break;
				case 'top':
				case 'bottom':
					wh = h;
					uwh = 'height';
					wrap_css = 'height:'+wh*config['showNum']+'px;width:'+w+'px';
				break;
				default:
					alert('unsupport position:'+config['pos']);
					return;
			}
			max = wh * len;
			ulcss['position'] = 'relative';
			ulcss[uwh] = max+wh*config['showNum']+'px';
			li.css(licss);
			ul.css(ulcss);
			ul.wrap('<div class="nslide_wrap" style="position:relative;overflow:hidden;'+wrap_css+'"></div>');
		}else{
			wh = (config['pos'] == 'left' || config['pos'] == 'right') ? w : h;
			max = (len - config['showNum']) * wh;
		}


		// /
		function accDiv(arg1,arg2){
			var t1=0,t2=0,r1,r2;
			try{t1=arg1.toString().split(".")[1].length}catch(e){} 
			try{t2=arg2.toString().split(".")[1].length}catch(e){}
			with(Math){
			r1=Number(arg1.toString().replace(".",""))
			r2=Number(arg2.toString().replace(".",""))
			return (r1/r2)*pow(10,t2-t1);
			}
		} 
		Number.prototype.div = function (arg){ 
			return accDiv(this, arg); 
		}
		// *
		function accMul(arg1,arg2){ 
			var m=0,s1=arg1.toString(),s2=arg2.toString(); 
			try{m+=s1.split(".")[1].length}catch(e){} 
			try{m+=s2.split(".")[1].length}catch(e){} 
			return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
		}
		Number.prototype.mul = function (arg){
			return accMul(arg, this); 
		}
		var time_per_px = config['speed'].div(max);//移动1px需要的时间
		if(config['prev'] || config['next']){
			// var time_step = time_per_px.mul(wh.mul(config['step']));//点击next需要加速的时间
			var speedup_distance = wh*config['step'];//加速移动的距离
				
		}

		switch(config['pos']){
			case 'bottom':
			case 'right':
				if(!hasBind) ul.prepend(ul.children().filter(':gt('+(len-config['showNum']-1)+')').clone());
				init = (config['showNum']+1)*wh;
				cur = ul.css(config['pos']) != '0px' ? ul.css(config['pos']).replace('px','') : init;
				if(cur == 'auto') cur = 0;
				move = function(){
					t = setInterval(function(){
						eval('ul.css("'+config['pos']+'","'+cur+'px'+'")');
						if(--cur < 0) cur = init;
					}, config['speed']);
				}
			break;
			case 'top':
			case 'left':
				if(!hasBind) ul.append(ul.children().filter(':lt('+config['showNum']+')').clone());
				
				move = function(p){
					//获取初始位置
					init = ul.css(config['pos']);
					init = init == 'auto' ? 0 : Math.abs(parseInt(init));
					//计算从初始位置移动一个周期结束剩下所需的时间,保持匀速
					left_distance = max-init;//到一周期结束剩下的距离
					if(init != 0){
						left_time = Math.round(left_distance.mul(time_per_px));//剩余时间
					}else{
						left_time = config['speed'];
					}
					if(typeof p != 'undefined'){
						if(p == 'next'){
							//如果无缝滚的时候点击next时正好当前是最后一个的一半，那么先要把最后一个的一半滚完，再从头开始滚另一半
							//正常就不用
							if(left_distance >= speedup_distance){
								ul.animate({left:'-='+speedup_distance+'px'},config['speedup'],'linear',function(){move()});
							}else{
								//计算移动第一半的时候
								var time_left = Math.round(left_distance.div(speedup_distance).mul(config['speedup']));
								ul.animate({left:'-='+left_distance+'px'},time_left,'linear',function(){
									$(this).css(config['pos'],0);
									//第二半
									ul.animate({left:'-='+(speedup_distance-left_distance)+'px'},config['speedup']-time_left,'linear',function(){move()});
								});
							}
						}else{
							//判断初始位置是否够一个步长的滚动距离
							if(init >= speedup_distance){
								ul.animate({left:'+='+speedup_distance+'px'},config['speedup'],'linear',function(){move()});
							}else{
								//计算移动第一半的时候
								var time_left = Math.round(config['speedup'].div(speedup_distance).mul(init));
								ul.animate({left:'+='+init+'px'},time_left,'linear',function(){
									$(this).css(config['pos'],-max);
									//第二半
									ul.animate({left:'+='+(speedup_distance-init)+'px'},config['speedup']-time_left,'linear',function(){move()});
								});
							}
						}
						return;
					}
					aobj[config['pos']] = '-=' + left_distance + 'px';
					ul.animate(aobj, left_time, 'linear', function(){
						$(this).css(config['pos'], 0);
						aobj[config['pos']] = -max;
					});
					fn = function(){
						ul.stop(true,true).animate(aobj, config['speed'], 'linear', function(){
							$(this).css(config['pos'], 0);
						});
						t = setTimeout(fn, config['speed']);
					};
					t = setTimeout(fn, left_time);
				}
			break;
		}
		if(config['pos'] != 'top' && config['pos'] != 'bottom'){
			if(config['prev'] != null){
				config['prev'].click(function(){
					clearInterval(t);
					ul.stop(true);
					move('prev');
				})
			}
			if(config['next'] != null){
				config['next'].click(function(){
					clearInterval(t);
					ul.stop(true);
					move('next');
				})
			}
		}

		ul.children().hover(function(){
			clearInterval(t);
			ul.stop(true);
		},function(){
			clearInterval(t);
			move();
		});
		if(config['click'] != null){
			ul.children().click(function() {
				config['click'].call(null, $(this));
			});
		}
		move();
	}
})