import { Test, TestingModule } from '@nestjs/testing';
import { ChatManagerService } from './chat-manager.service';

describe('ChatManagerService', () => {
    let service: ChatManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatManagerService],
        }).compile();

        service = module.get<ChatManagerService>(ChatManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
