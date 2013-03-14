inputs = Backbone.View.extend

  initialize: (options) ->
    @setElement $(options.el)
    @model.on 'change:h',   @setHue, this
    @model.on 'change:s',   @setSat, this
    @model.on 'change:l',   @setLum, this
    @model.on 'change:a',   @setAlpha, this
    @model.on 'change:a',   @changeRgb, this
    @model.on 'change:hex', @changeHex, this
    @model.on 'change:rgb', @changeRgb, this

  events:
    'keydown .sliders input'    : 'bumpHsl'
    'keyup .sliders input'      : 'editHsl'
    'keyup .color-inputs input' : 'changeColor'

  changeColor: (e) ->
    el = $(e.target)
    if @model[el.attr('id')](el.val()) then el.removeClass 'error' else el.addClass 'error'

  bumpHsl: (e) ->
    if e.keyCode is 38 or e.keyCode is 40
      part  = $(e.target).attr('id')
      shift = if e.shiftKey then 10 else 1
      shift = -(shift) if e.keyCode is 40
      @bumpValue part, shift 
      e.preventDefault()

  bumpValue: (part, shift) ->
    current = @model.get part
    val = if part is 'a' then Math.round(current*100 + shift)/100 else current + shift
    switch part
      when 'h'     then val = @gate val, 360
      when 's','l' then val = @gate val, 100
      when 'a'     then val = @gate val, 1
    @model[part] val

  gate: (val, finish) ->
    if val < 0 then 0
    else if val > finish then finish
    else val

  editHsl: (e)->
    el   = $(e.target)
    part = el.attr 'id'
    val  = parseFloat el.val()
    if @model.inRange part, val
      el.removeClass 'error'
      @model[part] val
    else
      el.addClass 'error'
    
  changeHex: ->
    @update $('#hex'), @model.get 'hex'

  changeRgb: ->
    @update $('#rgba'), @model.rgbaStr()

  changeHsl: ->
    @update $('#hsla'), @model.hslaStr()

  setHue: ->
    @update $('#h'), @model.get('h')
    @changeHsl()

  setSat: ->
    @update $('#s'), @model.get('s')
    @changeHsl()

  setLum: ->
    @update $('#l'), @model.get('l')
    @changeHsl()

  setAlpha: ->
    @update $('#a'), @model.get('a')
    @changeHsl()

  update: (el, val)->
    el.val "#{val}" unless el.val() is "#{val}"
  
module.exports = (options) -> new inputs(options)
