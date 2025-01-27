import React from 'react'
import { allColorParts, colorPatterns, setRoot } from './helpers'
import { CodeInput, Input } from './inputs'
import { useColor } from './useColor'

const setValue = (name, value) => {
  Array.prototype.forEach.call(document.querySelectorAll(`[name=${name}]`), (el) => {
    el.value = value
  })
}

const trackBg = ({
  type = '',
  steps = 0,
  props = [],
  alpha = 'var(--picker-alpha)',
}) => {
  const grad = []
  const propVal = (prop, i) => typeof prop === 'function' ? prop(i) : prop
  for (let i = 0; i < steps; i += 1) {
    const vals = props.map((val) => propVal(val, i)).join(' ')
    if (alpha) {
      grad.push(`${type}(${vals} / ${propVal(alpha, i)})`)
    } else {
      grad.push(`${type}(${vals})`)
    }

  }
  return `linear-gradient(to right, ${grad.join(', ')})`
}
const hslBg = ({
  hue = 'var(--picker-hue)',
  sat = 'calc(var(--picker-saturation) * 1%)',
  lig = 'calc(var(--picker-luminosity) * 1%)',
  ...props
}) => trackBg({ type: 'hsl', props: [hue, sat, lig], ...props })

const hwbBg = ({
  hue = 'var(--picker-hue)',
  whiteness = 'calc(var(--picker-whiteness) * 1%)',
  blackness = 'calc(var(--picker-blackness) * 1%)',
  ...props
}) => trackBg({ type: 'hwb', props: [hue, whiteness, blackness], ...props })

const rgbBg = ({
  red = 'var(--picker-red)',
  green = 'var(--picker-green)',
  blue = 'var(--picker-blue)',
  steps = 255,
  ...props
}) => trackBg({ type: 'rgba', props: [red, green, blue], steps, ...props })

const rainbowBg = () => {
  const hue = (v) => v * 36
  const sat = 'calc(clamp(35, var(--picker-saturation), 60) * 1%)'
  const lig = 'calc(clamp(55, var(--picker-luminosity), 70) * 1%)'
  return trackBg({
    type: 'hsl',
    props: [hue, sat, lig],
    steps: 10,
    alpha: false,
  })
}

const background = {
  hsl: {
    hue: hslBg({ hue: (v) => v, steps: 360 }),
    saturation: hslBg({ sat: (s) => s ? '100%' : '0%', steps: 2 }),
    luminosity: hslBg({ lig: (l) => `${l * 50}%`, steps: 3 }),
    alpha: hslBg({ alpha: (v) => v, steps: 2 }),
  },
  hwb: {
    hue: hwbBg({ hue: (v) => v, steps: 360 }),
    whiteness: hwbBg({ whiteness: (v) => `${v * 100}%`, steps: 2 }),
    blackness: hwbBg({ blackness: (v) => `${v * 100}%`, steps: 2 }),
    alpha: hwbBg({ alpha: (v) => v, steps: 2 }),
  },
  rgb: {
    red: rgbBg({ red: (v) => v }),
    green: rgbBg({ green: (v) => v }),
    blue: rgbBg({ blue: (v) => v }),
    alpha: rgbBg({ alpha: (v) => v, steps: 2 }),
  },
}

const ColorSlider = ({ name, model, onChange: onChangeProp, ...props }) => {
  const onChange = ([name, value]) => {
    onChangeProp([name, value, model])
  }
  return (
    <div className="color-slider">
      <div className="slider-track" >
        <Input type="range" data-model={model} name={name} min={0} max={100} step={1} onChange={onChange} {...props} style={{ background: background[model][name] }} />
      </div>
      <Input type="number" data-model={model} name={`${name}Num`} min={0} max={100} step={0.1} onChange={onChange} {...props} />
    </div>
  )
}

