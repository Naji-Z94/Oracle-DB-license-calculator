import { useState } from 'react'
import * as XLSX from 'xlsx'
import type { ServerRow } from '../../types/server'

type UploadExcelProps = {
  servers: ServerRow[]
  setServers: React.Dispatch<React.SetStateAction<ServerRow[]>>
}

type ParsedServerRow = Omit<ServerRow, 'id'>
type ImportMode = 'append' | 'replace'

type ColumnTargets = {
  serverName: string
  sockets: string
  coresPerSocket: string
  coreFactor?: string
  namedUsers?: string
}

const aliases = {
  serverName: ['servername', 'server name', 'server', 'name'],
  sockets: ['sockets', 'socket'],
  coresPerSocket: ['corespersocket', 'cores/socket', 'cores per socket', 'cores_per_socket'],
  coreFactor: ['corefactor', 'core factor', 'factor'],
  namedUsers: ['namedusers', 'named users', 'nup'],
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[\s_/-]+/g, '')
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  const text = String(value ?? '').trim()
  if (text === '') {
    return Number.NaN
  }

  return Number(text)
}

function pickHeaderKey(candidates: string[], normalizedMap: Map<string, string>): string | undefined {
  for (const candidate of candidates) {
    const found = normalizedMap.get(normalizeHeader(candidate))
    if (found) {
      return found
    }
  }
  return undefined
}

function UploadExcel({ servers, setServers }: UploadExcelProps) {
  const [detectedRows, setDetectedRows] = useState(0)
  const [importRows, setImportRows] = useState<ParsedServerRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [importMode, setImportMode] = useState<ImportMode>('append')
  const [selectedFileName, setSelectedFileName] = useState('')

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setSelectedFileName(file.name)
    setDetectedRows(0)
    setImportRows([])
    setErrors([])

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]

      if (!firstSheetName) {
        setErrors(['Workbook has no sheets.'])
        return
      }

      const sheet = workbook.Sheets[firstSheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
      })

      setDetectedRows(rows.length)

      if (rows.length === 0) {
        setErrors(['First sheet is empty.'])
        return
      }

      const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
      const normalizedMap = new Map<string, string>(keys.map((key) => [normalizeHeader(key), key]))

      const columns: ColumnTargets = {
        serverName: pickHeaderKey(aliases.serverName, normalizedMap) ?? '',
        sockets: pickHeaderKey(aliases.sockets, normalizedMap) ?? '',
        coresPerSocket: pickHeaderKey(aliases.coresPerSocket, normalizedMap) ?? '',
        coreFactor: pickHeaderKey(aliases.coreFactor, normalizedMap),
        namedUsers: pickHeaderKey(aliases.namedUsers, normalizedMap),
      }

      const parseErrors: string[] = []
      if (!columns.serverName) parseErrors.push('Missing required column: serverName')
      if (!columns.sockets) parseErrors.push('Missing required column: sockets')
      if (!columns.coresPerSocket) parseErrors.push('Missing required column: coresPerSocket')

      if (parseErrors.length > 0) {
        setErrors(parseErrors)
        return
      }

      const mappedRows: ParsedServerRow[] = []

      rows.forEach((rawRow, index) => {
        const excelRowNumber = index + 2
        const serverName = String(rawRow[columns.serverName] ?? '').trim()
        const sockets = toNumber(rawRow[columns.sockets])
        const coresPerSocket = toNumber(rawRow[columns.coresPerSocket])
        const coreFactorRaw = columns.coreFactor ? rawRow[columns.coreFactor] : ''
        const coreFactorText = String(coreFactorRaw ?? '').trim()
        const coreFactor = coreFactorText === '' ? 1 : toNumber(coreFactorRaw)
        const namedUsersRaw = columns.namedUsers ? rawRow[columns.namedUsers] : ''
        const namedUsersText = String(namedUsersRaw ?? '').trim()

        if (!serverName) {
          parseErrors.push(`Row ${excelRowNumber}: serverName is required.`)
          return
        }

        if (!Number.isFinite(sockets) || sockets <= 0) {
          parseErrors.push(`Row ${excelRowNumber}: sockets must be a positive number.`)
          return
        }

        if (!Number.isFinite(coresPerSocket) || coresPerSocket <= 0) {
          parseErrors.push(`Row ${excelRowNumber}: coresPerSocket must be a positive number.`)
          return
        }

        if (!Number.isFinite(coreFactor) || coreFactor <= 0) {
          parseErrors.push(`Row ${excelRowNumber}: coreFactor must be a positive number.`)
          return
        }

        let namedUsers: number | undefined = undefined
        if (namedUsersText !== '') {
          const parsedNamedUsers = toNumber(namedUsersRaw)
          if (!Number.isFinite(parsedNamedUsers) || parsedNamedUsers < 0) {
            parseErrors.push(`Row ${excelRowNumber}: namedUsers must be a non-negative number or blank.`)
            return
          }
          namedUsers = parsedNamedUsers
        }

        mappedRows.push({
          serverName,
          sockets,
          coresPerSocket,
          coreFactor,
          namedUsers,
        })
      })

      setImportRows(mappedRows)
      setErrors(parseErrors)
    } catch {
      setErrors(['Failed to parse the selected Excel file.'])
    }
  }

  const handleImport = () => {
    const rowsWithIds: ServerRow[] = importRows.map((row) => ({
      id: crypto.randomUUID(),
      ...row,
    }))

    if (importMode === 'append') {
      setServers((prev) => [...prev, ...rowsWithIds])
      return
    }

    setServers(rowsWithIds)
  }

  const previewRows = importRows.slice(0, 5)

  return (
    <section className="panel">
      <h2>Upload Excel</h2>
      <p className="muted">Parse the first sheet and map columns to server fields.</p>

      <a
        href="/templates/oracle_db_licensing_input_template.xlsx"
        download
        className="button-link"
      >
        Download Excel template
      </a>

      <div className="field">
        <label htmlFor="excel-file">Excel file (.xlsx)</label>
        <input id="excel-file" type="file" accept=".xlsx" onChange={handleFileChange} />
      </div>

      {selectedFileName && <p className="muted">Selected file: {selectedFileName}</p>}

      {errors.length > 0 && (
        <div className="error-box">
          <p className="error-title">Parsing errors ({errors.length})</p>
          <ul className="error-list">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="muted">Rows detected: {detectedRows}</p>

      {previewRows.length > 0 && (
        <div className="table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th>Server</th>
                <th>Sockets</th>
                <th>Cores/Socket</th>
                <th>Core Factor</th>
                <th>Named Users</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, index) => (
                <tr key={`${row.serverName}-${index}`}>
                  <td>{row.serverName}</td>
                  <td>{row.sockets}</td>
                  <td>{row.coresPerSocket}</td>
                  <td>{row.coreFactor}</td>
                  <td>{row.namedUsers ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="upload-actions">
        <div className="field">
          <label>Import mode</label>
          <div className="actions-row">
            <label>
              <input
                type="radio"
                name="import-mode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
              />
              {' '}
              Append
            </label>
            <label>
              <input
                type="radio"
                name="import-mode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
              />
              {' '}
              Replace existing
            </label>
          </div>
        </div>

        <button type="button" onClick={handleImport} disabled={importRows.length === 0 || errors.length > 0}>
          Import {importRows.length} row{importRows.length === 1 ? '' : 's'}
        </button>
      </div>

      <p className="muted">Current servers in memory: {servers.length}</p>
    </section>
  )
}

export default UploadExcel
