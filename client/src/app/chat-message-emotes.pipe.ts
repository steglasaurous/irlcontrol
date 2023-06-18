import { Pipe, PipeTransform } from '@angular/core';
import {ChatMessage} from "./utils/chat-message.interface";

@Pipe({
  name: 'chatMessageEmotes'
})
export class ChatMessageEmotesPipe implements PipeTransform {

  transform(value: ChatMessage, ...args: unknown[]): string {
    let outputMessage: string = value.message;

    if (value.emotes.size == undefined) {
      return outputMessage;
    }
    let additionalOffset = 0;

    // Because this fails unless done in order of offsets, we need to sort the map first.
    // We flip it around to offsets as keys, and emotes as values.
    let tempMap: Map<string, string> = new Map<string, string>();
    value.emotes.forEach((emoteOffsets: string[], emote) => {
      emoteOffsets.forEach((offset) => {
        tempMap.set(offset, emote);
      });
    });

    // Sort the map
    let sortedEmotes = Array.from(tempMap).sort((a, b) => {
      let offsetAParsed = a[0].split('-');
      let offsetBParsed = b[0].split('-');
      if (parseInt(offsetAParsed[0]) < parseInt(offsetBParsed[0])) {
        return -1;
      } else {
        return 1;
      }
    });

    for (let emoteData of sortedEmotes) {
      const emoteImageUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteData[1]}/default/light/1.0`;
      let emoteOffsetsParsed = emoteData[0].split('-');
      let currentMessageLength = outputMessage.length;

      // Get beginning of string up to part that's to be replaced, then replace, then get the remaining string.
      outputMessage =
        outputMessage.substring(0,(parseInt(emoteOffsetsParsed[0]) + additionalOffset))
        + `<img alt="${emoteData[1]}" src="${emoteImageUrl}">`
        + outputMessage.substring((parseInt(emoteOffsetsParsed[1]) + 1 + additionalOffset));

      additionalOffset += (outputMessage.length - currentMessageLength);
    }

    return outputMessage;
  }
}
