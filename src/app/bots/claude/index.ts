import { BOT_DEFAULT_CONFIG, OPENROUTER_API_KEY } from '~/app/config'
import * as agent from '~services/agent'
import { AsyncAbstractBot, MessageParams } from '../abstract-bot'
import { OpenRouterBot } from '../openrouter'

export class ClaudeBot extends AsyncAbstractBot {
  async initializeBot() {
    const config = BOT_DEFAULT_CONFIG.claude
    const defaultModel = config.models[0]
    
    return new OpenRouterBot({
      apiKey: OPENROUTER_API_KEY,
      model: defaultModel,
    })
  }
}
