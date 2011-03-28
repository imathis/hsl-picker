window.Modernizr=function(a,b,c){function G(){}function F(a,b){var c=a.charAt(0).toUpperCase()+a.substr(1),d=(a+" "+p.join(c+" ")+c).split(" ");return!!E(d,b)}function E(a,b){for(var d in a)if(k[a[d]]!==c&&(!b||b(a[d],j)))return!0}function D(a,b){return(""+a).indexOf(b)!==-1}function C(a,b){return typeof a===b}function B(a,b){return A(o.join(a+";")+(b||""))}function A(a){k.cssText=a}var d="1.7",e={},f=!0,g=b.documentElement,h=b.head||b.getElementsByTagName("head")[0],i="modernizr",j=b.createElement(i),k=j.style,l=b.createElement("input"),m=":)",n=Object.prototype.toString,o=" -webkit- -moz- -o- -ms- -khtml- ".split(" "),p="Webkit Moz O ms Khtml".split(" "),q={svg:"http://www.w3.org/2000/svg"},r={},s={},t={},u=[],v,w=function(a){var c=b.createElement("style"),d=b.createElement("div"),e;c.textContent=a+"{#modernizr{height:3px}}",h.appendChild(c),d.id="modernizr",g.appendChild(d),e=d.offsetHeight===3,c.parentNode.removeChild(c),d.parentNode.removeChild(d);return!!e},x=function(){function d(d,e){e=e||b.createElement(a[d]||"div");var f=(d="on"+d)in e;f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=C(e[d],"function"),C(e[d],c)||(e[d]=c),e.removeAttribute(d))),e=null;return f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),y=({}).hasOwnProperty,z;C(y,c)||C(y.call,c)?z=function(a,b){return b in a&&C(a.constructor.prototype[b],c)}:z=function(a,b){return y.call(a,b)},r.csstransforms3d=function(){var a=!!E(["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"]);a&&"webkitPerspective"in g.style&&(a=w("@media ("+o.join("transform-3d),(")+"modernizr)"));return a};for(var H in r)z(r,H)&&(v=H.toLowerCase(),e[v]=r[H](),u.push((e[v]?"":"no-")+v));e.input||G(),e.crosswindowmessaging=e.postmessage,e.historymanagement=e.history,e.addTest=function(a,b){a=a.toLowerCase();if(!e[a]){b=!!b(),g.className+=" "+(b?"":"no-")+a,e[a]=b;return e}},A(""),j=l=null,e._enableHTML5=f,e._version=d,g.className=g.className.replace(/\bno-js\b/,"")+" js "+u.join(" ");return e}(this,this.document)

