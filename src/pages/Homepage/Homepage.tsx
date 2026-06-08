import { useEffect, useMemo, useRef, useState } from "react";
import { formattedPrice, throttle } from "../../utils";
import Card from "../../Components/Card/Card";
import "./homepage.css";
import { aggregatePaymentsStreamData } from "./dataUtils";
import type { PaymentNotificationEvent } from "../../models/PaymentsEvent";
import { TransactionsBarChart } from "./TransactionsBarChart/chart.tsx/chart";
import { DataTable } from "./StreamTable/table";

const MAX_ARRAY_SIZE = 5;

interface IPageData {
  total_payments: object;
  total_volume: object;
  total_payments_by_country: object;
  total_payments_by_payment_method: object;
}

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
  const aggregatedData = useMemo<IPageData>(
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
        console.log("connection is opened", event);
        setIsOnline(true);
        setLoading(false);
      });

      sseChannel.addEventListener("message", (event) => {
        const eventData: PaymentNotificationEvent = JSON.parse(event.data);
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

          throttledSetPageData([...dataArray.current]);

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
          <div>
            <div className="dashboard-list">
              <div className="section-heading">Overall</div>
              <div className="heading-cards">
                <Card
                  data={{
                    label: "Total Payments",
                    title: formattedPrice(aggregatedData["total_payments"]),
                    numeric: aggregatedData["total_payments"],
                  }}
                ></Card>
                <Card
                  data={{
                    label: "Total Volume",
                    title: aggregatedData["total_volume"],
                    numeric: aggregatedData["total_volume"],
                  }}
                ></Card>
              </div>
            </div>
            <div className="dashboard-list">
              <h2 className="section-heading">Payment Method</h2>
              <div className="heading-cards">
                {aggregatedData &&
                  aggregatedData["total_payments_by_payment_method"] &&
                  Object.entries(
                    aggregatedData["total_payments_by_payment_method"],
                  ).map(([key, value], idx) => {
                    if (
                      !aggregatedData ||
                      !aggregatedData["total_payments_by_payment_method"] ||
                      !value
                    )
                      return null;
                    return (
                      <Card
                        key={idx}
                        data={{
                          label: key,
                          title: formattedPrice(value),
                          numeric: value,
                        }}
                      ></Card>
                    );
                  })}
              </div>
            </div>
            <div className="dashboard-list">
              <h2 className="section-heading">Country</h2>
              <div className="heading-cards">
                {aggregatedData &&
                  aggregatedData["total_payments_by_country"] &&
                  Object.entries(
                    aggregatedData["total_payments_by_country"],
                  ).map(([key, value], idx) => {
                    if (
                      !aggregatedData ||
                      !aggregatedData["total_payments_by_country"] ||
                      !value
                    )
                      return null;
                    return (
                      <Card
                        key={idx}
                        data={{
                          label: key,
                          title: formattedPrice(value?.amount, value?.currency),
                          numeric: value,
                        }}
                      ></Card>
                    );
                  })}
              </div>
            </div>
          </div>
           <div className="table-wrapper" ref={tableContainerRef}>
              <DataTable loading={isLoading} data={pageData} />
            </div>
        </div>
        <div className={"chart-container"}>
          <TransactionsBarChart
            loading={isLoading}
            label={"Country"}
            data={{ ...aggregatedData["total_payments_by_country"] }}
          />
          <TransactionsBarChart
            loading={isLoading}
            label={"Payment Method"}
            data={aggregatedData["total_payments_by_payment_method"]}
          />
        </div>
      </section>
    </div>
  );
}
