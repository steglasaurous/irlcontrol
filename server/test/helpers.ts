// Helper functions for unit tests.  Put utilities here that will be available globally
// in specs.
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

export const getGenericNestMock = (token) => {
    const moduleMocker = new ModuleMocker(global);
    const mockMetadata = moduleMocker.getMetadata(
        token,
    ) as MockFunctionMetadata<any, any>;
    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
    return new Mock();
};

// So technically this is all that's required to make this function globally available in tests without
// having to import it specifically, however typescript in IDEs will complain it's not defined.
// For now, we do both - export the function AND define it in globals.  If there's a
// better way to deal with this, please do modify.
global.getGenericNestMock = getGenericNestMock;

export const createNestApp = async () => {
    // const chatClient = new TestChatClient();
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
        // .overrideProvider('ChatClients')
        // .useValue([chatClient])
        .compile();

    const app = moduleFixture.createNestApplication();
    app.enableCors({
        credentials: true,
        // origin: '*',
        origin: 'http://localhost:4200',
    });
    return app;
};
