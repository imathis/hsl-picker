picker = Backbone.View.extend

  initialize: (options) ->
    @setElement $(options.el)
      
  render: ->
    @hueSlider = @$('#h-slider').dragdealer
      slide: false
      steps: 361
      speed: 100
      x: @model.get('h')/360
      animationCallback: (x,y)=> 
        hue = Math.round(x*360)
        @model.h hue unless @model.get('h') is hue

    @satSlider = @$('#s-slider').dragdealer
      slide: false
      steps: 101
      speed: 100
      x: @model.get('s')/100
      animationCallback: (x,y)=>
        sat = Math.round(x*100)
        @model.s sat unless @model.get('s') is sat


    @lumSlider = @$('#l-slider').dragdealer
      slide: false
      steps: 101
      speed: 100
      x: @model.get('l')/100
      animationCallback: (x,y)=>
        lum = Math.round(x*100)
        @model.l lum unless @model.get('l') is lum

    @alphaSlider = @$('#a-slider').dragdealer
      slide: false
      steps: 101
      speed: 100
      x: @model.get 'a'
      animationCallback: (x,y)=>
        alpha = Math.round(x*100)/100
        @model.a alpha unless @model.get('a') is alpha

    @updateSliderStyles('all')

    @model.on 'change:h', @setHue, this
    @model.on 'change:s', @setSat, this
    @model.on 'change:l', @setLum, this
    @model.on 'change:a', @setAlpha, this
    @

  setHue: ->
    @setSlider @hueSlider, @model.get('h'), 360
    @updateSliderStyles 'h'
  setSat: ->
    @setSlider @satSlider, @model.get('s'), 100
    @updateSliderStyles 's'
  setLum: ->
    @setSlider @lumSlider, @model.get('l'), 100
    @updateSliderStyles 'l'
  setAlpha: ->
    @setSlider @alphaSlider, @model.get('a')*100, 100
    @updateSliderStyles 'a'

  # Sliders update the model, firing the change event, which will trigger setting the sliders
  # This compares the current values and prevents an unnecessary update.
  setSlider: (slider, value, factor)->
    unless Math.round(slider.value.current[0]*factor) is Math.round(value)
      slider.setValue value/factor

  updateSliderStyles: (part) ->
    parts = _.without(['h','s','l','a'], part)
    (@setSliderBg p for p in parts)

  setSliderBg: (part) ->
    $("##{part}-slider").attr('style',"background: -webkit-#{@gradient part}; background: -moz-#{@gradient part}")

  gradient: (part)->
    switch part
      when 'h'
        size       = 36
        multiplier = 10
      when 's','l'
        size       = 5
        multiplier = 20
      when 'a'
        size       = 5
        multiplier = .2

    colors = (@model.hslaStr(@tweakHsla(part, num*multiplier)) for num in [0..size])
    "linear-gradient(left, #{colors.join(',')});"

  tweakHsla: (part, value) ->
    color = @model.hsla()
    switch part
      when 'h' then pos = 0
      when 's' then pos = 1
      when 'l' then pos = 2
      when 'a' then pos = 3
    color.splice pos,1,value
    color

module.exports = (options) -> new picker(options)
