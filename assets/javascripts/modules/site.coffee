color = require('color')
picker = require('picker')
inputs = require('inputs')
tiles = require('tiles')

site = Backbone.View.extend

  initialize: (options) ->
    @setElement $('body')
    @tiles = options.tiles

    @model.set tile: 'foreground'
    @model.on 'change:h', @updateColor, this
    @model.on 'change:s', @updateColor, this
    @model.on 'change:l', @updateColor, this
    @model.on 'change:a', @updateColor, this

    @style = $('<style>')
    $('head').append @style

    color = @urlToColor(window.location.hash) or @model.randomColor()
    @model.hsla color 

  events:
    'click .url'       : 'selectUrl'
    'click .show-more' : 'toggleWhy'

  updateColor: ->
    color = @model.hsla()
    tile = @model.get 'tile'
    opt = {}
    opt[tile] = color
    @model.set opt
    @setUrl()
    @setPageStyles() if tile is 'foreground'

  selectUrl: (e)->
    e.target.select()

  toggleWhy: ->
    $('#more').toggleClass('hide')
    e.preventDefault()

  urlToColor: (url)->
    if url.length
      colors = for color in url.split '/'
        color = color.split ','
        hex = color[0]
        alpha = color[1]
        rgb = @model.hexToRgb(hex)
        rgba = if alpha?
          rgb.splice(-1,1, parseFloat alpha)
          @model.rgbToHsl rgb
        else @model.rgbToHsl rgb
      foreground = colors[0]
      background = colors[1]
      @model.set foreground: foreground if foreground?
      if background?
        @model.set background: background 
        _.delay @tiles.toggleExposed, 500
      foreground
  
  setUrl: ->
    host = window.location.host
    hash = @getColorUrl @model.get 'foreground'
    background = @model.get 'background'
    hash += "/#{@getColorUrl background}" if background[3] > 0

    input=$('.url')
    url = "#{host}/#{hash}"
    width = url.length*7.8
    input.css width: width
    input.val(url) 

  getColorUrl: (color)->
    frag  = @model.hslToHex color
    frag += ",#{color[3]}" unless color[3] is 1
    frag

  setPageStyles: ->
    hsla =  @model.hsla()
    unless _.contains(hsla, undefined)
      linkHover = @model.hslaStr([hsla[0], 100, 70, 1])
      paragraphs = @model.hslaStr([hsla[0], 40, 70, 1])
      headingsAndCode = @model.hslaStr([hsla[0], 40, 70, 1])
      $('h1').css('text-shadow', @getTextShadow(hsla))
      @style.text "body a:hover { color: #{linkHover} !important }
        h1 + p { color: #{paragraphs} }
        body h2, body h3, code { color: #{headingsAndCode} }"

  getTextShadow: (hsla)->
    lum = hsla[2]
    s = if lum < 35 then 30 else if lum > 80 then 30 else hsla[1]
    l = if lum < 35 then 35 else if lum > 80 then 80 else lum
    color = [hsla[0], Math.round(s/2.7), l]
    colors = []
    _(4).times (i)=> colors.push(@adjustLum(Math.round(-5.5 * (i-1)), color))
    colors[0]+' 0px 1px 0px, '+
    colors[1]+' 0px 2px 0px, '+
    colors[2]+' 0px 3px 0px, '+
    colors[3]+' 0px 4px 0px, '+
    'rgba(0, 0, 0, 0.2) 0px 5px 1px, '+
    'rgba(0, 0, 0, 0.3) 0px 0px 10px, '+
    'rgba(0, 0, 0, 0.4) 0px 3px 5px, '+
    'rgba(0, 0, 0, 0.5) 0px 6px 5px, '+
    'rgba(0, 0, 0, 0.6) 0px 10px 10px'
    
  adjustLum: (l, color=@model.hsla())->
    @model.hslaStr [color[0], color[1], color[2] + 1, @model.get('a')]

module.exports = ->
  color = color()
  picker(model: color, el: '#picker').render()
  inputs(model: color, el: '#hslpicker')
  new site(model: color, tiles: tiles(model: color, el: '#tiles'))
