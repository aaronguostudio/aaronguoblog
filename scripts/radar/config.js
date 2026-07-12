const ALLOWED_CADENCES = new Set(['daily', 'weekly', 'manual'])
const ALLOWED_MODES = new Set(['quick', 'deep'])
const ALLOWED_VISIBILITY = new Set(['public', 'private'])
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const TOPICS = [
  {
    slug: 'mobile-ai',
    name: 'Mobile AI',
    query: 'mobile AI, on-device AI, iOS Android AI assistants',
    category: 'ai',
    cadence: 'daily',
    mode: 'quick',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 5,
    sourceHints: {
      subreddits: ['LocalLLaMA', 'ArtificialInteligence', 'singularity'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: ['mobileai', 'aiphone'],
      instagramCreators: [],
    },
  },
  {
    slug: 'consumer-ai-apps',
    name: 'Consumer AI Apps',
    query: 'consumer AI apps, AI productivity apps, AI app launches',
    category: 'ai',
    cadence: 'daily',
    mode: 'quick',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 5,
    sourceHints: {
      subreddits: ['ArtificialInteligence', 'ChatGPT', 'productivity'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: ['aitools', 'aiapps'],
      instagramCreators: [],
    },
  },
  {
    slug: 'ai-wearables',
    name: 'AI Wearables',
    query: 'AI wearables, AI pins, voice-first AI devices, smart glasses AI',
    category: 'ai',
    cadence: 'weekly',
    mode: 'deep',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 5,
    sourceHints: {
      subreddits: ['wearables', 'gadgets', 'ArtificialInteligence'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: ['aiwearable', 'smartglasses'],
      instagramCreators: [],
    },
  },
  {
    slug: 'coding-agents',
    name: 'Coding Agents',
    query: 'coding agents, agentic IDEs, AI developer tools, autonomous coding',
    category: 'coding',
    cadence: 'daily',
    mode: 'quick',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 6,
    threadSlug: 'coding-agents-own-workflows',
    deepRead: {
      enabled: true,
      minSources: 3,
      minSightingCount: 2,
      minRepeatedSources: 2,
      itemLimit: 10,
    },
    sourceHints: {
      subreddits: ['ClaudeAI', 'Cursor', 'LocalLLaMA', 'programming'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: [],
      instagramCreators: [],
    },
  },
  {
    slug: 'personal-ai-systems',
    name: 'Personal AI Systems',
    query: 'personal AI agents, AI memory, personal knowledge systems, intention-driven AI',
    category: 'ai',
    cadence: 'weekly',
    mode: 'deep',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 5,
    sourceHints: {
      subreddits: ['PKMS', 'ObsidianMD', 'ArtificialInteligence'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: ['personalai'],
      instagramCreators: [],
    },
  },
]

export function getRadarTopics() {
  return TOPICS.map((topic) => ({
    ...topic,
    sourceHints: {
      subreddits: [...topic.sourceHints.subreddits],
      githubRepos: [...topic.sourceHints.githubRepos],
      xHandles: [...topic.sourceHints.xHandles],
      tiktokHashtags: [...topic.sourceHints.tiktokHashtags],
      instagramCreators: [...topic.sourceHints.instagramCreators],
    },
  }))
}

export function getRadarTopicBySlug(slug) {
  return getRadarTopics().find((topic) => topic.slug === slug)
}

export function getDueRadarTopics({ cadence } = {}) {
  return getRadarTopics().filter((topic) => {
    if (topic.visibility !== 'public') return false
    if (!cadence) return topic.cadence !== 'manual'
    return topic.cadence === cadence
  })
}

export function validateRadarTopic(topic) {
  const errors = []

  if (!topic.slug || !SLUG_PATTERN.test(topic.slug)) {
    errors.push('slug must be a non-empty kebab-case string')
  }
  if (!topic.name || typeof topic.name !== 'string') {
    errors.push('name must be a non-empty string')
  }
  if (!topic.query || typeof topic.query !== 'string') {
    errors.push('query must be a non-empty string')
  }
  if (!topic.category || typeof topic.category !== 'string') {
    errors.push('category must be a non-empty string')
  }
  if (!ALLOWED_CADENCES.has(topic.cadence)) {
    errors.push('cadence must be daily, weekly, or manual')
  }
  if (!ALLOWED_MODES.has(topic.mode)) {
    errors.push('mode must be quick or deep')
  }
  if (!Number.isInteger(topic.lookbackDays) || topic.lookbackDays < 1 || topic.lookbackDays > 120) {
    errors.push('lookbackDays must be an integer between 1 and 120')
  }
  if (!ALLOWED_VISIBILITY.has(topic.visibility)) {
    errors.push('visibility must be public or private')
  }
  if (!Number.isInteger(topic.minRelevance) || topic.minRelevance < 1 || topic.minRelevance > 10) {
    errors.push('minRelevance must be an integer between 1 and 10')
  }

  return { ok: errors.length === 0, errors }
}
