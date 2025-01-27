import React from 'react'
import { ColorContext } from './Context'
import { Color, randomColor, setRoot, colorModels, allColorParts } from './helpers'

const updateModelVars = ({ color }) => {
  allColorParts.forEach((part) => {
    if (color[part] !== undefined) setRoot(part, color[part])
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
  const [color, setColorValue] = React.useState()

  useUpdateUrl(color)
  const setColor = React.useCallback((c) => {
    let newColor = (typeof c === 'string') ? Color(c) : c

    updateModelVars({ color: newColor })
    setColorValue(newColor)
    setRootColor(newColor)
    return newColor
  }, [])

  React.useEffect(() => {
    if (!color) {
      setColor(initialColor || randomColor())
    }
  }, [color, setColor, initialColor])

  const adjustColor = React.useCallback((args) => {
    return setColor(color.set(args))
  }, [setColor, color])

  return {
    colorModels,
    color,
    setColor,
    adjustColor,
  }
}

export const useColor = () => React.useContext(ColorContext)
