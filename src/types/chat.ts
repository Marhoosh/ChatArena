import { BotId } from '~app/bots'
import { ChatError } from '~utils/errors'

export interface MessageModel {
  id: string
  author: BotId | 'user'
  text: string
  image?: Blob
  error?: ChatError
}

export interface ConversationModel {
  id: string;
  botId: string;
  userId: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: MessageModel[];
}
