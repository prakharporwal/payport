import { PaymentStatus } from "../../models/enums/PaymentStatus";
import type { PaymentNotificationEvent } from "../../models/PaymentsEvent";

interface AggregatedData {
  total_volume?: Record<string, number>;
  total_payments?: number;
  total_payments_by_country?: Record<
    string,
    { amount: number; currency: string }
  >;
  total_payments_by_payment_method?: Record<string, { amount: number }>;
}

export const aggregatePaymentsStreamData = (
  data: AggregatedData,
  newEvent: PaymentNotificationEvent,
): AggregatedData => {
  if (!newEvent) return data;

  if (!data.total_volume) {
    data.total_volume = { all: 0, failed: 0, success: 0 };
  }
  data.total_volume.all += 1;

  if (newEvent.status === PaymentStatus.FAILED) {
    data.total_volume.failed += 1;
    return data;
  }

  data.total_volume.success += 1;
  data.total_payments = (data.total_payments ?? 0) + newEvent.amount;

  if (newEvent.country) {
    if (!data.total_payments_by_country) {
      data.total_payments_by_country = {};
    }
    const entry = data.total_payments_by_country[newEvent.country];
    if (entry) {
      entry.amount += newEvent.amount;
    } else {
      data.total_payments_by_country[newEvent.country] = {
        amount: newEvent.amount,
        currency: newEvent.currency,
      };
    }
    // Always reassign — creates a new reference (so chart's useMemo detects the
    // change) and keeps sort order correct as existing country amounts shift.
    data.total_payments_by_country = Object.fromEntries(
      Object.entries(data.total_payments_by_country).sort(
        ([, a], [, b]) => b.amount - a.amount,
      ),
    );
  }

  if (newEvent.paymentMethod) {
    if (!data.total_payments_by_payment_method) {
      data.total_payments_by_payment_method = {};
    }
    const entry = data.total_payments_by_payment_method[newEvent.paymentMethod];
    if (entry) {
      entry.amount += newEvent.amount;
    } else {
      data.total_payments_by_payment_method[newEvent.paymentMethod] = {
        amount: newEvent.amount,
      };
    }
    
    // re-sort every time since relative ranking by amount can change
    data.total_payments_by_payment_method = Object.fromEntries(
      Object.entries(data.total_payments_by_payment_method).sort(
        ([, a], [, b]) => b.amount - a.amount,
      ),
    );
  }

  return data;
};
