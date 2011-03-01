window.Modernizr=function(a,b,c){function G(){}function F(a,b){var c=a.charAt(0).toUpperCase()+a.substr(1),d=(a+" "+p.join(c+" ")+c).split(" ");return!!E(d,b)}function E(a,b){for(var d in a)if(k[a[d]]!==c&&(!b||b(a[d],j)))return!0}function D(a,b){return(""+a).indexOf(b)!==-1}function C(a,b){return typeof a===b}function B(a,b){return A(o.join(a+";")+(b||""))}function A(a){k.cssText=a}var d="1.7",e={},f=!0,g=b.documentElement,h=b.head||b.getElementsByTagName("head")[0],i="modernizr",j=b.createElement(i),k=j.style,l=b.createElement("input"),m=":)",n=Object.prototype.toString,o=" -webkit- -moz- -o- -ms- -khtml- ".split(" "),p="Webkit Moz O ms Khtml".split(" "),q={svg:"http://www.w3.org/2000/svg"},r={},s={},t={},u=[],v,w=function(a){var c=b.createElement("style"),d=b.createElement("div"),e;c.textContent=a+"{#modernizr{height:3px}}",h.appendChild(c),d.id="modernizr",g.appendChild(d),e=d.offsetHeight===3,c.parentNode.removeChild(c),d.parentNode.removeChild(d);return!!e},x=function(){function d(d,e){e=e||b.createElement(a[d]||"div");var f=(d="on"+d)in e;f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=C(e[d],"function"),C(e[d],c)||(e[d]=c),e.removeAttribute(d))),e=null;return f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),y=({}).hasOwnProperty,z;C(y,c)||C(y.call,c)?z=function(a,b){return b in a&&C(a.constructor.prototype[b],c)}:z=function(a,b){return y.call(a,b)},r.csstransforms3d=function(){var a=!!E(["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"]);a&&"webkitPerspective"in g.style&&(a=w("@media ("+o.join("transform-3d),(")+"modernizr)"));return a};for(var H in r)z(r,H)&&(v=H.toLowerCase(),e[v]=r[H](),u.push((e[v]?"":"no-")+v));e.input||G(),e.crosswindowmessaging=e.postmessage,e.historymanagement=e.history,e.addTest=function(a,b){a=a.toLowerCase();if(!e[a]){b=!!b(),g.className+=" "+(b?"":"no-")+a,e[a]=b;return e}},A(""),j=l=null,e._enableHTML5=f,e._version=d,g.className=g.className.replace(/\bno-js\b/,"")+" js "+u.join(" ");return e}(this,this.document)

