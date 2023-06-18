import { Test, TestingModule } from '@nestjs/testing';
import { StreamStatusManagerService } from './stream-status-manager.service';

describe('StreamStatusManagerService', () => {
    let service: StreamStatusManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StreamStatusManagerService],
        }).compile();

        service = module.get<StreamStatusManagerService>(
            StreamStatusManagerService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
