// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Interface for color object (based on prior context, e.g., { hex: string })
interface Color {
  hex: string;
}

// Debounced URL update function
export const updateUrl = debounce((colorHex: string) => {
  try {
    if (colorHex) {
      window.history.replaceState({}, "", colorHex);
    }
  } catch (e) {
    console.error(e);
  }
}, 100); // 100ms delay
