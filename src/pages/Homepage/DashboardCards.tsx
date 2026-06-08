import Card, { CardSkeleton } from "../../Components/Card/Card";
import { formattedPrice } from "../../utils";
import "./homepage.css";

export interface AggregatedData {
  total_payments?: number;
  total_volume?: Record<string, number>;
  total_payments_by_country?: Record<
    string,
    { amount: number; currency?: string }
  >;
  total_payments_by_payment_method?: Record<string, { amount: number }>;
}

interface Props {
  aggregatedData: AggregatedData;
  loading?: boolean;
}

const SKELETON_COUNT = 3;

const BUSINESS_VITALS_CONFIG = (data: AggregatedData) => [
  {
    label: "Total Payments",
    title: formattedPrice(data.total_payments),
    numeric: data.total_payments,
  },
  {
    label: "Total Volume",
    title: data?.total_volume?.all,
    numeric: data?.total_volume?.all,
  },
  {
    label: "Total Success",
    title: data?.total_volume?.success,
    numeric: data?.total_volume?.success,
    variant: "success" as const,
  },
  {
    label: "Total Failed",
    title: data?.total_volume?.failed,
    numeric: data?.total_volume?.failed,
    variant: "error" as const,
  },
];

const DYNAMIC_SECTIONS = [
  {
    heading: "Payment Method",
    dataKey: "total_payments_by_payment_method" as const,
    getCardData: (
      key: string,
      value: { amount: number; currency?: string },
    ) => ({
      label: key,
      title: formattedPrice(value.amount, "none"),
      numeric: value.amount,
    }),
  },
  {
    heading: "Country",
    dataKey: "total_payments_by_country" as const,
    getCardData: (
      key: string,
      value: { amount: number; currency?: string },
    ) => ({
      label: key,
      title: formattedPrice(value.amount, value.currency),
      numeric: value.amount,
    }),
  },
];

export function DashboardCards({ aggregatedData, loading }: Props) {
  return (
    <div>
      <div className="dashboard-list">
        <div className="section-heading">Business Vitals</div>
        <div className="heading-cards">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)
            : BUSINESS_VITALS_CONFIG(aggregatedData).map((cardData, idx) => (
                <Card key={idx} data={cardData} />
              ))}
        </div>
      </div>

      {DYNAMIC_SECTIONS.map(({ heading, dataKey, getCardData }) => (
        <div key={dataKey} className="dashboard-list">
          <h2 className="section-heading">{heading}</h2>
          <div className="heading-cards">
            {loading
              ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                  <CardSkeleton key={i} />
                ))
              : aggregatedData[dataKey] &&
                Object.entries(aggregatedData[dataKey]!).map(
                  ([key, value], idx) =>
                    value ? (
                      <Card key={idx} data={getCardData(key, value)} />
                    ) : null,
                )}
          </div>
        </div>
      ))}
    </div>
  );
}
