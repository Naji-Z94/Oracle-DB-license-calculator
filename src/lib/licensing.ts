import type { AppSettings } from '../types/settings'
import type { ServerRow } from '../types/server'

export type LicenseResult = {
  totalCores: number
  processorLicenses: number
  minNupRequired: number
  nupGap?: number
}

export function computeLicenses(server: ServerRow, settings: AppSettings): LicenseResult {
  const totalCores = server.sockets * server.coresPerSocket
  const processorLicenses =
    settings.edition === 'EE' ? Math.ceil(totalCores * server.coreFactor) : server.sockets
  const minNupRequired =
    settings.nupMinimumBasis === 'perProcessor'
      ? processorLicenses * settings.nupMinimumValue
      : settings.nupMinimumValue

  if (server.namedUsers === undefined) {
    return {
      totalCores,
      processorLicenses,
      minNupRequired,
    }
  }

  return {
    totalCores,
    processorLicenses,
    minNupRequired,
    nupGap: server.namedUsers - minNupRequired,
  }
}
