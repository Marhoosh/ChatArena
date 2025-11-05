import { getUserConfig } from '~/services/user-config'
import { AsyncAbstractBot, MessageParams } from '../abstract-bot'
import { DeepSeekApiBot } from '../deepseek-api'
import { ChatError, ErrorCode } from '~utils/errors'

export class DeepSeekBot extends AsyncAbstractBot {
  async initializeBot() {
    const config = await getUserConfig()
    if (!config.deepseekApiKey) {
      throw new ChatError('DeepSeek API key not set', ErrorCode.API_KEY_NOT_SET)
    }
    
    return new DeepSeekApiBot({
      deepseekApiKey: config.deepseekApiKey,
      deepseekApiModel: config.deepseekApiModel,
    })
  }
}