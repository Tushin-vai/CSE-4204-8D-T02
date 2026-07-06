import React from "react";
import { STATUS_STYLES } from "../data/mockData";

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status] || STATUS_STYLES.Normal}`}>
      {status}
    </span>
  );
}
