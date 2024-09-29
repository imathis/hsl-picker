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

const Input = React.forwardRef(function Input ({ onChange: onChangeProp, ...props }, ref) {
  const onChange = ({ target }) => {
    const { name, value } = target
    if (target.checkValidity()) {
      if (onChangeProp) { onChangeProp([name, value])}
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
      <button type="button" className="copy-code" onClick={copyColor} data-copied={copied}>&#x2398;</button>
    </div>
  )
}

export {
  Input,
  CodeInput,
}
