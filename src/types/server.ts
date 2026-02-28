export type ServerRow = {
  id: string
  serverName: string
  sockets: number
  coresPerSocket: number
  coreFactor: number
  namedUsers?: number
}