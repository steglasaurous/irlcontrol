import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppLauncherController {
    constructor(private configService: ConfigService) {}
    @Get('/')
    launchFrontend() {
        // Load the index.html that exists, sub in configuration
        const appConfig = {
            production:
                this.configService.get<string>('NODE_ENV') === 'production',
            // wsUrl: '/', // Try making the assumption it's origin unless specified otherwise
            videoFeedbackSource: this.configService.get<string>(
                'VIDEO_FEEDBACK_SOURCE_URL',
            ),
            // FIXME: Change this to ask the user for the belabox password if not in local storage
            belaboxPassword: this.configService.get<string>('BELABOX_PASSWORD'),
            belaboxWsUrl: 'wss://belabox.local',
            moblinAssistantWsUrl: '',
            // rtirlPullKey: '',
            // twitchUsername: 'steglasaurous'
        };
    }
}
