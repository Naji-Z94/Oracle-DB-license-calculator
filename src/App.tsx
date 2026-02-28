import { useState } from 'react'
import './App.css'
import ManualEntry from './features/manual/ManualEntry'
import Settings from './features/settings/Settings'
import UploadExcel from './features/upload/UploadExcel'
import type { AppSettings } from './types/settings'
import type { ServerRow } from './types/server'

type Tab = 'upload' | 'manual' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [servers, setServers] = useState<ServerRow[]>([])
  const [settings, setSettings] = useState<AppSettings>({
    edition: 'EE',
    virtualizationScope: 'physical',
    licenseMetric: 'processor',
    nupMinimumBasis: 'perProcessor',
    nupMinimumValue: 25,
  })

  return (
    <main className="app">
      <header className="app-header">
        <h1>Oracle DB License Calculator</h1>
      </header>

      <nav className="tabs" aria-label="Main sections">
        <button
          type="button"
          className={activeTab === 'upload' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('upload')}
        >
          Upload Excel
        </button>
        <button
          type="button"
          className={activeTab === 'manual' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('manual')}
        >
          Manual Entry
        </button>
        <button
          type="button"
          className={activeTab === 'settings' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      {activeTab === 'upload' && <UploadExcel servers={servers} setServers={setServers} />}
      {activeTab === 'manual' && <ManualEntry servers={servers} settings={settings} setServers={setServers} />}
      {activeTab === 'settings' && <Settings settings={settings} setSettings={setSettings} />}
    </main>
  )
}

export default App
