import { useEffect, useRef, useState } from "react";
import "./card.css";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function OdometerDigit({ digit }: { digit: number }) {
  const [flashing, setFlashing] = useState(false);
  const prev = useRef(digit);

  useEffect(() => {
    if (prev.current !== digit) {
      setFlashing(true);
      prev.current = digit;
    }
  }, [digit]);

  return (
    <span className="odometer-col-wrapper">
      <span
        className={`odometer-col${flashing ? " odometer-col--flash" : ""}`}
        style={{ "--d": digit } as React.CSSProperties}
        onAnimationEnd={() => setFlashing(false)}
      >
        {DIGITS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </span>
    </span>
  );
}

function OdometerNumber({ value }: { value: string | number | undefined }) {
  return (
    <span className="odometer">
      {String(value ?? "–")
        .split("")
        .map((char, i) =>
          /\d/.test(char) ? (
            <OdometerDigit key={i} digit={Number(char)} />
          ) : (
            <span key={i} className="odometer-char">
              {char}
            </span>
          ),
        )}
    </span>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-wrapper">
      <div className="skeleton-line skeleton-value" />
      <div className="skeleton-line skeleton-label" />
    </div>
  );
}

type CardVariant = "default" | "info" | "error" | "success";

interface CardData {
  title: string | number;
  label: string;
  numeric?: number;
  isHighlighted?: boolean;
  variant?: CardVariant;
}

export default function Card({ data }: { data: CardData }) {
  const { title, label, isHighlighted, variant = "default" } = data;

  const cls = [
    "card-wrapper",
    variant !== "default" && `card--${variant}`,
    isHighlighted && "highlighted",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <div className="card-value">
        <OdometerNumber value={title} />
      </div>
      <div className="card-title">{label}</div>
    </div>
  );
}
