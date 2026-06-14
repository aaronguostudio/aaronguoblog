import { createClient } from '@libsql/client'

const MISSING_TURSO_CONFIG_MESSAGE = 'TURSO_URL and TURSO_AUTH_TOKEN are required'

export class MissingTursoConfigError extends Error {
  constructor() {
    super(MISSING_TURSO_CONFIG_MESSAGE)
    this.name = 'MissingTursoConfigError'
  }
}

let _client: ReturnType<typeof createClient> | null = null

export function isMissingTursoConfigError(error: unknown) {
  return error instanceof Error && error.message === MISSING_TURSO_CONFIG_MESSAGE
}

export function useTurso() {
  if (!_client) {
    const config = useRuntimeConfig()
    if (!config.tursoUrl || !config.tursoAuthToken) {
      throw new MissingTursoConfigError()
    }

    _client = createClient({
      url: config.tursoUrl,
      authToken: config.tursoAuthToken,
    })
  }
  return _client
}
