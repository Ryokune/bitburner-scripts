import type { NS as _NS, AutocompleteData as _AutocompleteData } from '@ns';

declare global {
  type AutocompleteData = _AutocompleteData
  type NS = _NS;
  // Shuts up about UMD Diagnostics
  type React = typeof import("react")
  type ReactDOM = typeof import("react-dom")
}

import type { RowData } from "@tanstack/react-table"
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'center' | 'right';
    width?: string;
  }
}
