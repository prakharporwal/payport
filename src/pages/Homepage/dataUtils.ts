// has bugs
// country data updated if that country not in event
// which is not expected
// payment method data updated if that payment method not in event
// which is not expected

import { PaymentStatus } from "../../models/enums/PaymentStatus";
import type { PaymentNotificationEvent } from "../../models/PaymentsEvent";

interface AggregatedData {
  total_volume: number;
  total_payments: number;
  total_payments_by_country: any;
  total_payments_by_payment_method: any;
}

export const aggregatePaymentsStreamData = (
  oldAggregatedData: AggregatedData,
  newEvent: PaymentNotificationEvent,
) => {
  if (!newEvent) return oldAggregatedData;

  const newData = { ...oldAggregatedData };
  if (newData["total_volume"] === undefined) {
    newData["total_volume"] = 1;
  } else {
    newData["total_volume"] = newData["total_volume"] + 1;
  }

  // if status failed no aggregate value changes except volume
  if (newEvent.status === PaymentStatus.FAILED) {
    return newData;
  }

  newData["total_payments"] =
    (newData["total_payments"] || 0) + newEvent.amount;

  const prevCountry = newData["total_payments_by_country"] || {};
  newData["total_payments_by_country"] = {
    ...prevCountry,
    [newEvent.country]: {
      amount: (prevCountry[newEvent.country] && prevCountry[newEvent.country].amount || 0) + newEvent.amount,
      currency: newEvent.currency,
    },
  };

  const prevMethod = newData["total_payments_by_payment_method"] || {};
  newData["total_payments_by_payment_method"] = {
    ...prevMethod,
    [newEvent.paymentMethod]:
      (prevMethod[newEvent.paymentMethod] || 0) + newEvent.amount,
  };

  return newData;
};
