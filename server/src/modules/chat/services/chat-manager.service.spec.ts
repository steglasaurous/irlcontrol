import { Test, TestingModule } from '@nestjs/testing';
import { ChatManagerService } from './chat-manager.service';
import { getGenericNestMock } from '../../../../test/helpers';

describe('ChatManagerService', () => {
  let service: ChatManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatManagerService,
        {
          provide: 'ChatClients',
          useValue: [],
        },
      ],
    })
      .useMocker((token) => {
        return getGenericNestMock(token);
      })
      .compile();

    service = module.get<ChatManagerService>(ChatManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
