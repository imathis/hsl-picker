tiles = Backbone.View.extend

  initialize: (options) ->
    @model.on 'change:foreground', @updateForeground, this
    @model.on 'change:background', @updateBackground, this
    @model.set background: [360, 100, 100, 0] unless @model.get('background')

  events:
    'click .expose'                  : 'toggleExposed'
    'click .foreground, .background' : 'selectTile'
    'click .bg'                      : 'setTileBg'

  toggleExposed: ->
    $('.color-tiles').toggleClass 'exposed' 
    $('.slider').css 'background-color', if $('.color-tiles').is('.exposed') then 'transparent' else @model.hslaStr @model.get('background')
    $('.foreground').trigger 'click'

  selectTile: (e)->
    tile = $(e.currentTarget)
    unless tile.is '.selected'
      @model.set tile: tile.data('name')
      @model.hsla @model.get(tile.data('name'))
      $('.selected').removeClass 'selected'
      tile.addClass 'selected'

  setTileBg: (e)->
    tile = $(e.target)
    if tile.is '.random'
      color = @model.randomColor()
      color[3] = @model.get('a') or 1 #retain current alpha setting if > 0
      @model.hsla color
    else
      @model.hsla tile.data('color') 

  updateForeground: ->
    $('.foreground-color').css 'background-color': @model.hslaStr @model.get('foreground')

  updateBackground: ->
    $('.background-color').css 'background-color': @model.hslaStr @model.get('background')


module.exports = (options) -> new tiles(options)
