import { formattedPrice } from "../../../utils";
import "./table.css";

const tableColumns = ["Id", "Country", "Currency", "Amount", "Payment Method", "Source", "Status"]
export function DataTable({ data, loading }) {
  if (loading) {
    return <TableSkeleton rowCount={5} columns={tableColumns} />;
  }

  if (!data || !Array.isArray(data) || data.length === 0){
    return <div>No data to show</div>;
  }
  return (
    <table>
      <thead>
        <tr>
          {tableColumns.map((item)=><th>{item}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => {
          return (
            <tr key={item.eventId} className={item.amount>=400 ? "row-highlight":""}>
              <td>{idx + 1}</td>
              <td>{item.country}</td>
              <td>{item.currency}</td>
              <td>{formattedPrice(item.amount, item.currency)}</td>
              <td>{item.paymentMethod}</td>
              <td>{item.source}</td>
              <td>{item.status}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TableSkeleton({ rowCount, columns }) {
  return (
    <table className="skeleton-table">
      <thead>
        <tr>
          {columns.map((item)=><th>{item}</th>)}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rowCount }).map((_, i) => (
          <tr key={i}>
            {columns.map((_, j) => (
              <td key={j}>
                <div className="skeleton-text"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
