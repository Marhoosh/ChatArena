import useSWR from 'swr/immutable'
import { BotId } from '~app/bots'
import { CHATBOTS } from '~app/consts'
import { ENABLED_BOTS } from '~app/config'

export function useEnabledBots() {
  const query = useSWR('enabled-bots', async () => {
    return ENABLED_BOTS
      .filter((botId) => CHATBOTS[botId as BotId])
      .map((botId) => {
        const bid = botId as BotId
        return { botId: bid, bot: CHATBOTS[bid] }
      })
  })
  return query.data || []
}
