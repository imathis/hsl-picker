import React from 'react'
import { ColorContext } from './Context'
import { Color, randomColor, setRoot, colorModels, allColorParts } from './helpers'

const updateModelVars = ({ color }) => {
  allColorParts.forEach((part) => {
    setRoot(part, color[part])
  })
}

const setRootColor = (color) => {
  setRoot('color', color.rgb)
}

const useUpdateUrl = (color) => {
  React.useEffect(() => {
    const ref = window.setTimeout(() => {
      try {
        window.history.replaceState({}, '', color.hex)
      } catch (e) {
        console.error(e)
      }
    }, 300)

    return () => window.clearTimeout(ref)
  }, [color])
}

export const useColorHooks = (options = {}) => {
  const { color: initialColor = null } = options
  const [model, setModelValue] = React.useState()
  const [color, setColorValue] = React.useState()

  useUpdateUrl(color)

  const setModel = React.useCallback((m, c = color) => {
    if (colorModels[m]) { 
      setRoot('model', m)
      setModelValue(m) 
      const newColor = c.adjust('model', m)
      setColorValue(newColor)
      if (color && color.model !== m) updateModelVars({ color: newColor })
    }
  }, [color, setColorValue])

  const setColor = React.useCallback((c) => {
    let newColor = (typeof c === 'string') ? Color(c) : c
    
    // Initially there won't be a model, so set it
    if (!model && colorModels[newColor.model]) {
      setModel(newColor.model, newColor)
    }

    updateModelVars({ color: newColor })
    setColorValue(newColor)
    setRootColor(newColor)
    return newColor
  }, [model, setModel])

  React.useEffect(() => {
    if (!color) {
      setColor(initialColor || randomColor())
    }
  }, [color, setColor, initialColor])

  const adjustColor = React.useCallback((...args) => {
    return setColor(color.adjust(...args))
  }, [setColor, color])

  return {
    model,
    colorModels,
    setModel,
    color,
    setColor,
    adjustColor,
  }
}

export const useColor = () => React.useContext(ColorContext)
