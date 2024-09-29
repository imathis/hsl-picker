import React from 'react'
import { ColorContext } from './Context'
import { useColorHooks } from './useColor'
import { colorPatterns, randomColor, Color } from './helpers'

export const ColorProvider = (props) => {
  const color = React.useMemo(() => {
    return colorPatterns.hex.test(window.location.hash)
      ? Color(window.location.hash).hsl
      : randomColor()
  }, [])
  const value = useColorHooks({ color })

      
  return (
    <form onSubmit={() => null}>
      <ColorContext.Provider value={value} {...props} />
    </form>
  )
}
