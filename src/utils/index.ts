export function throttle(func: Function, timer: number) {
  let timeoutId: number | null;
  let lastResult;
  return function (...args: any) {
    if (timeoutId) {
      return;
    }
    lastResult = func.call(this, ...args);

    timeoutId = setTimeout(() => {
      timeoutId = null;
    }, timer);

    return lastResult;
  };
}

export function formattedPrice(amount: number, currency: string = "USD") {
  if (!amount || amount === 0) return "$0";

  if (currency === "none") {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: 2,
    }).format(amount);
    return formatted;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);

  return formatted;
}
