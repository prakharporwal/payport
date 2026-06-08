import "./card.css";

export default function Card({ data }) {
  const { subtitle, title, numeric, label, isHighlighted } = data;

  return (
    <div className={`card-wrapper ${isHighlighted ? "highlighted" : ""}`}>
      <div className="card-value">{title}</div>
      <div className="card-title">{label}</div>
    </div>
  );
}

const OdometerNumber = (value) => {
  return (
    <data id="amount" value={value}>
      <span className="digit"></span>
      <span className="digit"></span>
      <span className="digit"></span>
      <span className="digit"></span>
      <span className="digit"></span>
      <span className="digit"></span>
      <span className="digit"></span>
    </data>
  );
};
