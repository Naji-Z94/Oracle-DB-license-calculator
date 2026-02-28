import { useState } from 'react'
import ResultsTable from '../results/ResultsTable'
import type { AppSettings } from '../../types/settings'
import type { ServerRow } from '../../types/server'

type ManualEntryProps = {
  servers: ServerRow[]
  settings: AppSettings
  setServers: React.Dispatch<React.SetStateAction<ServerRow[]>>
}

type ManualEntryForm = {
  serverName: string
  sockets: number
  coresPerSocket: number
  coreFactor: number
  namedUsers?: number
}

const initialForm: ManualEntryForm = {
  serverName: '',
  sockets: 1,
  coresPerSocket: 1,
  coreFactor: 1,
  namedUsers: undefined,
}

function ManualEntry({ servers, settings, setServers }: ManualEntryProps) {
  const [form, setForm] = useState<ManualEntryForm>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleEdit = (row: ServerRow) => {
    setEditingId(row.id)
    setForm({
      serverName: row.serverName,
      sockets: row.sockets,
      coresPerSocket: row.coresPerSocket,
      coreFactor: row.coreFactor,
      namedUsers: row.namedUsers,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const handleRemove = (id: string) => {
    setServers((prev) => prev.filter((row) => row.id !== id))
    if (editingId === id) {
      handleCancelEdit()
    }
  }

  const handleClearAll = () => {
    const confirmed = window.confirm('Clear all server rows?')
    if (!confirmed) {
      return
    }

    setServers([])
    handleCancelEdit()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (editingId === null) {
      const nextServer: ServerRow = {
        id: crypto.randomUUID(),
        serverName: form.serverName,
        sockets: form.sockets,
        coresPerSocket: form.coresPerSocket,
        coreFactor: form.coreFactor,
        namedUsers: form.namedUsers,
      }

      setServers((current) => [...current, nextServer])
      setForm(initialForm)
      return
    }

    const updatedRow: ServerRow = {
      id: editingId,
      serverName: form.serverName,
      sockets: form.sockets,
      coresPerSocket: form.coresPerSocket,
      coreFactor: form.coreFactor,
      namedUsers: form.namedUsers,
    }

    setServers((prev) => prev.map((row) => (row.id === editingId ? updatedRow : row)))
    handleCancelEdit()
  }

  return (
    <div className="manual-entry-layout">
      <section className="panel manual-panel">
        <h2>Manual Entry</h2>
        <p className="muted">Add server rows manually.</p>

        <form className="form-grid manual-form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="serverName">Server Name</label>
            <input
              id="serverName"
              value={form.serverName}
              onChange={(event) => setForm((current) => ({ ...current, serverName: event.target.value }))}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="sockets">Sockets</label>
            <input
              id="sockets"
              type="number"
              min={1}
              value={form.sockets}
              onChange={(event) => setForm((current) => ({ ...current, sockets: Number(event.target.value) || 1 }))}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="coresPerSocket">Cores / Socket</label>
            <input
              id="coresPerSocket"
              type="number"
              min={1}
              value={form.coresPerSocket}
              onChange={(event) =>
                setForm((current) => ({ ...current, coresPerSocket: Number(event.target.value) || 1 }))
              }
              required
            />
          </div>

          <div className="field">
            <label htmlFor="coreFactor">Core Factor</label>
            <input
              id="coreFactor"
              type="number"
              step="0.1"
              min={0}
              value={form.coreFactor}
              onChange={(event) =>
                setForm((current) => ({ ...current, coreFactor: Number(event.target.value) || 1 }))
              }
              required
            />
          </div>

          <div className="field">
            <label htmlFor="namedUsers">Named Users (optional)</label>
            <input
              id="namedUsers"
              type="number"
              min={0}
              value={form.namedUsers ?? ''}
              onChange={(event) => {
                const value = event.target.value
                setForm((current) => ({ ...current, namedUsers: value === '' ? undefined : Number(value) }))
              }}
            />
          </div>

          <div className="actions-row">
            <button type="submit">{editingId === null ? 'Add server' : 'Save changes'}</button>
            {editingId !== null && (
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="summary-row">
          <p className="muted">Total rows: {servers.length}</p>
          <button type="button" onClick={handleClearAll} disabled={servers.length === 0}>
            Clear all
          </button>
        </div>
      </section>

      <ResultsTable servers={servers} settings={settings} onEdit={handleEdit} onRemove={handleRemove} />
    </div>
  )
}

export default ManualEntry
