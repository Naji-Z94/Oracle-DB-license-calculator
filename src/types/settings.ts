export type AppSettings = {
  edition: 'EE' | 'SE2'
  virtualizationScope: 'physical' | 'hardPartitioning' | 'softPartitioning'
  licenseMetric: 'processor' | 'nup'
  nupMinimumBasis: 'perProcessor' | 'perServer'
  nupMinimumValue: number
}
