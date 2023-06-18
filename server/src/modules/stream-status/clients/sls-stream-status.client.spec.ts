import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { SlsStreamStatusClient } from './sls-stream-status.client';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

const moduleMocker = new ModuleMocker(global);

describe('SlsStreamStatusClient', () => {
    let service: SlsStreamStatusClient;
    let httpService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [HttpModule],
            providers: [SlsStreamStatusClient],
        })
            .useMocker((token) => {
                const mockMetadata = moduleMocker.getMetadata(
                    token,
                ) as MockFunctionMetadata<any, any>;
                const Mock = moduleMocker.generateFromMetadata(mockMetadata);
                return new Mock();
            })
            .compile();
        httpService = module.get<HttpService>(HttpService);
        service = new SlsStreamStatusClient(
            httpService,
            'http://10.0.0.234:8181/stats',
            'Main',
        );
    });

    it('should retrieve the latest stream status', async () => {
        jest.spyOn(httpService, 'get').mockImplementation((url: string) => {
            return of({
                data: {
                    publishers: {
                        'publish/live/feed1': {
                            bitrate: 7567,
                            bytesRcvDrop: 4080,
                            bytesRcvLoss: 632400,
                            mbpsBandwidth: 960.0,
                            mbpsRecvRate: 8.491403598024007,
                            msRcvBuf: 959,
                            pktRcvDrop: 3,
                            pktRcvLoss: 465,
                            rtt: 21.603,
                            uptime: 33,
                        },
                    },
                    status: 'ok',
                },
                headers: {},
                config: { url: 'http://whatever' },
                status: 200,
                statusText: 'OK',
            });
        });

        await service.updateStreamStatus();

        const status = service.getStreamStatus();
        expect(status.bitrate).toBe(7567);
        expect(status.connected).toBeTruthy();
        expect(status.rtt).toBe(21.603);
        expect(status.streamName).toEqual('Main');
        expect(status.timestamp).toBeDefined();
    });
});
