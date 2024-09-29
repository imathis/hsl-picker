export const colorModels = {
  hsl: ['hue', 'saturationl', 'lightness', 'alpha'],
  hwb: ['hue', 'white', 'wblack', 'alpha'],
  rgb: ['red', 'green', 'blue', 'alpha'],
}

export const allColorParts = Object.values(colorModels).flat().reduce((acc, item) => {
 return acc.indexOf(item) < 0 ? [...acc, item] : acc
}, [])

const toString = {
  hwb: ({ hue, white, wblack, alpha }) => {
    const main = `${hue} ${white}% ${wblack}%`
    return alpha < 1 ? `hwb(${main} / ${alpha})` : `hwb(${main})`
  },
  hsl: ({ hue, saturationl, lightness, alpha }) => {
    const main = `${hue} ${saturationl}% ${lightness}%`
    return alpha < 1 ? `hsla(${main} / ${alpha})` : `hsl(${main})` 
  },
  rgb: ({ red, green, blue, alpha }) => {
    const main = [red, green, blue].join(' ')
    return alpha < 1 ? `rgba(${main} / ${alpha})` : `rgb(${main})`
  },
  hex: ({ hex }) => hex,
}

const getRandom = (min, max, unit) => {
  const num = Math.floor(Math.random() * (max - min + 1)) + min
  return unit ? `${num}${unit}` : num
}

export const setRoot = (prop, value) => document.documentElement.style.setProperty(`--picker-${prop}`, value)
export const getRoot = (prop) => document.documentElement.style.getPropertyValue(`--picker-${prop}`)

// Matches hex, rgba? hsla? hwb and really any xxxa?(xxx xxx xxx xxx) format. Optional alpha capture
const ColorTest = (type) => {
  if (type === 'hex') {
    // Matches 3, 4, 6, and 8 character hex codes (4, 8 have alpha channels)
    return new RegExp('^#(\\b(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\\b)$')
  }
  const num = '([\\d.]+)' // number characters with decimals
  const percent = '([\\d.]+%)' // number characters with decimals
  const sep = '\\s*(?:,|\\s)\\s*'      // non number characters
  const alph = '\\d\\.{0,1}\\d*' // number decimal number
  const alphsep = '\\s*(?:,|/)\\s*'
  const main = {
    rgb: [num, num, num],
    hsl: [num, percent, percent],
    hwb: [num, percent, percent],
  }[type]
  return new RegExp(`^${type}a?\\(${main.join(sep)}(?:${alphsep}(${alph}))?\\)$`)
}

export const colorPatterns = {
  hsl: ColorTest('hsl'),
  hwb: ColorTest('hwb'),
  rgb: ColorTest('rgb'),
  hex: ColorTest('hex'),
}

const isColor = {
  hsl: (str) => str.match(ColorTest('hsl'))?.slice(1) || null,
  hwb: (str) => str.match(ColorTest('hwb'))?.slice(1) || null,
  rgb: (str) => str.match(ColorTest('rgb'))?.slice(1) || null,
  hex: (str) => str.match(ColorTest('hex'))?.slice(1) || null,
}

const colorArray = (color, model = color.slice(0, 3)) => {
  const is = isColor[model](color)
  return is && is?.map((n) => (typeof n === 'undefined') ? 1 : Number.parseFloat(n, 10))
}

const colorParts = (color, model = color.slice(0, 3)) => {
  try {
    if (model === 'hex' || color.startsWith('#')) return { hex: color }
    const arr = colorArray(color, model)
    return colorModels[model].reduce((acc, part, index) => {
      return {...acc, [part]: arr[index] }
    }, {})
  } catch (e) {
    console.error(e)
    throw new Error(`Unsupported Color Error: Color \`${color}\` is not a supported color format.`)
  } 
}

const rgbaToHex = ({ red, green, blue, alpha }) => {
  const colors = [red, green, blue]
  if (alpha < 1) colors.push(alpha) 
  return `#${colors.map(
    (n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')
  ).join('')}`
}

