interface FileTableProps {
  ns: NS
  serverName: string
}

export default function FileTable({ ns, serverName }: FileTableProps) {
  const [files, setFiles] = React.useState<string[]>([])

  React.useEffect(() => {
    const files = ns.ls(serverName)
    setFiles(files) // array of file names
  }, [ns, serverName])

  return (
    <table style={{ width: "100%", fontFamily: "monospace", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>File</th>
          <th style={{ textAlign: "left" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {files.map(file => (
          <tr key={file}>
            <td>{file}</td>
            <td>
              <select onChange={(e) => {
                const action = e.target.value
                // handle file action here
                ns.print(`Performing ${action} on ${file} of ${serverName}`)
                e.target.selectedIndex = 0
              }}>
                <option disabled selected>Action...</option>
                <option>Copy</option>
                <option>Delete</option>
                <option>Run</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

