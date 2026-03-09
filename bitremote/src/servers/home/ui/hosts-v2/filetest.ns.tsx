

import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table"

import type {
  SortingState,
  Row,
  Cell,
  Header,
  SortDirection,
} from "@tanstack/react-table"

import { calculateFitness, getHosts } from "@home/lib/main"
import { getMoneyColor, getRamColor, getSecurityColor } from "./helpers"
import { CreateWindow, CustomInput, flexRender } from "@home/lib/ui"

export async function main(ns: NS) {
  CreateWindow(ns,
    () => <ServerTable ns={ns} hosts={getHosts(ns)} />,
    "HostsTEST", 1200, 500, 0, 0)

  while (true) {
    await ns.asleep(500)
  }
}

type FileRow = {
  name: string
}
type ServerRow = {
  name: string
  moneyAvailable: number
  moneyMax: number
  hackDifficulty: number
  minDifficulty: number
  ramUsed: number
  maxRam: number
  serverGrowth: number
  requiredHackingSkill: number
  hasAdminRights: boolean
  baseDifficulty: number
  subRows?: FileRow[]
}

interface ServerTableProps {
  ns: NS
  hosts: string[]
}

const columnHelper = createColumnHelper<ServerRow>()

function rowEqual(x: ServerRow, y: ServerRow) {
  return x.name === y.name &&
    x.serverGrowth === y.serverGrowth &&
    x.moneyAvailable === y.moneyAvailable &&
    x.moneyMax === y.moneyMax &&
    x.hackDifficulty === y.hackDifficulty &&
    x.minDifficulty === y.minDifficulty &&
    x.ramUsed === y.ramUsed &&
    x.maxRam === y.maxRam &&
    x.hasAdminRights == y.hasAdminRights &&
    x.baseDifficulty == y.baseDifficulty &&
    x.requiredHackingSkill === y.requiredHackingSkill

}
const rowsEqual = (a: ServerRow[], b: ServerRow[]) => {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (!rowEqual(a[i], b[i])) {
      return false
    }
  }

  return true
}
function ServerTable({ ns, hosts }: ServerTableProps) {
  const [data, setData] = React.useState<ServerRow[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState<string>("")

  React.useEffect(() => {
    const update = () => {
      setData(prev => {
        const newRows = hosts.map((name, i) => {
          const s = ns.getServer(name)
          const old = prev[i]
          if (old && rowEqual(old, s as unknown as ServerRow)) return old // reuse object
          return {
            name,
            serverGrowth: s.serverGrowth ?? 0,
            moneyAvailable: s.moneyAvailable ?? 0,
            moneyMax: s.moneyMax ?? 0,
            hackDifficulty: s.hackDifficulty ?? 0,
            minDifficulty: s.minDifficulty ?? 0,
            ramUsed: s.ramUsed,
            maxRam: s.maxRam,
            hasAdminRights: s.hasAdminRights,
            requiredHackingSkill: s.requiredHackingSkill ?? 0,
            baseDifficulty: s.baseDifficulty ?? 0,
            subRows: ns.ls(name).map((v) => ({ name: v }))
          }
        })
        return newRows
      })
    }

    update()
    const interval = setInterval(update, 500)
    ns.atExit(() => { clearInterval(interval); })
    return () => clearInterval(interval)
  }, [ns, hosts])

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        enableSorting: true,
        cell: ({ row }) => {
          const { name, requiredHackingSkill } = row.original
          const ratio = Math.min(ns.getHackingLevel() / requiredHackingSkill, 1)

          const color = getMoneyColor(ratio)
          return (<>
            <span
              style={{ color: "#00cc66", cursor: row.getCanExpand() ? "pointer" : "select" }}
              onClick={row.getToggleExpandedHandler()}
            >
              {row.getIsExpanded() ? "▼ " : row.getCanExpand() ? "▶ " : ""}{name}
            </span>
            <span style={{ color }}>
              {` (${requiredHackingSkill})`}
            </span>
            {ratio < 1 && (<span style={{ color }}>({(ratio * 100).toFixed(2)}%)</span>)}
          </>)
        },
        meta: { align: "left" },
      }),

      columnHelper.accessor("moneyMax", {
        header: "Money",
        enableSorting: true,
        cell: info => {
          const { moneyAvailable: money, moneyMax, requiredHackingSkill } = info.row.original
          const color = moneyMax > 0 ? getMoneyColor(money / moneyMax) : "#ccc"
          const cannotHack = requiredHackingSkill > ns.getHackingLevel()
          return (
            <span style={{
              color,
              textDecoration: cannotHack ? "line-through" : "none",
            }}>
              {`${ns.formatNumber(money)} / ${ns.formatNumber(moneyMax)}`}
            </span>)
        },
        meta: { align: "right" },
      }),
      columnHelper.accessor(row => row.moneyMax > 0 ? ((row.moneyAvailable / row.moneyMax)) : 0, {
        enableSorting: true,
        id: "moneyPercent",
        sortingFn: (a, b, id) => {
          const valA = a.getValue<number>(id);
          const valB = b.getValue<number>(id);
          if (valB !== valA) {
            return valB - valA;
          }
          return b.original.moneyMax - a.original.moneyMax;
        },
        header: "Money %",
        cell: info => {
          const percent = info.getValue() * 100
          const color = getMoneyColor(percent / 100)
          return <span style={{ color }}>{percent.toFixed(1)}%</span>
        },
        meta: { align: "right" },
      }),
      columnHelper.accessor("hackDifficulty", {
        header: "Security",
        enableSorting: true,

        cell: info => {
          const { hackDifficulty, minDifficulty } = info.row.original
          const color = minDifficulty > 0 ? getSecurityColor(hackDifficulty / minDifficulty) : "#ccc"
          return <span style={{ color }}>{`${hackDifficulty.toFixed(2)} / ${minDifficulty.toFixed(2)}`}</span>
        },
        meta: { align: "right" },
      }),
      columnHelper.accessor(row => (row.hackDifficulty - row.baseDifficulty), {
        header: "Base Security",
        enableSorting: true,
        cell: info => {
          const { hackDifficulty, minDifficulty, baseDifficulty } = info.row.original
          const color = minDifficulty > 0 ? getSecurityColor(hackDifficulty / minDifficulty) : "#ccc"
          return <span style={{ color }}>{`${info.getValue().toFixed(2)} (${baseDifficulty})`}</span>
        },
        meta: {
          align: "right"
        }
      }),
      columnHelper.accessor("maxRam", {
        header: "RAM",
        enableSorting: true,
        cell: info => {
          const { ramUsed, maxRam, hasAdminRights } = info.row.original
          const freeRatio = maxRam > 0 ? (maxRam - ramUsed) / maxRam : 1
          const color = maxRam > 0 ? getRamColor(freeRatio) : "#ccc"
          const canRunPrograms = hasAdminRights
          return <span style={{ color, textDecoration: canRunPrograms ? "none" : "line-through" }}>{`${ramUsed.toFixed(1)} / ${maxRam.toFixed(1)} GB`}</span>
        },
        meta: { align: "right" },
      }),
      columnHelper.accessor("serverGrowth", {
        header: "Growth",
        enableSorting: true,
        cell: info => {
          return <span>{info.getValue()}</span>
        },
        meta: { align: "right" }
      }),
      columnHelper.accessor(row => calculateFitness(ns, row.name), {
        header: "Fitness",
        enableSorting: true,
        cell: info => {
          const value = info.getValue()
          const color = getRamColor(Math.min(value, 1))
          return <span style={{ color }}>{`${value.toFixed(2)}`}</span>
        },
        meta: { align: "right" },
      }),
    ],
    [ns]
  )
  const renderSubComponent = ({ row }: { row: Row<ServerRow> }) => {
    return (
      <pre style={{ fontSize: '10px' }}>
        <code>{JSON.stringify(row.original.subRows, null, 2)}</code>
      </pre>
    )
  }
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => !!row.original.subRows?.length,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.renderValue(columnId)
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
    },
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter
  })

  return (
    <>
      <CustomInput
        type="text"
        placeholder="Search"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        style={{
          width: "100%",
          padding: "4px 8px",
          fontFamily: "monospace",
        }}
      />
      <table
        style={{
          tableLayout: "fixed",
          width: "100%",
          fontFamily: "monospace",
          borderCollapse: "separate",
          borderSpacing: 0
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => <HeaderCell header={header} sort={header.column.getIsSorted()} />)}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <BodyRow row={row} />
              {row.getIsExpanded() && (
                <tr>
                  {/* 2nd row is a custom 1 cell row */}
                  <td colSpan={row.getVisibleCells().length}>
                    {renderSubComponent({ row })}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  )
}


// Probably better to put the state handle thing in the header: () thing, so its "decoupled"
// idfk how tanstack is supposed to be used lmao.
const HeaderCell = React.memo(function({ header, sort }: { header: Header<ServerRow, unknown>, sort: boolean | SortDirection }) {
  return (
    <th

      key={header.id}
      colSpan={header.colSpan}
      style={{
        boxShadow: "0 1px 0 rgba(255,255,255,0.15)",
        position: "sticky",
        top: -1,
        background: "#000", // required so rows don't show through
        zIndex: 1,
        textAlign: header.column.columnDef.meta?.align ?? "left",
        padding: "4px 8px",
        color: "#aaa",
        fontWeight: "bold",
        cursor: header.column.getCanSort() ? "pointer" : "default"
      }}
      onClick={() => {
        if (header.column.getCanSort()) {
          header.column.toggleSorting()
        }
      }}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      {sort === "asc"
        ? " "
        : sort === "desc"
          ? " "
          : " "}
    </th>
  )
}, (prev, next) => prev.header.column.id === next.header.column.id &&
  prev.sort == next.sort)

const RowCell = ({ cell }: { cell: Cell<ServerRow, unknown> }) => {
  return (
    <td key={cell.id}
      style={{
        textAlign: cell.column.columnDef.meta?.align ?? "left",
        padding: "4px 8px",

      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}

// ill memo this if it fucks perf up somehow
const BodyRow =
  ({ row }: { row: Row<ServerRow> }) => {
    return (
      <tr
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {row.getVisibleCells().map((cell: any) => {
          return <RowCell cell={cell} />
        })}
      </tr>
    )
  }

// this is becoming a monolith
