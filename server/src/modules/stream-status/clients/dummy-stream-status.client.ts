import { StreamStatus } from '../models/stream-status';
import { AbstractStreamStatusClient } from './abstract-stream-status.client';
import { StreamSourceType } from '../../../configuration';

/**
 * A dummy stream status client for testing.
 */
export class DummyStreamStatusClient extends AbstractStreamStatusClient {
    getStreamStatus(): StreamStatus {
        // We simulate some "real" data of sorts.
        return new StreamStatus(
            'dummy',
            Math.floor(Math.random() * (9000 - 8000 + 1) + 8000),
            true,
            Date.now(),
            StreamSourceType.dummy,
            Math.floor(Math.random() * (200 - 50 + 1) + 50),
        );
    }

    updateStreamStatus(): Promise<boolean> {
        return Promise.resolve(true);
    }
}
