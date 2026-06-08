import { useEffect, useMemo, useRef, useState } from "react";
import { throttle } from "../../utils";
import { DashboardCards, type AggregatedData } from "./DashboardCards";
import "./homepage.css";
import { aggregatePaymentsStreamData } from "./dataUtils";
import type { PaymentNotificationEvent } from "../../models/PaymentsEvent";
import { TransactionsBarChart } from "./TransactionsBarChart/chart.tsx/chart";
import { DataTable } from "./StreamTable/table";

const MAX_ARRAY_SIZE = 5;

export default function Homepage() {
  const dataArray = useRef<Array<any>>([]);
  const [pageData, setPageData] = useState([]);
  const throttledSetPageData = useRef(throttle(setPageData, 700)).current;

  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isError, setIsError] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());

  const tableContainerRef = useRef(null);

  let transformData = useRef({});
  const aggregatedData = useMemo<AggregatedData>(
    () => transformData.current,
    [transformData.current],
  );

  useEffect(() => {
    setLoading(true);

    const sseChannel = new EventSource(
      "http://3.108.250.165:3000/events?email=prakharporwal99@gmail.com",
    );
    if (sseChannel) {
      sseChannel.addEventListener("open", (event) => {
        setIsOnline(true);
        setLoading(false);
      });

      sseChannel.addEventListener("message", (event) => {
        const eventData: PaymentNotificationEvent = JSON.parse(event.data);
        if (eventData.type === "connected") {
          setIsOnline(true);
          setLoading(false);
        }
        if (eventData.eventId) {
          dataArray.current.push(eventData);
          dataArray.current = dataArray.current.slice(
            -MAX_ARRAY_SIZE,
            dataArray.current.length,
          );

          transformData.current = aggregatePaymentsStreamData(
            transformData.current,
            eventData,
          );

          setPageData([...dataArray.current]);

          if (tableContainerRef.current) {
            const container = tableContainerRef.current;
            if (container) {
              container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
              });
            }
          }
        }
      });

      sseChannel.addEventListener("error", (error) => {
        console.log("connection errored", error);
        setIsOnline(false);
        setLastUpdatedAt(Date.now());
      });
    }

    // cleanup the connection if page is unmounted
    return () => sseChannel.close();
  }, []);

  return (
    <div className="page-container">
      <nav className="nav-wrapper">
        <div className="time-stamp">
          {isOnline
            ? "Live data"
            : `Last updated at ${new Date(lastUpdatedAt).toISOString()}`}
        </div>
      </nav>
      <section className="content-wrapper">
        <div className="first-fold-section">
          <DashboardCards aggregatedData={aggregatedData} loading={isLoading} />
          <div className="grid-right">
            <div className="table-wrapper" ref={tableContainerRef}>
              <DataTable loading={isLoading} data={pageData} />
            </div>
            <div className={"chart-container"}>
              <TransactionsBarChart
                loading={isLoading}
                label={"Country"}
                data={{ ...aggregatedData["total_payments_by_country"] }}
              />
              </div>
              <div className={"chart-container"}>
              <TransactionsBarChart
                loading={isLoading}
                label={"Payment Method"}
                data={aggregatedData["total_payments_by_payment_method"]}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
