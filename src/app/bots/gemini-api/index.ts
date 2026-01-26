import { BOT_DEFAULT_CONFIG, OPENROUTER_API_KEY } from '~/app/config'
import { AsyncAbstractBot } from '../abstract-bot'
import { OpenRouterBot } from '../openrouter'

export class GeminiBot extends AsyncAbstractBot {
  async initializeBot() {
    const config = BOT_DEFAULT_CONFIG.gemini
    const defaultModel = config.models[0]
    
    return new OpenRouterBot({
      apiKey: OPENROUTER_API_KEY,
      model: defaultModel,
    })
  }
}
