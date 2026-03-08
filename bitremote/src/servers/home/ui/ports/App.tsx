import { PortDaemonData } from "@home/daemons/portDaemon.ns"

interface AppProps {
  ns: NS
}

export const App: React.FC<AppProps> = ({ ns }) => {
  ns.tprint(PortDaemonData.ports)
  return <>
    <div>
      Ports: {PortDaemonData.ports}
    </div>
    <div>
      Available: {PortDaemonData.available}
    </div>
  </>
}

