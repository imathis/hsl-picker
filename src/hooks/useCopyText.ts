import React from "react";

/**
 * Custom hook to handle copying text to the clipboard.
 * @returns An object with a copyText function and copied state.
 */
export const useCopyText = () => {
  const [copied, setCopied] = React.useState<null | boolean>(null);

  const copyToClipboard = async (text: string) => {
    if ("clipboard" in navigator) {
      return navigator.clipboard.writeText(text);
    }
  };

  const copyText = async (text: string | undefined) => {
    if (typeof text === "string") {
      try {
        await copyToClipboard(text);
        setCopied(true);
        // Reset copied state after 800ms
        setTimeout(() => {
          setCopied(null);
        }, 800);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return { copyText, copied };
};
