import { Observable } from 'rxjs';
import { ChatMessage } from '../chat-message';

export abstract class AbstractChatClient {
    abstract connect(): void;
    abstract disconnect(): void;
    abstract messages$: Observable<ChatMessage>;
}
