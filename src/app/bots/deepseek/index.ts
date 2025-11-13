import { DeepSeekMode, getUserConfig } from '~/services/user-config'
import * as agent from '~services/agent'
import { AsyncAbstractBot, MessageParams } from '../abstract-bot'
import { DeepSeekApiBot } from '../deepseek-api'
import { OpenRouterBot } from '../openrouter'
import { ChatError, ErrorCode } from '~utils/errors'

export class DeepSeekBot extends AsyncAbstractBot {
  async initializeBot() {
    const { deepseekMode, ...config } = await getUserConfig()
    
    if (deepseekMode === DeepSeekMode.OpenRouter) {
      if (!config.openrouterApiKey) {
        throw new ChatError('OpenRouter API key not set', ErrorCode.API_KEY_NOT_SET)
      }
      const model = `deepseek/${config.openrouterDeepSeekModel}`
      return new OpenRouterBot({ apiKey: config.openrouterApiKey, model })
    }
    
    // Default to API mode
    if (!config.deepseekApiKey) {
      throw new ChatError('DeepSeek API key not set', ErrorCode.API_KEY_NOT_SET)
    }
    
    return new DeepSeekApiBot({
      deepseekApiKey: config.deepseekApiKey,
      deepseekApiModel: config.deepseekApiModel,
    })
  }
}