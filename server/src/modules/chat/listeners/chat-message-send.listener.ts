import {ChatMessageSendEvent} from "../events/chat-message-send.event";
import {OnEvent} from "@nestjs/event-emitter";
import {Inject} from "@nestjs/common";
import {ChatManagerService} from "../services/chat-manager.service";

export class ChatMessageSendListener {
    constructor(private chatManagerService: ChatManagerService) {
    }
    @OnEvent(ChatMessageSendEvent.name)
    handle(chatMessageSendEvent: ChatMessageSendEvent) {
        // CONTINUE HERE: Finish implementing chat sending here and in the chat manager service
    }
}