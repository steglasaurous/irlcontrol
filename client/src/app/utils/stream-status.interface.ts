export interface StreamStatus {
  streamName: string;
  bitrate: number;
  connected: boolean;
  timestamp: number;
  streamSourceType: string;
  rtt?: number;
}
