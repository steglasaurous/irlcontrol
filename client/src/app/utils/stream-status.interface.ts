export interface StreamStatus {
  streamName: string,
  bitrate: number,
  connected: boolean,
  timestamp: number,
  rtt?: number,
}