FS = {};
FS.HSLSlider = new Class({
  Implements: Options,
  Binds: 'click',

  options: {
    start: 0,
    steps: 100,
    range: [0, 100],
    snap: true
  },

  initialize: function(options){
    this.setOptions(options);
    this.styles = new Element('style');
    document.head.grab(this.styles);
    this.color = new FS.Color([Number.random(0, 360), 100, 50], {'type':'hsl'});;
    this.hue = this.createSlider($('hue'), this.color.h(), 'hue');
    this.saturation = this.createSlider($('saturation'), this.color.s(), 'sat');
    this.lightness = this.createSlider($('lightness'), this.color.l(), 'light');
    this.updateStyles();
    this.hexInput = $('hex').addEvent('keyup', this.changeHex.bind(this));
    this.rgbInput = $('rgb').addEvent('keyup', this.changeRgb.bind(this));
    this.hslInput = $('hsl').addEvent('keyup', this.changeHsl.bind(this));
    this.hslPicker = $('hsl_picker').addEvent('keyup', this.enterVal.bind(this));
    this.setColorValues();
  },

  createSlider: function(el, start, type){
    var range = el.get('max') ? [0, el.get('max')] : this.options.range;
    var thumb = el.getFirst('div.thumb');
    //if (this.options.snap){
      //var barWidth = el.getStyle('width').toInt();
      //var knobWidth = 20;//thumb.getStyle('width').toInt();
      //var numSteps = range[1].toInt();
      //var idealWidth = (Math.ceil(barWidth/numSteps - knobWidth/numSteps) * numSteps) + knobWidth;
      //console.log(idealWidth);
      //if (barWidth != idealWidth){ el.setStyle('width', idealWidth); }
    //}
    var slider = new SliderEx(el, thumb, {
      range: range,
      steps: range[1],
      initialStep: start,
      snap: this.options.snap,
      onChange: this.changeSlider.bind(this)
    });
    slider.type = type;
    return slider;
  },

  setHsl: function(hsl){
    this.color.set(hsl, 'hsl');
    this.setColorValues();
  },

  setRgb: function(rgb){
    this.color.set(rgb, 'rgb');
    this.setColorValues();
  },

  setHex: function(hex){
    this.color.set(hex, 'hex');
    this.setColorValues();
  },

  setColorValues: function(){
    //set bottom row values

    if (this.rgbInput.value != this.color.getRgb()) this.rgbInput.set('value', this.color.getRgb()).removeClass('error');
    if (this.hslInput.value != this.color.getHsl()) this.hslInput.set('value', this.color.getHsl()).removeClass('error');
    if (this.hexInput.value != this.color.getHex()) this.hexInput.set('value', this.color.getHex()).removeClass('error');

    //Set slider values
    var h = $('h'); var s = $('s'); var l = $('l');
    if(h.value != this.color.h()) h.set('value', this.color.h()).removeClass('error');
    if(s.value != this.color.s()) s.set('value', this.color.s()).removeClass('error');
    if(l.value != this.color.l()) l.set('value', this.color.l()).removeClass('error');

    //set sliders
    this.hue.set(this.color.h().round());
    this.saturation.set(this.color.s().round());
    this.lightness.set(this.color.l().round());

    this.updateStyles();
  },

  updateStyles: function(){
    sliderStyles = '#hsl_picker #hue { background-image: ' + this.sliderBg('hue', 'webkit') + '; background-image: ' + this.sliderBg('hue', 'moz') + '; background-image: ' + this.sliderBg('hue') + '; } ' +
      '#hsl_picker #saturation { background-image: ' + this.sliderBg('saturation', 'webkit') + ';  background-image: ' + this.sliderBg('saturation', 'moz') + '; background-image: ' + this.sliderBg('saturation') + '; } ' +
      '#hsl_picker #lightness { background-image: ' + this.sliderBg('lightness', 'webkit') + ';  background-image: ' + this.sliderBg('lightness', 'moz') + '; background-image: ' + this.sliderBg('lightness') + '; } ' +
      'body a:hover { color: '+ this.color.getHsl([this.color.h(), 100, 70]) +'; } '+
      'h1 + p { color: '+ this.color.getHsl([this.color.h(), 40, 70]) +'; } '+
      'body h2, body h3, code { color:'+ this.color.getHsl([this.color.h(), 20, 70]) +'; }';

    this.styles.set('text', sliderStyles);

    $$('h1')[0].setStyle('text-shadow', this.getTextShadow());
    $('frame').setStyle('background-color', this.color.getHex());
    $('color').setStyle('background', this.color.getHex());
    $('shadow').setStyle('background', this.getShadow());
  },

  sliderBg: function(type, browser){
    var H = this.color.h();
    var S = this.color.s();
    var L = this.color.l();
    var colors = []
    if (type == 'hue') for(i=0;i<36;i++){ colors.push('#'+this.color.hslToHex([i*10, S, L], 1)); }
    else if(type == 'saturation') for(i=0;i<3;i++){ colors.push('#'+this.color.hslToHex([H, i*50, L], 1)); }
    else if(type == 'lightness') for(i=0;i<3;i++){ colors.push('#'+this.color.hslToHex([H, S, i*50], 1)); }

    return this.gradientBG(colors, browser);
  },

  gradientBG: function(colors, browser){
    var bg = '';
    if (browser == "webkit") {
      bg = '-webkit-gradient(linear, 0% 50%, 100% 50%, from('+colors[0]+'),';
      for(i=1;i<colors.length - 1; i++){
        bg += 'color-stop('+i/(colors.length -1)+','+colors[i]+'),'
      }
      bg += 'to('+colors[colors.length-1]+'))';
    } else {
      if (browser == "moz") { bg = '-moz-' }
      bg += 'linear-gradient(left, ';
      bg += colors.join(', ');
      bg += ')';
    }
    return bg;
  },

  getShadow: function(){
    var sat = this.color.s();
    var lit = this.color.l();
    var s = sat;
    var l = lit - lit * .35;
    s = sat*(100 - lit)/100;
    var color = [this.color.h(), s, l];
    return this.color.getHsl(color);
  },

  getTextShadow: function(){
    s = (this.color.l() < 35) ? 30 : ((this.color.l() > 80) ? 30 : this.color.s());
    l = (this.color.l() < 35) ? 35 : ((this.color.l() > 80) ? 80 : this.color.l());
    var color = [this.color.h(), s/2.7, l];
    var colors = [];
    for(i=1; i<=5; i++){
      colors.push(this.color.getHsl(this.color.change(0, 0, (-5.5 * (i-1)).round(), color)));
    }
    return colors[0]+' 0px 1px 0px, '+
    colors[1]+' 0px 2px 0px, '+
    colors[2]+' 0px 3px 0px, '+
    colors[3]+' 0px 4px 0px, '+
    //colors[4]+' 0px 5px 0px, '+
    'rgba(0, 0, 0, 0.2) 0px 5px 1px, '+
    'rgba(0, 0, 0, 0.3) 0px 0px 10px, '+
    'rgba(0, 0, 0, 0.4) 0px 3px 5px, '+
    'rgba(0, 0, 0, 0.5) 0px 6px 5px, '+
    'rgba(0, 0, 0, 0.6) 0px 10px 10px';
  },

  changeSlider: function(val, slider){
    if (typeof(slider.type) != 'undefined' && this.color.get(slider.type).round() != val){
      this.setHsl([this.hue.step, this.saturation.step, this.lightness.step], 'hsl');
    }
  },

  enterVal: function(event){
    if(!isNaN(event.target.value)){
      event.target.removeClass('error');
      max = this[event.target.getPrevious().id].range;
      var val = parseInt(event.target.value);
      if (event.key == 'up') {
        event.target.value= (val + 5 > max) ? max : val + 5;
      } else if (event.key == 'down') {
        event.target.value = (val -5 < 0) ? 0 : val - 5;
      }
      var inputs = this.hslPicker.getElements('input');
      var hsl = inputs.map(function(item, index){ return parseInt(item.value) });

      if(this.validHsl(hsl)){
        if(!hsl.equalTo(this.hsl)) this.setHsl(hsl);
      }else{
        event.target.addClass('error');
      }
    }else{
      event.target.addClass('error');
    }
  },

  changeHex: function(event){
    hex = this.hexInput.value;
    this.hexInput.removeClass('error');
    if(this.color.valid(hex, 'hex') && hex != this.color.getHex()){
      this.setHex(hex);
    }else if(!this.color.valid(hex, 'hex')) {
      this.hexInput.addClass('error');
    }
  },

  changeRgb: function(event){
    rgb = this.rgbInput.value
    this.rgbInput.removeClass('error');
    if(this.color.valid(rgb, 'rgb') && rgb != this.color.getRgb()){
      this.setRgb(rgb);
    }else if(!this.color.valid(rgb, 'rgb')) {
      this.rgbInput.addClass('error');
    }
  },

  changeHsl: function(event){
    hsl = this.hslInput.value
    this.hslInput.removeClass('error');
    if(this.color.valid(hsl, 'hsl') && hsl != this.color.getHsl()){
      this.setHsl(hsl);
    }else if(!this.color.valid(hsl, 'hsl')) {
      this.hslInput.addClass('error');
    }
  }
});