export const Picker = () => {
  const { color, adjustColor, setColor } = useColor()
  const model = React.useRef()
  const swatch = React.useRef(true)
  const [showHsl, setShowHsl] = React.useState(true)
  const [showHwb, setShowHwb] = React.useState(false)
  const [showRgb, setShowRgb] = React.useState(false)

  const updateText = React.useCallback(({ newColor, fromInput }) => {
    const inputs = {
      hsl: newColor.hsl,
      hwb: newColor.hwb,
      rgb: newColor.rgb,
      hex: newColor.hex,
    }
    Object.entries(inputs).filter(([k]) => k !== fromInput).forEach(([k, v]) => {
      setValue(k, v)
    })
  }, [])

  // When a color is set, update each slider and number input
  const updateSliders = React.useCallback(({ newColor, fromInput }) => {
    allColorParts.forEach((prop) => {
      setValue(prop, newColor[prop])
      if (`${prop}Num` !== fromInput) setValue(`${prop}Num`, newColor[prop])
    })
  }, [])

  // When a slider (or matching number input) changes:
  // - Update the matching input (number or slider)
  // - Set the color prop
  // - Update the text inputs with the new color
  const setSliderInput = React.useCallback(([name, value, model]) => {
    const colorProp = name.replace('Num', '')
    const matchingVal = name.includes('Num') ? colorProp : `${name}Num`
    setValue(matchingVal, value)
    const newColor = adjustColor({ [colorProp]: value, model })
    updateText({ newColor })
    updateSliders({ newColor, fromInput: name })
  }, [updateText, updateSliders, adjustColor])

  const onChangeText = React.useCallback(([name, value]) => {
    console.log({ name, value })
    const newColor = setColor(value)
    updateText({ newColor, fromInput: name })
    updateSliders({ newColor })
  }, [setColor, updateText, updateSliders])

  const showSlider = (name) => () => {
    let showFunction
    if (name === 'hsl') showFunction = setShowHsl
    if (name === 'hwb') showFunction = setShowHwb
    if (name === 'rgb') showFunction = setShowRgb
    showFunction((showing) => {
      if (!showing) return true
      if ([showHsl, showRgb, showHwb].filter((v) => v).length > 1) {
        return false
      }
      return true
    })
    window.setTimeout(() => {
      updateSliders({ newColor: color })
      updateText({ newColor: color })
    }, 0)
  }

  // On initial load
  React.useEffect(() => {
    if (color && (!model.current)) {
      updateSliders({ newColor: color })
      updateText({ newColor: color })
      model.current = color.model
      setRoot('rainbow', rainbowBg())
    }
  }, [model, color, updateText, updateSliders])

  if (color) return (
    <div>
      <div className="slider-choices">
        <label><input type="checkbox" name="hsl" checked={showHsl} onChange={showSlider('hsl')} /><div>HSL</div></label>
        <label><input type="checkbox" name="hwb" checked={showHwb} onChange={showSlider('hwb')} /><div>HWB</div></label>
        <label><input type="checkbox" name="rgb" checked={showRgb} onChange={showSlider('rgb')} /><div>RGB</div></label>
      </div>
      <div className="main">
        <div className="color-swatch-wrapper">
          <div className="color-swatch" ref={swatch} />
          <CodeInput name="hex" onChange={onChangeText} pattern={colorPatterns.hex.source} />
        </div>
        <div className="color-pickers">
          {showHsl ? (
            <div className="color-picker">
              <ColorSlider name="hue" max={360} step={1} onChange={setSliderInput} model="hsl" />
              <ColorSlider name="saturation" onChange={setSliderInput} model="hsl" />
              <ColorSlider name="luminosity" onChange={setSliderInput} model="hsl" />
              <ColorSlider name="alpha" step={0.01} max={1} onChange={setSliderInput} model="hsl" />
              <CodeInput name="hsl" onChange={onChangeText} pattern={colorPatterns.hsl.source} />
            </div>
          ) : null}

          {showHwb ? (
            <div className="color-picker">
              <ColorSlider name="hue" max={360} step={1} onChange={setSliderInput} model="hwb" />
              <ColorSlider name="whiteness" onChange={setSliderInput} model="hwb" />
              <ColorSlider name="blackness" onChange={setSliderInput} model="hwb" />
              <ColorSlider name="alpha" step={0.01} max={1} onChange={setSliderInput} model="hwb" />
              <CodeInput name="hwb" onChange={onChangeText} pattern={colorPatterns.hwb.source} />
            </div>
          ) : null}

          {showRgb ? (
            <div className="color-picker">
              <ColorSlider name="red" onChange={setSliderInput} max={255} model="rgb" />
              <ColorSlider name="green" onChange={setSliderInput} max={255} model="rgb" />
              <ColorSlider name="blue" onChange={setSliderInput} max={255} model="rgb" />
              <ColorSlider name="alpha" step={0.01} max={1} onChange={setSliderInput} model="rgb" />
              <CodeInput name="rgb" onChange={onChangeText} pattern={colorPatterns.rgb.source} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
  return null
}
