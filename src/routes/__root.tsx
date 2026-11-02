import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { MotionProvider } from '@/components/providers/motion-provider'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { themeScript } from '@/components/theme/theme-script'
import { Toaster } from '@/components/ui/toaster'
import { sessionQuery } from '@/lib/queries'
import appCss from '@/styles/app.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(sessionQuery())
    return { user }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'PromptLab — Compare prompting strategies side by side' },
      {
        name: 'description',
        content:
          'Run one task through zero-shot, few-shot, chain-of-thought and role-based prompts, watch them stream side by side, and measure which works best.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  shellComponent: RootDocument,
  component: () => <Outlet />,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <MotionProvider>
            {children}
            <Toaster />
          </MotionProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
