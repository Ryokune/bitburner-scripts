import { getAllRunningProccesses } from "@home/lib/main"
import type { ProcessInfo, RunningScript } from "@ns"

interface AppProps {
  ns: NS
}

const OFFSET = 10

const move = (ns: NS, current: RunningScript) => {
  const holder = ns.getRunningScript()
  if (!holder?.tailProperties) return

  const { x, y, width, height } = holder.tailProperties
  const contentHeight = current.tailProperties?.height ?? height
  const contentWidth = current.tailProperties?.width ?? width
  const contentX = current.tailProperties?.x ?? -1
  const contentY = current.tailProperties?.y ?? -1
  if ((contentX + contentY) == -2) return
  //ns.ui.resizeTail(contentWidth, height, holder.pid)
  //ns.ui.moveTail(x, y + height + OFFSET, current.pid)
  ns.ui.resizeTail(width, contentHeight, holder.pid)
  //ns.ui.moveTail(x + width + OFFSET, y, current.pid)
  ns.ui.moveTail(contentX + contentWidth + OFFSET, contentY, holder.pid)
}


export const App: React.FC<AppProps> = ({ ns }) => {
  const [runningScripts, setRunningScripts] = React.useState<number[]>([])
  const [currentTab, setCurrentTab] = React.useState<number | null>()
  const savedWidth = React.useRef<number>()
  const switchTab = (newTab: ProcessInfo) => {
    if (currentTab == newTab.pid) return
    if (currentTab) {
      ns.ui.closeTail(currentTab);
      savedWidth.current = ns.getRunningScript(currentTab)?.tailProperties?.width;
    }
    setCurrentTab(newTab.pid)
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      const next = getAllRunningProccesses(ns).map(v => v.pid)
      const set = new Set(next)
      setRunningScripts(prev => {
        if (prev.length === next.length)
          return prev
        else
          return next
      })
      setCurrentTab(tab => {
        if (!tab) return null
        if (!set.has(tab)) {
          ns.ui.closeTail(tab)
          return null
        }
        if (!ns.getRunningScript(tab)?.tailProperties) return null
        return tab
      })
    }, 500)

    ns.atExit(() => clearInterval(interval), "CLEAN")
    return () => clearInterval(interval)
  }, [ns])

  React.useEffect(() => {
    if (!currentTab) return
    let frame: number
    async function init() {
      ns.ui.openTail(currentTab!)
      await ns.asleep(0)
      const currentTabData = ns.getRunningScript(currentTab!)?.tailProperties
      const holderTabData = ns.getRunningScript()?.tailProperties
      const targetWidth = savedWidth.current ?? currentTabData?.width ?? 0
      ns.ui.resizeTail(targetWidth, holderTabData?.height ?? 0, currentTab!)
      ns.ui.moveTail((holderTabData?.x ?? 0) - targetWidth - OFFSET, holderTabData?.y ?? 0, currentTab!)
      const sync = () => {
        const currentTabData = ns.getRunningScript(currentTab!)
        if (!currentTabData) return
        move(ns, currentTabData)
        frame = requestAnimationFrame(sync)
      }
      frame = requestAnimationFrame(sync)
    }
    init()

    return () => cancelAnimationFrame(frame)
  }, [currentTab, ns])

  ns.atExit(() => {
    if (!currentTab) return
    if (ns.getRunningScript(currentTab)?.tailProperties) {
      ns.ui.closeTail(currentTab)
    }
  })

  return (
    <>
      {runningScripts.map(pid => {
        const process = ns.getRunningScript(pid)
        if (!process) {
          return null
        }
        if (process.filename === ns.getScriptName()) return null
        return (
          <button key={process.pid} onClick={() => switchTab(process)}>
            {process.server}:{process.filename} ({process.pid})
          </button>
        )
      })}
      <style>
        {`
          button {
            background-color: #000000;
            color: rgb(0, 204, 0);
            border: 1px solid #333744;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
          }

          button:hover {
            background-color: #2a2e45;
            border-color: #565c7f;
            transform: translateY(-1px);
          }

          button:active {
            background-color: #22263a;
            transform: translateY(0);
          }

          button:disabled {
            background-color: #333744;
            color: #888;
            cursor: not-allowed;
          }
        `}
      </style>
    </>
  )
}