FS = {};
FS.HSLSlider = new Class({
  Implements: Options,
  Binds: 'click',

  options: {
    start: 0,
    steps: 100,
    range: [0, 100],
    snap: true,
    color: false
  },

  initialize: function(options){
    this.setOptions(options);
    this.styles = new Element('style');
    document.head.grab(this.styles);
    if(!this.getColorUrl()) {
      this.color = new FS.Color([Number.random(0, 360), 100, 50], 'hsl');;
    }
    this.hue = this.createSlider($('hue'), this.color.hue());
    this.saturation = this.createSlider($('saturation'), this.color.sat());
    this.luminosity = this.createSlider($('luminosity'), this.color.lum());
    this.updateStyles();
    this.hexInput = $('hex').addEvent('keyup', this.changeHex.bind(this));
    this.rgbInput = $('rgb').addEvent('keyup', this.changeRgb.bind(this));
    this.hslInput = $('hsl').addEvent('keyup', this.changeHsl.bind(this));
    this.hslPicker = $('hsl_picker').addEvent('keyup', this.enterVal.bind(this));
    this.setColorValues();
  },

  createSlider: function(el, start){
    var range = el.get('max') ? [0, el.get('max')] : this.options.range;
    var thumb = el.getFirst('div.thumb');
    var slider = new SliderEx(el, thumb, {
      range: range,
      steps: range[1],
      initialStep: start,
      snap: this.options.snap,
      onChange: this.changeSlider.bind(this)
    });
    return slider;
  },

  getColorUrl: function(){
    var url = window.location.hash;
    if(url.test(/^(#)([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/)){
      this.color = new FS.Color(url, 'hex');
      return true;
    } else {
      return false;
    }
  },

  setHsl: function(hsl){
    this.color = new FS.Color(hsl, 'hsl');
    this.setColorValues();
  },

  setRgb: function(rgb){
    this.color = new FS.Color(rgb, 'rgb');
    this.setColorValues();
  },

  setHex: function(hex){
    this.color = new FS.Color(hex, 'hex');
    this.setColorValues();
  },

  setColorValues: function(){

    //set bottom row values
    if (this.rgbInput.value != this.color.rgb()) this.rgbInput.set('value', this.color.rgb()).removeClass('error');
    if (this.hslInput.value != this.color.hsl()) this.hslInput.set('value', this.color.hsl()).removeClass('error');
    if (this.hexInput.value != this.color.hex()) this.hexInput.set('value', this.color.hex()).removeClass('error');

    //Set slider values
    var h = $('h'); var s = $('s'); var l = $('l');
    if(h.value != this.color.hue()) h.set('value', this.color.hue()).removeClass('error');
    if(s.value != this.color.sat()) s.set('value', this.color.sat()).removeClass('error');
    if(l.value != this.color.lum()) l.set('value', this.color.lum()).removeClass('error');

    //set sliders
    this.hue.set(this.color.hue().round());
    this.saturation.set(this.color.sat().round());
    this.luminosity.set(this.color.lum().round());

    //update url
    this.updateLocation(this.color);

    this.updateStyles();
  },

  updateLocation:function(color){
    clearTimeout(this._locationHashTimer);
    this._locationHashTimer = setTimeout(function(){
      window.location.hash = color.hex();
    }, 300);
  },

  updateStyles: function(){
    sliderStyles = '#hsl_picker #hue { background-image: ' + this.sliderBg('hue', 'webkit') + '; background-image: ' + this.sliderBg('hue', 'moz') + '; background-image: ' + this.sliderBg('hue') + '; } ' +
      '#hsl_picker #saturation { background-image: ' + this.sliderBg('saturation', 'webkit') + ';  background-image: ' + this.sliderBg('saturation', 'moz') + '; background-image: ' + this.sliderBg('saturation') + '; } ' +
      '#hsl_picker #luminosity { background-image: ' + this.sliderBg('luminosity', 'webkit') + ';  background-image: ' + this.sliderBg('luminosity', 'moz') + '; background-image: ' + this.sliderBg('luminosity') + '; } ' +
      'body a:hover { color: '+ this.color.hslStr([this.color.hue(), 100, 70]) +' !important; } '+
      'h1 + p { color: '+ this.color.hslStr([this.color.hue(), 40, 70]) +'; } '+
      'body h2, body h3, code { color:'+ this.color.hslStr([this.color.hue(), 20, 70]) +'; }';

    this.styles.set('text', sliderStyles);

    $$('h1')[0].setStyle('text-shadow', this.getTextShadow());
    $('frame').setStyle('background-color', this.color.hex());
    $('color').setStyle('background', this.color.hex());
    $('shadow').setStyle('background', this.getShadow());
  },

  sliderBg: function(type, browser){
    var H = this.color.hue();
    var S = this.color.sat();
    var L = this.color.lum();
    var colors = []
    if (type == 'hue') for(i=0;i<36;i++){ colors.push(this.color.hslStr([i*10, S, L], 1)); }
    else if(type == 'saturation') for(i=0;i<3;i++){ colors.push(this.color.hslStr([H, i*50, L], 1)); }
    else if(type == 'luminosity') for(i=0;i<3;i++){ colors.push(this.color.hslStr([H, S, i*50], 1)); }

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
    var sat = this.color.sat();
    var lum = this.color.lum();
    var s = sat;
    var l = lum - lum * .35;
    s = sat*(100 - lum)/100;
    var color = [this.color.hue(), s, l];
    return this.color.hslStr(color);
  },

  getTextShadow: function(){
    s = (this.color.lum() < 35) ? 30 : ((this.color.lum() > 80) ? 30 : this.color.sat());
    l = (this.color.lum() < 35) ? 35 : ((this.color.lum() > 80) ? 80 : this.color.lum());
    var color = [this.color.hue(), (s/2.7).round(), l];
    var colors = [];
    for(i=1; i<=5; i++){
      colors.push(this.color.adjustLum((-5.5 * (i-1)).round(), color));
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
    if ((slider == this.hue && this.color.hue().round() != val) ||
      (slider == this.saturation && this.color.sat().round() != val) ||
      (slider == this.luminosity && this.color.lum().round() != val)) {
      this.setHsl([this.hue.step, this.saturation.step, this.luminosity.step]);
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

      if(this.color.validHsl(hsl)){
        if(!hsl.equalTo(this.color.hsl(true))) this.setHsl(hsl);
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
    if(this.color.validHex(hex) && hex != this.color.hex()){
      this.setHex(hex);
    }else if(!this.color.validHex(hex)) {
      this.hexInput.addClass('error');
    }
  },

  changeRgb: function(event){
    rgb = this.rgbInput.value
    this.rgbInput.removeClass('error');
    if(this.color.validRgb(rgb) && rgb != this.color.rgb()){
      this.setRgb(rgb);
    }else if(!this.color.validRgb(rgb)) {
      this.rgbInput.addClass('error');
    }
  },

  changeHsl: function(event){
    hsl = this.hslInput.value
    this.hslInput.removeClass('error');
    if(this.color.validHsl(hsl) && hsl != this.color.hsl()){
      this.setHsl(hsl);
    }else if(!this.color.validHsl(hsl)) {
      this.hslInput.addClass('error');
    }
  },

  compare: function(color1, color2){
    c1 = new FS.Color(color1).hsl(true);//this.hexToHsl(this.valid(color2, 'hex'));
    c2 = new FS.Color(color2).hsl(true);
    //c2 = this.hexToHsl(this.valid(color1, 'hex'));
    var h = (c1[0] - c2[0]);
    var s = (c1[1] - c2[1]);
    var l = (c1[2] - c2[2]);
    var msg = '#'+color2+" is "+Math.abs(h.round(3))+((h > 0) ? ' degrees higher' : ' degrees lower')+', '+
    Math.abs(s)+'%'+((s > 0) ? ' less saturated' : ' more saturated') + ', and ' +
    Math.abs(l) + '%'+((l > 0) ? ' darker' : ' lighter') + ' than #' + color1 + '.';
    return msg;
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

FS.Color = new Class({

  initialize: function(color, type){
    if (type == 'hex' && this.validHex(color)) {
      this.setHex(color);
    } else if (type == 'hsl' && this.validHsl(color)) {
      this.setHsl(color);
    } else if (type == 'rgb' && this.validRgb(color)) {
      this.setRgb(color);
    } else if (typeof(color) == 'string') {
      if (this.validHex(color)) {
        this.setHex(color);
      } else if (this.validRgb(color)) {
        this.setRgb(color);
      } else if (this.validHsl(color)) {
        this.setHsl(color);
      }
    }
  },

  setHsl: function(color) {
    this._hsl = this.toHsl(color);
    this._rgb = this.hslToRgb(this._hsl);
    this._hex = this.rgbToHex(this._rgb);
  },

  setRgb: function(color) {
    this._rgb = this.toRgb(color);
    this._hsl = this.rgbToHsl(this._rgb);
    this._hex = this.rgbToHex(this._rgb);
  },

  setHex: function(color) {
    this._hex = this.toHex(color);
    this._rgb = this.hexToRgb(this._hex);
    this._hsl = this.rgbToHsl(this._rgb);
  },

  adjustLum: function(l, color){
    color = (typeof(color) == 'undefined') ? this._hsl : color;
    return this.hslStr([color[0], color[1], color[2] + l]);
  },

  hex: function(notStr) {
    return (notStr) ? this._hex : '#'+this._hex;
  },

  rgb: function(notStr) {
    return (notStr) ? this._rgb : this.rgbStr(this._rgb);
  },

  hsl: function(notStr) {
    return (notStr) ? this._hsl : this.hslStr(this._hsl);
  },

  rgbStr: function(rgb) {
    return "rgb(" + rgb.join(", ") + ")";
  },

  hslStr: function(hsl) {
    return "hsl("+ hsl[0] +", "+ hsl[1] +"%, "+ hsl[2] +"%)";
  },

  hue: function(){
    return this.hsl(true)[0];
  },

  sat: function(){
    return this.hsl(true)[1];
  },

  lum: function() {
    return this.hsl(true)[2];
  },

  red: function() {
    return this.rgb(true)[0];
  },

  green: function() {
    return this.rgb(true)[1];
  },

  blue: function() {
    return this.rgb(true)[2];
  },

  validHex: function(color){
    return color.test(/^(#)?([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/);
  },

  validRgb: function (color) {
    color = (typeof(color) == 'array') ? color : this.toRgb(color);
    return color.every(function(item, index){ return (item >= 0) && (item <= 255) })
  },

  validHsl: function(color) {
    color = (typeof(color) == 'array') ? color : this.toHsl(color);
    return color.every(function(item, index){ return (index == 0 && item >= 0 && item <= 360) || (index > 0 && item >= 0 && item <= 100) });
  },

  toRgb: function(rgb){
    if (typeof(rgb) == 'string')
      return rgb.replace(/rgb\(/, '').replace(/\)/, '').replace(/;/, '').clean().split(',').map(function(item, index) { return parseFloat(item); });
    else
      return rgb;
  },

  toHsl: function (hsl){
    if (typeof(hsl) == 'string')
      return hsl.replace(/hsl\(/, '').replace(/\)/, '').replace(/;/, '').replace(/\%/, '').clean().split(',').map(function(item, index) { return parseFloat(item); });
    else
      return hsl;
  },

  toHex: function(hex){
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

    h = h.round();
    s = (s*100).round();
    l = (l*100).round();

    return [h, s, l];
  }
});
