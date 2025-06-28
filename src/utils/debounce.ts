export function debounce<Func extends (...args: unknown[]) => void>(
  func: Func,
  wait = 300
): (...args: Parameters<Func>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return (...args: Parameters<Func>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
