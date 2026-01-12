import { BotId } from '~app/bots'
import { ChatError } from '~utils/errors'

export interface MessageModel {
  id: string
  author: BotId | 'user'
  text: string
  image?: Blob
  imageUrl?: string | null
  error?: ChatError
  errorCode?: string | null
  errorMessage?: string | null
  conversationId?: string
  createdAt?: string
  updatedAt?: string
}

export interface ConversationModel {
  id: string;
  botId: string;
  userId: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: MessageModel[];
}
