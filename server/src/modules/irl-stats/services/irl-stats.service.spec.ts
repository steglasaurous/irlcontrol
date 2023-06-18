import { Test, TestingModule } from '@nestjs/testing';
import { IrlStatsService } from './irl-stats.service';

describe('IrlStatsService', () => {
    let service: IrlStatsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [IrlStatsService],
        }).compile();

        service = module.get<IrlStatsService>(IrlStatsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
