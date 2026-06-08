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

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  if (!formatterCache.has(currency)) {
    formatterCache.set(
      currency,
      currency === "none"
        ? new Intl.NumberFormat("en-US", {
            style: "decimal",
            maximumFractionDigits: 2,
          })
        : new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
          }),
    );
  }
  return formatterCache.get(currency)!;
}

export function formattedPrice(amount: number, currency: string = "USD") {
  if (!amount || amount === 0) return "$0";
  return getFormatter(currency).format(amount);
}
