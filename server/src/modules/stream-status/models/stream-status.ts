import { StreamSourceType } from '../../../configuration';

export class StreamStatus {
    constructor(
        public streamName: string,
        public bitrate: number,
        public connected: boolean,
        public timestamp: number,
        public streamSourceType: StreamSourceType,
        public rtt?: number,
    ) {}
}
