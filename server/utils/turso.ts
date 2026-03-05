import { createClient } from '@libsql/client'

let _client: ReturnType<typeof createClient> | null = null

export function useTurso() {
  if (!_client) {
    const config = useRuntimeConfig()
    _client = createClient({
      url: config.tursoUrl || '',
      authToken: config.tursoAuthToken || '',
    })
  }
  return _client
}
