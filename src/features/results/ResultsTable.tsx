import { computeLicenses } from '../../lib/licensing'
import * as XLSX from 'xlsx'
import type { AppSettings } from '../../types/settings'
import type { ServerRow } from '../../types/server'

type ResultsTableProps = {
  servers: ServerRow[]
  settings: AppSettings
  onEdit: (row: ServerRow) => void
  onRemove: (id: string) => void
}

function ResultsTable({ servers, settings, onEdit, onRemove }: ResultsTableProps) {
  const rows = servers.map((server) => ({
    server,
    result: computeLicenses(server, settings),
  }))

  const totalProcessorLicenses = rows.reduce((sum, row) => sum + row.result.processorLicenses, 0)
  const totalMinNupRequired = rows.reduce((sum, row) => sum + row.result.minNupRequired, 0)

  const handleExportResults = () => {
    const resultsData = rows.map(({ server, result }) => ({
      serverName: server.serverName,
      sockets: server.sockets,
      coresPerSocket: server.coresPerSocket,
      totalCores: result.totalCores,
      coreFactor: server.coreFactor,
      processorLicenses: result.processorLicenses,
      minNupRequired: result.minNupRequired,
      namedUsers: server.namedUsers ?? '',
      nupGap: result.nupGap ?? '',
    }))

    const inputsData = servers.map((server) => ({
      serverName: server.serverName,
      sockets: server.sockets,
      coresPerSocket: server.coresPerSocket,
      coreFactor: server.coreFactor,
      namedUsers: server.namedUsers ?? '',
    }))

    const wb = XLSX.utils.book_new()
    const resultsSheet = XLSX.utils.json_to_sheet(resultsData)
    const inputsSheet = XLSX.utils.json_to_sheet(inputsData)
    const settingsSheet = XLSX.utils.json_to_sheet([
      {
        edition: settings.edition,
        virtualizationScope: settings.virtualizationScope,
        licenseMetric: settings.licenseMetric,
        nupMinimumBasis: settings.nupMinimumBasis,
        nupMinimumValue: settings.nupMinimumValue,
      },
    ])

    XLSX.utils.book_append_sheet(wb, resultsSheet, 'Results')
    XLSX.utils.book_append_sheet(wb, inputsSheet, 'Inputs')
    XLSX.utils.book_append_sheet(wb, settingsSheet, 'Settings')

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const filename = `oracle_db_results_${year}-${month}-${day}.xlsx`

    XLSX.writeFile(wb, filename)
  }

  return (
    <section className="panel results-panel">
      <div className="results-header">
        <h2>Results</h2>
        <button type="button" onClick={handleExportResults} disabled={rows.length === 0}>
          Export results (XLSX)
        </button>
      </div>
      <p className="muted">Calculated licensing results for current server entries.</p>
      {settings.virtualizationScope === 'softPartitioning' && (
        <div className="warning-box">Warning: soft partitioning may carry Oracle policy risk.</div>
      )}

      <div className="table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>Server</th>
              <th>Sockets</th>
              <th>Cores/Socket</th>
              <th>Total Cores</th>
              <th>Core Factor</th>
              <th>Processor Licenses</th>
              <th>Min NUP Required</th>
              <th>Named Users</th>
              <th>NUP Gap</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="muted-cell">
                  No server rows yet.
                </td>
              </tr>
            )}

            {rows.map(({ server, result }) => (
              <tr key={server.id}>
                <td>{server.serverName}</td>
                <td>{server.sockets}</td>
                <td>{server.coresPerSocket}</td>
                <td>{result.totalCores}</td>
                <td>{server.coreFactor}</td>
                <td>{result.processorLicenses}</td>
                <td>{result.minNupRequired}</td>
                <td>{server.namedUsers ?? '-'}</td>
                <td>{result.nupGap ?? '-'}</td>
                <td className="table-actions">
                  {settings.edition === 'SE2' && server.sockets > 2 && (
                    <span className="warning-badge">SE2 exceeds 2-socket limit</span>
                  )}
                  <button type="button" onClick={() => onEdit(server)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onRemove(server.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>{totalProcessorLicenses}</td>
              <td>{totalMinNupRequired}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}

export default ResultsTable