const toHslwb = ({ red: r, green: g, blue: b, alpha: a }) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  let h, w, wb, s
  let l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
    w = max;
    wb = 1 - max
  } else {
    w = min;
    wb = 1 - max
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)
    
    if (max === r) {
      h = (g - b) / diff + (g < b ? 6 : 0)
    } else if (max === g) {
      h = (b - r) / diff + 2
    } else if (max === b) {
      h = (r - g) / diff + 4
    }

    h /= 6;
  }

  h = Math.round(h * 360)
  s = Math.round(s * 1000) / 10
  l = Math.round(l * 1000) / 10
  w = Math.round(w * 1000) / 10
  wb = Math.round(wb * 1000) / 10

  const obj = { hue: h, saturationl: s, lightness: l, white: w, wblack: wb, alpha: a }

  const hsl = toString.hsl(obj)
  const hwb = toString.hwb(obj)

  return { hsl, hwb, ...obj }
}

const toRgb = (str) => {
  try {
    const el = document.createElement('div')
    el.style.color = str
    const { color } = window.getComputedStyle(document.body.appendChild(el))
    const rgba = colorParts(color)
    document.body.removeChild(el)

    const rgb = toString.rgb(rgba)
    const hex = rgbaToHex(rgba)

    return { ...rgba, rgb, hex }
  } catch (e) {
    throw new Error(`Invalid Color Error: Browser does not recognize \`${str}\` as a valid color.`)
  }
}

const inbound = (num, opts = {}) => {
  const { min = 0, max = 100 } = opts
  return min <= num && num <= max
}

const testHxx = (color, model) => {
  const arr = colorArray(color, model)
  if (!arr) return false
  const [hue, sw, lwb, alpha] = arr
  return inbound(hue, { max: 360 })
      && inbound(sw)
      && inbound(lwb)
      && (typeof alpha === 'undefined' || inbound(alpha, { max: 1 }))
}

const testRgb = (color, model) => {
  const arr = colorArray(color, model)
  if (!arr) return false
  const [r, g, b, alpha] = arr
  return inbound(r, { max: 255 })
    && inbound(g, { max: 255 }) 
    && inbound(b, { max: 255 }) 
    && (typeof alpha === 'undefined' || inbound(alpha, { max: 1 }))
}

export const validate = {
  hsl: (str) => testHxx(str, 'hsl'),
  hwb: (str) => testHxx(str, 'hwb'),
  rgb: (str) => testRgb(str, 'rgb'), 
  hex: (str) => isColor.hex(str),
}

export const colorModel = (str) => {
  const model = Object.keys(isColor).find((type) => isColor[type](str))
  if (!model) {
    throw new Error(`Color Error: No matching color model could be found for ${str}`)
  }
  return model
}

export const validColor = (str) => !!colorModel(str)

const adjustColor = (color, prop, value, model = color.model) => {
  // If we are setting a color from a string all at once rgb, hex, hsla, hwb as a string
  const stringColor = Object.keys(validate).includes(prop)
  if (stringColor && validColor(value)) {
    const newColor = Color(value, prop)
    return Color(newColor[color.model])
  }

  if (prop === 'model' && Object.keys(validate).includes(value)) {
    return Color(color[value], value)
  }

  // Setting individual attributes of a color
  return Color(toString[model]({ ...color, [prop]: value }), model)
}

export const Color = (
  color, m,
) => {
  try {
    const model = m || colorModel(color)
    if (!model) throw new Error(`No matching color model found for ${color}`)

    const rgb = toRgb(color)
    const hslwb = toHslwb(rgb)
    const current = colorParts(color, model === 'hex' ? 'rgb' : model)
    const colorObj = { 
      model,
      ...hslwb,
      ...rgb,
      // ensure that conversions don't override initial model with rounding errors
      ...current,
      [model]: color,
    }

    return {
      ...colorObj,
      adjust: (...args) => adjustColor(colorObj, ...args),
      toString: () => colorObj[colorObj.model],
    }
  } catch (e) {
    console.error(e.message)
  }
}

export const randomColor = () => {
  return Color(`hsl(${getRandom(0,360)} 100% 50%)`)
}
