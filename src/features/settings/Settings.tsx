import type { AppSettings } from '../../types/settings'

type SettingsProps = {
  settings: AppSettings
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>
}

function Settings({ settings, setSettings }: SettingsProps) {
  return (
    <section className="panel">
      <h2>Settings</h2>
      <p className="muted">Global calculation settings.</p>

      <div className="field">
        <label htmlFor="edition">Edition</label>
        <select
          id="edition"
          value={settings.edition}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              edition: event.target.value as AppSettings['edition'],
            }))
          }
        >
          <option value="EE">EE</option>
          <option value="SE2">SE2</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="virtualizationScope">Virtualization Scope</label>
        <select
          id="virtualizationScope"
          value={settings.virtualizationScope}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              virtualizationScope: event.target.value as AppSettings['virtualizationScope'],
            }))
          }
        >
          <option value="physical">Physical</option>
          <option value="hardPartitioning">Hard partitioning</option>
          <option value="softPartitioning">Soft partitioning</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="licenseMetric">License Metric</label>
        <select
          id="licenseMetric"
          value={settings.licenseMetric}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              licenseMetric: event.target.value as AppSettings['licenseMetric'],
            }))
          }
        >
          <option value="processor">processor</option>
          <option value="nup">nup</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="nupMinimumBasis">NUP Minimum Basis</label>
        <select
          id="nupMinimumBasis"
          value={settings.nupMinimumBasis}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              nupMinimumBasis: event.target.value as AppSettings['nupMinimumBasis'],
            }))
          }
        >
          <option value="perProcessor">perProcessor</option>
          <option value="perServer">perServer</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="nupMinimumValue">NUP Minimum Value</label>
        <input
          id="nupMinimumValue"
          type="number"
          min={1}
          value={settings.nupMinimumValue}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              nupMinimumValue: Number(event.target.value) || 1,
            }))
          }
        />
      </div>

      <div className="actions-row">
        <button
          type="button"
          onClick={() =>
            setSettings((current) => ({
              ...current,
              edition: 'EE',
              nupMinimumBasis: 'perProcessor',
              nupMinimumValue: 25,
            }))
          }
        >
          EE preset (25 NUP per processor)
        </button>
        <button
          type="button"
          onClick={() =>
            setSettings((current) => ({
              ...current,
              edition: 'SE2',
              nupMinimumBasis: 'perServer',
              nupMinimumValue: 10,
            }))
          }
        >
          SE2 preset (10 NUP per server - ODA context)
        </button>
      </div>

      <p className="muted">Your Oracle ordering document prevails if conflicts.</p>
    </section>
  )
}

export default Settings
