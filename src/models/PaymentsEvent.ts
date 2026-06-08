import type { Currency } from "./enums/Currency";
import type { PaymentMethodType } from "./enums/PaymentMethods";
import type { Country } from "./enums/Country";
import type { PaymentSource } from "./enums/PaymentSource";
import type { PaymentStatus } from "./enums/PaymentStatus";

export interface PaymentNotificationEvent {
  eventId: string;
  timestamp: string;
  country: Country;
  currency: Currency;
  amount: number;
  paymentMethod: PaymentMethodType;
  source: PaymentSource;
  status: PaymentStatus;
  type?: string;
}
