import { useMemo, useEffect, useRef, useState } from "react";
import { throttle } from "../../utils";
import { DashboardCards, type AggregatedData } from "./DashboardCards";
import "./homepage.css";
import { aggregatePaymentsStreamData } from "./dataUtils";
import type { PaymentNotificationEvent } from "../../models/PaymentsEvent";
import { TransactionsBarChart } from "./TransactionsBarChart/chart";
import { DataTable } from "./StreamTable/table";

const MAX_ARRAY_SIZE = 5;
const UI_RENDER_THROTTLE_TIMEOUT_IN_MILLI_S = 800;
const SSE_URL =
  "http://localhost:8080/sse/channel?email=prakharporwal99@gmail.com";

const TRANSACTION_HIGHLIGHT_THRESHOLD = 400;

export default function Homepage() {
  const dataArray = useRef<Array<PaymentNotificationEvent>>([]);
  const [pageData, setPageData] = useState<PaymentNotificationEvent[]>([]);
  const throttledSetPageData = useRef(
    throttle(setPageData, UI_RENDER_THROTTLE_TIMEOUT_IN_MILLI_S),
  ).current;

  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isError, setIsError] = useState<Error | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());

  const tableContainerRef = useRef<HTMLTableElement>(null);

  let transformData = useRef({});
  const aggregatedData = useMemo<AggregatedData>(
    () => transformData.current,
    [transformData.current],
  );

  useEffect(() => {
    setLoading(true);
    const sseChannel = new EventSource(SSE_URL);
    if (sseChannel) {
      sseChannel.addEventListener("open", () => {
        setIsOnline(true);
        setLoading(false);
      });

      sseChannel.addEventListener("message", sseMessageHandler);

      sseChannel.addEventListener("error", (error) => {
        console.log("connection errored", error);
        setIsOnline(false);
        setLoading(false);
        setLastUpdatedAt(Date.now());
        setIsError(new Error("error"));
      });
    }
    // cleanup the connection if page is unmounted
    return () => sseChannel.close();
  }, []);

  function sseMessageHandler(event: MessageEvent<string>) {
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
        tableContainerRef.current.scrollTop =
          tableContainerRef.current.scrollHeight;
      }
    }
  }

  return (
    <div className="page-container">
      <nav className="nav-wrapper">
        <div className="time-stamp">
          {isOnline
            ? "Live data"
            : `Last updated at ${new Date(lastUpdatedAt).toISOString()}`}
        </div>
      </nav>
      <div>
        <h2>Payport Dashboard</h2>
        <section className="content-wrapper">
          <div>
            <div className="table-wrapper" ref={tableContainerRef}>
              <DataTable
                loading={isLoading}
                data={pageData}
                highlightThreshold={TRANSACTION_HIGHLIGHT_THRESHOLD}
              />
            </div>
            <div className={"chart-container"}>
              <TransactionsBarChart
                loading={isLoading}
                label={"Country"}
                data={aggregatedData["total_payments_by_country"]}
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
          <div>
            <DashboardCards
              aggregatedData={{...aggregatedData}}
              loading={isLoading}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
