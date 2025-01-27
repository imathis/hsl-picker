import React from 'react'

const codeTextProps = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: "false",
}

const useCopyText = () => {
  const [copied, setCopied] = React.useState()

  const copyToClipboard = async (text) => {
    if ('clipboard' in navigator) {
      return navigator.clipboard.writeText(text)
    }
    // older browser fallback
    return document.execCommand('copy', true, text)
  }

  const copyText = async (text) => {
    try {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => {
        setCopied(null)
      }, 800)
    } catch (err) {
      console.error(err)
    }
  }

  return { copyText, copied }
}

const Input = React.forwardRef(function Input({ onChange: onChangeProp, ...props }, ref) {
  const onChange = ({ target }) => {
    const { name, value } = target
    if (name === 'hex' && value && !value.startsWith('#')) {
      target.value = `#${value}`
      onChange({ target })
    } else {
      if (target.checkValidity()) {
        if (onChangeProp) { onChangeProp([name, value]) }
      }
    }
  }
  return <input
    onChange={onChange}
    ref={ref}
    {...props}
  />
})

const CodeInput = (props) => {
  const { copyText, copied } = useCopyText()
  const ref = React.useRef()
  const copyColor = () => copyText(ref.current.value)

  return (
    <div className="color-code">
      <Input type="text" {...props} {...codeTextProps} data-copied={copied} ref={ref} />
      <button aria-label="copy code" type="button" className="copy-code" onClick={copyColor} data-copied={copied}>
        <svg width="0.7em" height="0.7em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 6.75l.003-2.123A2.25 2.25 0 0 0 2 6.75v10.504a4.75 4.75 0 0 0 4.75 4.75h5.064a6.515 6.515 0 0 1-1.08-1.5H6.75a3.25 3.25 0 0 1-3.25-3.25V6.75z" /><path d="M18 11.174V4.25A2.25 2.25 0 0 0 15.75 2h-9A2.25 2.25 0 0 0 4.5 4.25v13a2.25 2.25 0 0 0 2.25 2.25h3.563a6.475 6.475 0 0 1-.294-1.5H6.75a.75.75 0 0 1-.75-.75v-13a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 .75.75V11c.516 0 1.018.06 1.5.174z" /><path d="M16.5 12a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm.501 8.503V18h2.496a.5.5 0 0 0 0-1H17v-2.5a.5.5 0 1 0-1 0V17h-2.504a.5.5 0 0 0 0 1H16v2.503a.5.5 0 1 0 1 0z" /></svg>
      </button>
    </div>
  )
}

export {
  Input,
  CodeInput,
}
