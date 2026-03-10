import { getAllRunningProccesses } from "@home/lib/main"
import type { ProcessInfo, RunningScript } from "@ns"

interface AppProps {
  ns: NS
}

const OFFSET = 10

const move = (ns: NS, current: RunningScript) => {
  const holder = ns.self()
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
  const onExitSet = React.useRef<boolean>()
  const switchTab = (newTab: ProcessInfo) => {
    if (currentTab == newTab.pid) return
    if (currentTab) {
      ns.ui.closeTail(currentTab);
      savedWidth.current = ns.getRunningScript(currentTab)?.tailProperties?.width;
    }
    setCurrentTab(newTab.pid)
  }


  React.useEffect(() => {
    let frameId: number;
    const sync = () => {
      if (currentTab) {
        const currentTabData = ns.getRunningScript(currentTab);
        if (currentTabData) move(ns, currentTabData);
        frameId = requestAnimationFrame(sync);
      }
    };
    const init = async () => {
      if (!currentTab) return
      ns.ui.openTail(currentTab);
      await ns.asleep(0)
      const script = ns.getRunningScript(currentTab);
      const holder = ns.self().tailProperties
      const targetW = savedWidth.current ?? script?.tailProperties?.width ?? 0;

      ns.ui.resizeTail(targetW, holder?.height ?? 0, currentTab);
      ns.ui.moveTail((holder?.x ?? 0) - targetW - OFFSET, holder?.y ?? 0, currentTab);
      frameId = requestAnimationFrame(sync);
    }

    const interval = setInterval(() => {
      const nextPids = getAllRunningProccesses(ns).map(v => v.pid);
      setRunningScripts(prev => (prev.length === nextPids.length ? prev : nextPids));
      if (currentTab && !nextPids.includes(currentTab)) {
        ns.ui.closeTail(currentTab);
        setCurrentTab(null);
      }
    }, 500);

    if (currentTab) {
      init()
    }
    if (!onExitSet.current) {
      onExitSet.current = true
      ns.atExit(() => {
        clearInterval(interval);
        cancelAnimationFrame(frameId);
      }, "CLEANUSEEFFECT");
    }

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(frameId);
    };
  }, [ns, currentTab]);

  ns.atExit(() => {
    if (!currentTab) return
    if (ns.getRunningScript(currentTab)?.tailProperties) {
      ns.ui.closeTail(currentTab)
    }
  }, "closecurrenttab")

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
