import { requestHostPermission } from '~app/utils/permissions'
import { UserConfig } from '~services/user-config'
import { ChatError, ErrorCode } from '~utils/errors'
import { parseSSEResponse } from '~utils/sse'
import { AbstractBot, SendMessageParams } from '../abstract-bot'

interface ConversationContext {
  messages: Array<{ role: string; content: string }>
}

export class DeepSeekApiBot extends AbstractBot {
  private conversationContext?: ConversationContext

  constructor(private config: Pick<UserConfig, 'deepseekApiKey' | 'deepseekApiModel'>) {
    super()
  }

  async fetchCompletionApi(messages: Array<{ role: string; content: string }>, signal?: AbortSignal) {
    return fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${this.config.deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: this.getModelName(),
        messages,
        stream: true,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    })
  }

  async doSendMessage(params: SendMessageParams) {
    if (!(await requestHostPermission('https://*.deepseek.com/'))) {
      throw new ChatError('Missing deepseek.com permission', ErrorCode.UNKOWN_ERROR)
    }

    if (!this.conversationContext) {
      this.conversationContext = { messages: [] }
    }

    // Add user message to conversation context
    this.conversationContext.messages.push({
      role: 'user',
      content: params.prompt,
    })

    const resp = await this.fetchCompletionApi(this.conversationContext.messages, params.signal)

    let result = ''
    let assistantMessage = ''

    await parseSSEResponse(resp, (message) => {
      console.debug('deepseek sse message', message)
      if (message === '[DONE]') {
        return
      }
      try {
        const data = JSON.parse(message) as { choices?: Array<{ delta?: { content?: string } }> }
        if (data.choices && data.choices.length > 0 && data.choices[0].delta?.content) {
          const content = data.choices[0].delta.content
          result += content
          assistantMessage += content
          params.onEvent({ type: 'UPDATE_ANSWER', data: { text: result.trimStart() } })
        }
      } catch (err) {
        console.error('Error parsing DeepSeek API response:', err)
      }
    })

    // Add assistant message to conversation context
    if (assistantMessage) {
      this.conversationContext.messages.push({
        role: 'assistant',
        content: assistantMessage,
      })
    }

    params.onEvent({ type: 'DONE' })
  }

  private getModelName() {
    switch (this.config.deepseekApiModel) {
      case 'deepseek-reasoner':
        return 'deepseek-reasoner'
      default:
        return 'deepseek-chat'
    }
  }

  resetConversation() {
    this.conversationContext = undefined
  }

  get name() {
    return `DeepSeek (API/${this.config.deepseekApiModel || 'deepseek-chat'})`
  }
}