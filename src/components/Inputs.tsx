import React from "react";
import { createColorObject } from "../utils/colorConversion";
import { useCopyText } from "../hooks";

/**
 * Props for the Input component.
 */
type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  onChange: ([name, value]: [string, string]) => void;
};

/**
 * A custom input component that handles color value input with validation.
 * @param onChange - Callback to handle changes, receiving [name, value] tuple.
 * @param props - Standard HTML input attributes.
 * @param ref - Forwarded ref to the input element.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { onChange, ...props },
  ref,
) {
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (event.target.checkValidity()) {
      // If input is valid, pass the value directly
      onChange([name, value]);
    } else {
      // If input is invalid, try to fix it
      try {
        const validColor = createColorObject(value);
        if (validColor?.[name]) {
          // If the color object has a valid value for this field, use it
          event.target.value = validColor[name];
          onChange([name, event.target.value]);
        }
      } catch (_e) {
        if (name === "hex" && value && !value.startsWith("#")) {
          // For hex inputs, automatically add "#" prefix if missing
          event.target.value = `#${value}`;
          onChange([name, event.target.value]);
        } else {
          console.error(`Invalid color: ${value}`);
        }
      }
    }
  };
  return <input onChange={onChangeHandler} ref={ref} {...props} />;
});

/**
 * A component for entering color codes with a copy-to-clipboard button.
 * @param props - Props for the underlying Input component.
 */
const CodeInput = (props: InputProps) => {
  const { copyText, copied } = useCopyText();
  const ref = React.useRef<HTMLInputElement>(null);
  const copyColor = () => {
    copyText(ref.current?.value);
  };

  return (
    <div className="color-code">
      <Input
        type="text"
        {...props}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        data-copied={copied}
        ref={ref}
      />
      <button
        aria-label="copy code"
        type="button"
        className="copy-code"
        onClick={copyColor}
        data-copied={copied}
      >
        <svg
          width="0.7em"
          height="0.7em"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3.5 6.75l.003-2.123A2.25 2.25 0 0 0 2 6.75v10.504a4.75 4.75 0 0 0 4.75 4.75h5.064a6.515 6.515 0 0 1-1.08-1.5H6.75a3.25 3.25 0 0 1-3.25-3.25V6.75z" />
          <path d="M18 11.174V4.25A2.25 2.25 0 0 0 15.75 2h-9A2.25 2.25 0 0 0 4.5 4.25v13a2.25 2.25 0 0 0 2.25 2.25h3.563a6.475 6.475 0 0 1-.294-1.5H6.75a.75.75 0 0 1-.75-.75v-13a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 .75.75V11c.516 0 1.018.06 1.5.174z" />
          <path d="M16.5 12a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm.501 8.503V18h2.496a.5.5 0 0 0 0-1H17v-2.5a.5.5 0 0 0-1 0V17h-2.504a.5.5 0 0 0 0 1H16v2.503a.5.5 0 0 0 1 0z" />
        </svg>
      </button>
    </div>
  );
};

export { Input, CodeInput };
