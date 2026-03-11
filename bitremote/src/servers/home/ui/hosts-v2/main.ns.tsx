import { getHosts } from "@home/lib/main"
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from "@tanstack/react-table"
import { getMoneyColor, getRamColor, getSecurityColor } from "./helpers"

export async function main(ns: NS) {
  ns.disableLog("ALL")
  ns.ui.openTail()
  ns.ui.setTailTitle("Hosts")
  ns.ui.resizeTail(1200, 500)
  ns.ui.moveTail(0, 0)
  const hosts = getHosts(ns)
  ns.printRaw(<ServerTable ns={ns} hosts={hosts} />)
  while (ns.self().tailProperties !== null) {
    await ns.asleep(500)
  }
}

type ServerRow = {
  name: string
  money: number
  maxMoney: number
  security: number
  minSecurity: number
  ramUsed: number
  maxRam: number
  growth: number
}

interface ServerTableProps {
  ns: NS
  hosts: string[]
}

const columnHelper = createColumnHelper<ServerRow>()
const rowsEqual = (a: ServerRow[], b: ServerRow[]) => {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    const x = a[i]
    const y = b[i]

    if (
      x.name !== y.name ||
      x.growth !== y.growth ||
      x.money !== y.money ||
      x.maxMoney !== y.maxMoney ||
      x.security !== y.security ||
      x.minSecurity !== y.minSecurity ||
      x.ramUsed !== y.ramUsed ||
      x.maxRam !== y.maxRam
    ) {
      return false
    }
  }

  return true
}
function ServerTable({ ns, hosts }: ServerTableProps) {
  const [data, setData] = React.useState<ServerRow[]>([])

  React.useEffect(() => {
    const update = () => {
      const rows: ServerRow[] = hosts.map((name) => {
        const s = ns.getServer(name)

        return {
          name,
          growth: s.serverGrowth ?? 0,
          money: s.moneyAvailable ?? 0,
          maxMoney: s.moneyMax ?? 0,
          security: s.hackDifficulty ?? 0,
          minSecurity: s.minDifficulty ?? 0,
          ramUsed: s.ramUsed,
          maxRam: s.maxRam,
        }
      })
      setData(prev => (rowsEqual(prev, rows) ? prev : rows))
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
        cell: info => {
          const name = info.getValue()
          const req = ns.getServer(name).requiredHackingSkill ?? 0
          const ratio = req ? Math.min(ns.getHackingLevel() / req, 1) : 1
          const color = getMoneyColor(ratio)
          return (<>
            <span style={{ color: "#00cc66", cursor: "pointer" }}>
              {name}
            </span>
            <span style={{ color: "ff4d4d" }}>
              ({req})
            </span>
            {ratio < 1 && (<span style={{ color }}>({(ratio * 100).toFixed(2)}%)</span>)}
          </>)
        },
        meta: { align: "left" },
      }),

      columnHelper.accessor("maxMoney", {
        header: "Money",
        enableSorting: true,
        cell: info => {
          const { money, maxMoney, name } = info.row.original
          const color = maxMoney > 0 ? getMoneyColor(money / maxMoney) : "#ccc"
          const cannotHack = (ns.getServer(name).requiredHackingSkill ?? 0) > ns.getHackingLevel()
          return (
            <span style={{
              color,
              textDecoration: cannotHack ? "line-through" : "none",
            }}>
              {`${ns.formatNumber(money)} / ${ns.formatNumber(maxMoney)}`}
            </span>)
        },
        meta: { align: "right" },
      }),
      columnHelper.accessor(row => row.maxMoney > 0 ? ((row.money / row.maxMoney)) : 0, {
        enableSorting: true,
        id: "moneyPercent",
        sortingFn: (a, b, id) => {
          const valA = a.getValue<number>(id);
          const valB = b.getValue<number>(id);
          if (valB !== valA) {
            return valB - valA;
          }
          return b.original.maxMoney - a.original.maxMoney;
        },
        header: "Money %",
        cell: info => {
          const percent = info.getValue() * 100
          const color = getMoneyColor(percent / 100)
          return <span style={{ color }}>{percent.toFixed(1)}%</span>
        },
        meta: { align: "right" },
      }),
      columnHelper.accessor("growth", {
        header: "Growth",
        enableSorting: true,
        cell: info => {
          return <span>{info.getValue()}</span>
        },
        meta: { align: "right" }
      }),
      columnHelper.accessor("security", {
        header: "Security",
        enableSorting: true,

        cell: info => {
          const { security, minSecurity } = info.row.original
          const color = minSecurity > 0 ? getSecurityColor(security / minSecurity) : "#ccc"
          return <span style={{ color }}>{`${security.toFixed(2)} / ${minSecurity.toFixed(2)}`}</span>
        },
        meta: { align: "right" },
      }),
      columnHelper.accessor("maxRam", {
        header: "RAM",
        enableSorting: true,
        cell: info => {
          const { ramUsed, maxRam } = info.row.original
          const freeRatio = maxRam > 0 ? (maxRam - ramUsed) / maxRam : 1
          const color = maxRam > 0 ? getRamColor(freeRatio) : "#ccc"
          return <span style={{ color }}>{`${ramUsed.toFixed(1)} / ${maxRam.toFixed(1)} GB`}</span>
        },
        meta: { align: "right" },
      }),
    ],
    [ns]
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState<string>("")
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId)
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
    },
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter
  })
  return (<>
    <input
      type="text"
      placeholder="Search hosts..."
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
        borderCollapse: "collapse",
      }}
    >
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id} style={{ borderBottom: "2px solid #444" }}>
            {hg.headers.map((header) => (
              <th
                key={header.id}
                style={{
                  textAlign: header.column.columnDef.meta?.align ?? "left",
                  width: header.column.columnDef.meta?.width,
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
                {typeof header.column.columnDef.header === "function"
                  ? header.column.columnDef.header(header.getContext())
                  : header.column.columnDef.header}
                {header.column.getIsSorted() === "asc" ? " " : header.column.getIsSorted() === "desc" ? " " : " "}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                style={{
                  textAlign: cell.column.columnDef.meta?.align ?? "left",
                  width: cell.column.columnDef.meta?.width,
                  padding: "4px 8px",
                }}
              >
                {typeof cell.column.columnDef.cell === "function"
                  ? cell.column.columnDef.cell(cell.getContext())
                  : cell.column.columnDef.cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

  </>
  )
}