var SliderEx = new Class({

	Extends: Slider,

	// Binds does not support inheritance..
	// Therefore, we have to declare the new bindings as well as the existing ones.
	Binds: ['clickedElement', 'draggedKnob', 'scrolledElement',
			'releasedElement', 'draggedKnob'],

	releasedElement: function(event) {
        this.fireEvent('move', this.knob.offsetLeft);
        this.fireEvent('complete', this.step + '');
		document.removeEvent('mousemove', this.clickedElement);
		document.removeEvent('mouseup', this.releasedElement);
	},

	clickedElement: function(event) {
		if (event.target != this.knob) {
			event.stop();
			document.addEvent('mousemove', this.clickedElement);
		}
		document.addEvent('mouseup', this.releasedElement);
        this.fireEvent('move', this.knob.offsetLeft);
		this.parent(event);
	},


    draggedKnob: function() {
      this.fireEvent('move', this.drag.value.now[this.axis]);
      var dir = this.range < 0 ? -1 : 1;
      var position = this.drag.value.now[this.axis];
      position = position.limit(-this.options.offset, this.full -this.options.offset);
      this.step = Math.round(this.min + dir * this.toStep(position));
      this.checkStep();
    },

    checkStep: function(){
      var step = this.step;
      if (this.previousChange != step){
          this.previousChange = step;
          this.fireEvent('change', [step, this]);
      }
      return this;
	}
});
FS.Color = new Class({
  Implements: Options,

  options: {
    type: 'hex'
  },

  initialize: function(color, options){
    this.setOptions(options);
    this.set(color, this.options.type);
  },

  valid: function(color, type){
    if(type == "hex"){
      if(color.test(/^(#)?([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/)) color = this.strToHex(color);
      else color = false;
    } else if (type == "rgb") {
      if(typeof(color) == "string"){ color = this.strToRgb(color); }
      if(!color.every(function(item, index){ return (item >= 0) && (item <= 255) })){
        color = false;
      }
    } else if (type == "hsl") {
      if(typeof(color) == "string"){ color = this.strToHsl(color); }
      if(!color.every(function(item, index){ return (index == 0 && item >= 0 && item <= 360) || (index > 0 && item >= 0 && item <= 100) })){
        color = false;
      }
    } else {
      color = false;
    }
    return color;
  },

  getHex: function(string) {
    return '#'+this.hex;
  },

  getRgb: function(rgb) {
    var rgb = (typeof(rgb) == 'undefined') ? this.rgb : this.valid(rgb, 'rgb');
    return "rgb(" + rgb.join(", ") + ")";
  },

  getHsl: function(hsl){
    var hsl = (typeof(hsl) == 'undefined') ? this.hsl : this.valid(hsl, 'hsl');
    return "hsl("+ hsl[0] +", "+ hsl[1] +"%, "+ hsl[2] +"%)";
  },

  h: function(){
    return this.hsl[0];
  },

  s: function(){
    return this.hsl[1];
  },

  l: function() {
    return this.hsl[2];
  },

  r: function() {
    return this.rgb[0];
  },

  g: function() {
    return this.rgb[1];
  },

  b: function() {
    return this.rgb[2];
  },

  get: function(string){
    if(string == 'hue') return this.h();
    if(string == 'sat') return this.s();
    if(string == 'light') return this.l();
  },

  set: function(color, type){
    color = this.valid(color, type);
    if(color){
      if(type == 'hex'){
        this.hex = color;
        this.rgb = this.hexToRgb(color);
        this.hsl = this.hexToHsl(color);
      } else if (type == 'rgb') {
        this.hex = this.rgbToHex(color);
        this.rgb = color;
        this.hsl = this.rgbToHsl(color);
      } else if (type == 'hsl') {
        this.hex = this.hslToHex(color);
        this.rgb = this.hslToRgb(color);
        this.hsl = color;
      }
    }
    return color;
  },

  change: function(h,s,l, color){
    h = (typeof(h) == 'undefined') ? 0 : h;
    s = (typeof(s) == 'undefined') ? 0 : s;
    l = (typeof(l) == 'undefined') ? 0 : l;
    color = (typeof(color) == 'undefined') ? this.hsl : color;
    return [color[0] + h, color[1] + s, color[2] + l];
  },

  compareHex: function(color1, color2){
    color2 = (typeof(color2) == 'undefined') ? this.hex : color2;
    c2 = this.hexToHsl(this.valid(color2, 'hex'));
    c1 = this.hexToHsl(this.valid(color1, 'hex'));
    var h = (c1[0] - c2[0]);
    var s = (c1[1] - c2[1]);
    var l = (c1[2] - c2[2]);
    var msg = '#'+color2+" is "+Math.abs(h.round(3))+((h > 0) ? ' degrees higher' : ' degrees lower')+', '+
    Math.abs(s)+'%'+((s > 0) ? ' less saturated' : ' more saturated') + ', and ' +
    Math.abs(l) + '%'+((l > 0) ? ' darker' : ' lighter') + ' than #' + color1 + '.';
    return msg;
  },

  strToRgb: function(rgb){
    return rgb.replace(/rgb\(/, '').replace(/\)/, '').replace(/;/, '').clean().split(',').map(function(item, index) { return parseFloat(item); });
  },

  strToHsl: function (hsl){
    return hsl.replace(/hsl\(/, '').replace(/\)/, '').replace(/;/, '').replace(/\%/, '').clean().split(',').map(function(item, index) { return parseFloat(item); });
  },

  strToHex: function(hex){
    return hex.replace(/\#/, '').clean();
  },

  hslToHex: function(hsl) {
    return this.rgbToHex(this.hslToRgb(hsl));
  },

  hexToHsl: function(hex){
    return this.rgbToHsl(this.hexToRgb(hex));
  },

  rgbToHex: function(rgb) {
    var r = parseFloat(rgb[0]).toString(16);
    var g = parseFloat(rgb[1]).toString(16);
    var b = parseFloat(rgb[2]).toString(16);
    if (r.length === 1) r = "0" + r;
    if (g.length === 1) g = "0" + g;
    if (b.length === 1) b = "0" + b;
    return (r + g + b).toUpperCase();
  },

  toLongHex: function(hex){
    if(hex.length < 6){
      return hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    } else {
      return hex;
    }
  },

  hexToRgb: function(hex) {
    hex = this.toLongHex(hex);
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);

    return [r, g, b];
  },

  hslToRgb: function(hsl) {
    var h = parseInt(hsl[0]) / 360;
    var s = parseInt(hsl[1]) / 100;
    var l = parseInt(hsl[2]) / 100;

    if (l <= 0.5) var q = l * (1 + s);
    else var q = l + s - (l * s);

    var p = 2 * l - q;
    var tr = h + (1 / 3);
    var tg = h;
    var tb = h - (1 / 3);

    var r = Math.round(this.hueToRgb(p, q, tr) * 255);
    var g = Math.round(this.hueToRgb(p, q, tg) * 255);
    var b = Math.round(this.hueToRgb(p, q, tb) * 255);
    return [r, g, b];
  },

  hueToRgb: function(p, q, h) {
    if (h < 0) h += 1;
    else if (h > 1) h -= 1;

    if ((h * 6) < 1) return p + (q - p) * h * 6;
    else if ((h * 2) < 1) return q;
    else if ((h * 3) < 2) return p + (q - p) * ((2 / 3) - h) * 6;
    else return p;
  },

  rgbToHsl: function(rgb) {
    var r = parseFloat(rgb[0]) / 255;
    var g = parseFloat(rgb[1]) / 255;
    var b = parseFloat(rgb[2]) / 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var diff = max - min;
    var add = max + min;

    if (min === max) var h = 0;
    else if (r === max) var h = ((60 * (g - b) / diff) + 360) % 360;
    else if (g === max) var h = (60 * (b - r) / diff) + 120;
    else var h = (60 * (r - g) / diff) + 240;

    var l = 0.5 * add;

    if (l === 0) var s = 0;
    else if (l === 1) var s = 1;
    else if (l <= 0.5) var s = diff / add;
    else var s = diff / (2 - add);

    h = h.round(3);
    s = (s*100).round(3);
    l = (l*100).round(3);

    return [h, s, l];
  }
})

window.addEvent('domready', function(){
  new FS.HSLSlider();
});


// Map mouse events to touch events

(function() {
  try {
    document.createEvent("TouchEvent");
  } catch(e) {
    return;
  }

  ['touchstart', 'touchmove', 'touchend'].each(function(type){
      Element.NativeEvents[type] = 2;
  });

  var mapping = {
    'mousedown': 'touchstart',
    'mousemove': 'touchmove',
    'mouseup': 'touchend'
  };

  var condition = function(event) {
    var touch = event.event.changedTouches[0];
    event.page = {
      x: touch.pageX,
      y: touch.pageY
    };
    return true;
  };

  for (var e in mapping) {
    Element.Events[e] = {
      base: mapping[e],
      condition: condition
    };
  }
})();

Array.implement({
  equalTo: function(arr){
    if(this.length !== arr.length){
      return false;
    }
    for(var i = this.length - 1; i >= 0; i--){
      if(this[i] !== arr[i]){
        return false;
      }
    }
    return true;
  }
});
