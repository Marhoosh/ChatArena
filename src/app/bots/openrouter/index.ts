import { requestHostPermission } from '~app/utils/permissions'
import { ChatError, ErrorCode } from '~utils/errors'
import { parseSSEResponse } from '~utils/sse'
import { AbstractBot, SendMessageParams } from '../abstract-bot'
import { supabase } from '~db/client'
import { SUPABASE_URL } from "~app/config";

interface ChatMessage {
  role: 'system' | 'assistant' | 'user'
  content: string
}

interface ConversationContext {
  messages: ChatMessage[]
}

const CONTEXT_SIZE = 9

export class OpenRouterBot extends AbstractBot {
  private conversationContext?: ConversationContext

  constructor(private config: { apiKey: string; model: string }) {
    super()
  }

  buildMessages(prompt: string): ChatMessage[] {
    return [...this.conversationContext!.messages.slice(-(CONTEXT_SIZE + 1)), { role: 'user', content: prompt }]
  }

  async doSendMessage(params: SendMessageParams) {
    if (!(await requestHostPermission('https://*.openrouter.ai/'))) {
      throw new ChatError('Missing openrouter.ai permission', ErrorCode.MISSING_HOST_PERMISSION)
    }

    if (!this.conversationContext) {
      this.conversationContext = { messages: [] }
    }

    const resp = await this.fetchCompletionApi(this.buildMessages(params.prompt), params.signal)

    this.conversationContext.messages.push({
      role: 'user',
      content: params.rawUserInput || params.prompt,
    })

    let done = false
    const result: ChatMessage = { role: 'assistant', content: '' }

    const finish = () => {
      done = true
      params.onEvent({ type: 'DONE' })
      const messages = this.conversationContext!.messages
      messages.push(result)
    }

    await parseSSEResponse(resp, (message) => {
      if (message === '[DONE]') {
        finish()
        return
      }
      let data
      try {
        data = JSON.parse(message)
      } catch (err) {
        console.error(err)
        return
      }
      if (data?.choices?.length) {
        const delta = data.choices[0].delta
        if (delta?.content) {
          result.content += delta.content
          params.onEvent({
            type: 'UPDATE_ANSWER',
            data: { text: result.content },
          })
        }
      }
    })

    if (!done) {
      finish()
    }
  }

  async fetchCompletionApi(messages: ChatMessage[], signal?: AbortSignal): Promise<Response> {



    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new ChatError('Not authenticated', ErrorCode.UNAUTHORIZED)
    }

    // TODO：此处edge function的url需要从config中读取
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/ai-proxy`,
      {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages,
          model: this.config.model,
          stream: true,
        }),
      }
    )

    // TODO：此处的错误的捕获和处理？这里直接这样的话，Sentry捕获不到错误的详情
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      if (response.status === 429) {
        throw new ChatError('Daily limit exceeded', ErrorCode.QUOTA_EXCEEDED)
      }
      if (response.status === 401) {
        throw new ChatError('Unauthorized', ErrorCode.UNAUTHORIZED)
      }
      throw new ChatError(errorData.error || 'OpenRouter API error', ErrorCode.API_ERROR)
    }

    return response
  }

  resetConversation() {
    this.conversationContext = undefined
  }

  get name() {
    return `OpenRouter/${this.config.model}`
  }
}
