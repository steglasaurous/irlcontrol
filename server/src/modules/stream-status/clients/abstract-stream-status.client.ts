import { StreamStatus } from '../models/stream-status';

export abstract class AbstractStreamStatusClient {
    abstract getStreamStatus(): StreamStatus;
    abstract updateStreamStatus(): Promise<boolean>;
}
