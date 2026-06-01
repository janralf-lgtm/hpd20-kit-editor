import { useMemo, useState } from "react";
import { INSTRUMENTS } from "../data/instruments";

const ALL = Object.entries(INSTRUMENTS).map(([k, v]) => ({
  num: Number(k),
  name: v.name,
}));

export function InstrumentPicker({
  value,
  onChange,
  onClose,
}: {
  value: number;
  onChange: (num: number) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ALL; // all 850 instruments, list is scrollable
    return ALL.filter(
      (i) => i.name.toLowerCase().includes(s) || String(i.num).includes(s),
    );
  }, [q]);

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker" onClick={(e) => e.stopPropagation()}>
        <div className="picker-head">
          <input
            autoFocus
            placeholder="Instrument suchen… (Name oder Nummer)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={onClose}>✕</button>
        </div>
        <ul className="picker-list">
          {results.map((i) => (
            <li
              key={i.num}
              className={i.num === value ? "sel" : ""}
              onClick={() => {
                onChange(i.num);
                onClose();
              }}
            >
              <span className="picker-num">{i.num}</span>
              {i.name}
            </li>
          ))}
          {results.length === 0 && <li className="muted">Keine Treffer</li>}
        </ul>
      </div>
    </div>
  );
}
