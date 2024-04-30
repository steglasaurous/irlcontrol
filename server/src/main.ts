import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // Production path since nest isn't running from dist/
    let staticAssetsPath: string = join(__dirname, 'public');

    if (fs.existsSync(join(__dirname, '..', 'public'))) {
        // Dev path, since it's running from dist/
        staticAssetsPath = join(__dirname, '..', 'public');
    }
    app.useStaticAssets(join(staticAssetsPath));

    await app.listen(3000);
}
bootstrap();
