import { PaymentStatus } from "../../models/enums/PaymentStatus";
import type { PaymentNotificationEvent } from "../../models/PaymentsEvent";

interface AggregatedData {
  total_volume: Record<string, number>;
  total_payments: number;
  total_payments_by_country: Record<
    string,
    { amount: number; currency: string }
  >;
  total_payments_by_payment_method: Record<string, { amount: number }>;
}

export const aggregatePaymentsStreamData = (
  oldAggregatedData: AggregatedData,
  newEvent: PaymentNotificationEvent,
): AggregatedData => {
  if (!newEvent) return oldAggregatedData;

  let newData = {
    ...oldAggregatedData,
  };
  if (newEvent.status === PaymentStatus.FAILED) {
    newData = {
      ...oldAggregatedData,
      total_volume: {
        all: (oldAggregatedData?.total_volume?.all ?? 0) + 1,
        failed: (oldAggregatedData?.total_volume?.failed ?? 0) + 1,
        success: oldAggregatedData?.total_volume?.success ?? 0,
      },
    };
    return newData;
  }

  newData = {
    ...oldAggregatedData,
    total_volume: {
      all: (oldAggregatedData?.total_volume?.all ?? 0) + 1,
      failed: oldAggregatedData?.total_volume?.failed ?? 0,
      success: (oldAggregatedData?.total_volume?.success ?? 0) + 1,
    },
  };

  newData.total_payments = (newData.total_payments ?? 0) + newEvent.amount;

  if (newEvent.country) {
    const prevCountry = newData.total_payments_by_country || {};
    newData.total_payments_by_country = {
      ...prevCountry,
      [newEvent.country]: {
        amount: (prevCountry[newEvent.country]?.amount ?? 0) + newEvent.amount,
        currency: newEvent.currency,
      },
    };
  }

  if (newEvent.paymentMethod) {
    const prevMethod = newData.total_payments_by_payment_method || {};
    newData.total_payments_by_payment_method = {
      ...prevMethod,
      [newEvent.paymentMethod]: {
        amount:
          (prevMethod[newEvent.paymentMethod]?.amount ?? 0) + newEvent.amount,
      },
    };
  }

  return newData;
};
