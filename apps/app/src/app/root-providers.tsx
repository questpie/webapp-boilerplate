'use client'
import { ThemeProvider } from '@questpie/ui/components/theme-provider'
import { AuthProvider, type AuthData } from '@questpie/app/app/(auth)/use-auth'
import { RootStoreProvider } from '@questpie/app/app/_atoms/root-store'
import { getQueryClient } from '@questpie/app/utils/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

export function RootProviders(props: { children: React.ReactNode; authData: AuthData }) {
  return (
    <RootStoreProvider>
      <AuthProvider authData={props.authData}>
        <ThemeProvider>
          <QueryClientProvider client={getQueryClient()}>
            <ReactQueryStreamedHydration>{props.children}</ReactQueryStreamedHydration>
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </RootStoreProvider>
  )
}
