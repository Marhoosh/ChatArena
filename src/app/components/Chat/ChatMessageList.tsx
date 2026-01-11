import { FC } from 'react'
import { cx } from '~/utils'
import ScrollToBottom from 'react-scroll-to-bottom'
import { BotId } from '~app/bots'
import { MessageModel } from '~types'
import ChatMessageCard from './ChatMessageCard'

interface Props {
  botId: BotId
  messages: MessageModel[]
  className?: string
}

const ChatMessageList: FC<Props> = (props) => {
  return (
    <ScrollToBottom className="overflow-auto h-full">
      <div className={cx('flex flex-col gap-3 h-full', props.className)}>
        {props.messages.map((message, index) => {
          return <ChatMessageCard key={message.id} message={message} className={index === 0 ? 'mt-5' : undefined} />
        })}
      </div>
    </ScrollToBottom>
  )
}

export default ChatMessageList
