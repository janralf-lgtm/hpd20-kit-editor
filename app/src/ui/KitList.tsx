import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import type { Backup } from "../codec/backup";

interface Row {
  id: string; // stable id following the kit during reorder
  origin: number; // current slot index
}

function KitRow({
  row,
  slot,
  name,
  sub,
  selected,
  onSelect,
}: {
  row: Row;
  slot: number;
  name: string;
  sub: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`kit-row ${selected ? "sel" : ""} ${isDragging ? "drag" : ""}`}
      onClick={onSelect}
    >
      <span className="grip" {...attributes} {...listeners} title="Ziehen zum Umsortieren">
        ⠿
      </span>
      <span className="kit-num">{slot + 1}</span>
      <span className="kit-name">
        {name || <i className="muted">(leer)</i>}
        {sub ? <small>{sub}</small> : null}
      </span>
    </li>
  );
}

export function KitList({
  backup,
  rev,
  selectedKit,
  onSelectKit,
  onEdit,
}: {
  backup: Backup;
  rev: number;
  selectedKit: number;
  onSelectKit: (i: number) => void;
  onEdit: () => void;
}) {
  // Stable ids: order array maps display position -> id. We map id->slot by index.
  const [order, setOrder] = useState<Row[]>(() =>
    Array.from({ length: backup.kitCount() }, (_, i) => ({
      id: `k${i}`,
      origin: i,
    })),
  );
  const [filter, setFilter] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = order.findIndex((r) => r.id === active.id);
    const to = order.findIndex((r) => r.id === over.id);
    backup.moveKit(from, to);
    setOrder((o) => arrayMove(o, from, to));
    onSelectKit(to);
    onEdit();
  };

  // rev forces re-read of names after edits
  const rows = useMemo(() => {
    void rev;
    return order.map((r, slot) => ({
      r,
      slot,
      name: backup.getKit(slot).getName(),
      sub: backup.getKit(slot).getSubName(),
    }));
  }, [order, rev, filter, backup]);

  const visible = filter.trim()
    ? rows.filter(
        (x) =>
          x.name.toLowerCase().includes(filter.trim().toLowerCase()) ||
          x.sub.toLowerCase().includes(filter.trim().toLowerCase()),
      )
    : rows;

  return (
    <div className="kit-list">
      <input
        className="kit-filter"
        placeholder="Kits filtern…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={order.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul>
            {visible.map((x) => (
              <KitRow
                key={x.r.id}
                row={x.r}
                slot={x.slot}
                name={x.name}
                sub={x.sub}
                selected={x.slot === selectedKit}
                onSelect={() => onSelectKit(x.slot)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
