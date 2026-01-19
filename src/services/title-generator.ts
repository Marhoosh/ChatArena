import { DeepSeekBot } from '~/app/bots/deepseek'

interface GenerateTitleParams {
  userMessage: string
}

export async function generateConversationTitle({ userMessage }: GenerateTitleParams): Promise<string> {
  console.log('开始升成标题userMessage', userMessage)
  const prompt = `请将以下用户提问总结为一个简洁的对话标题（不超过20个字）：\n\n${userMessage}`

  const bot = new DeepSeekBot()
  let result = ''

  try {
    for await (const chunk of await bot.sendMessage({ prompt })) {
      result += chunk.text
    }
    return result.trim()
  } catch (error) {
    console.error('生成标题失败:', error)
    return getFallbackTitle(userMessage)
  }
}

export function getFallbackTitle(userMessage: string): string {
  const trimmed = userMessage.trim()
  return trimmed.length > 10 ? trimmed.substring(0, 10) + '...' : trimmed
}
