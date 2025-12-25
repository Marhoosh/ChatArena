import { createBrowserHistory, createRootRoute, createRoute, createRouter, useParams, Outlet } from '@tanstack/react-router'
import { BotId } from './bots'
import Layout from './components/Layout'
import MultiBotChatPanel from './pages/MultiBotChatPanel'
import PremiumPage from './pages/PremiumPage'
import SettingPage from './pages/SettingPage'
import SingleBotChatPanel from './pages/SingleBotChatPanel'
import TestPage from './pages/TestPage'
import Provider from './components/session/Provider'

const rootRoute = createRootRoute()

const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'session',
  component: Provider,
})


const layoutRoute = createRoute({
  getParentRoute: () => sessionRoute,
  component: Layout,
  id: 'layout',
})

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: MultiBotChatPanel,
})

function ChatRoute() {
  const { botId } = useParams({ from: chatRoute.id })
  return <SingleBotChatPanel botId={botId as BotId} />
}

const chatRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'chat/$botId',
  component: ChatRoute,
})

const settingRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'setting',
  component: SettingPage,
})

const testRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'test',
  component: TestPage,
})

export const premiumRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'premium',
  component: PremiumPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      source: search.source as string | undefined,
    }
  },
})

const routeTree = rootRoute.addChildren([sessionRoute.addChildren([layoutRoute.addChildren([indexRoute, chatRoute, settingRoute, testRoute, premiumRoute])])])

const browserHistory = createBrowserHistory()
const router = createRouter({ routeTree, history: browserHistory })

export { router }
