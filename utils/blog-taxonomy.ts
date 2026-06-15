export const BLOG_CATEGORIES = [
  {
    id: 'ai-native-systems',
    label: 'AI Native Systems',
    zhLabel: 'AI 原生系统',
  },
  {
    id: 'product-execution',
    label: 'Product Execution',
    zhLabel: '产品与执行',
  },
  {
    id: 'business-strategy',
    label: 'Business Strategy',
    zhLabel: '商业与战略',
  },
  {
    id: 'personal-operating-system',
    label: 'Personal Operating System',
    zhLabel: '个人操作系统',
  },
  {
    id: 'creation-media',
    label: 'Creation & Media',
    zhLabel: '创作与媒体',
  },
] as const

export type BlogCategoryId = (typeof BLOG_CATEGORIES)[number]['id']

type BlogCategoryInput = {
  category?: unknown
  categories?: unknown
  tags?: unknown
  topics?: unknown
}

const CATEGORY_IDS = new Set<string>(BLOG_CATEGORIES.map((category) => category.id))

const CATEGORY_ALIASES: Record<string, BlogCategoryId> = {
  ai: 'ai-native-systems',
  'ai-native': 'ai-native-systems',
  'agentic-ai': 'ai-native-systems',
  agents: 'ai-native-systems',
  anthropic: 'ai-native-systems',
  chatgpt: 'ai-native-systems',
  mcp: 'ai-native-systems',
  workflow: 'ai-native-systems',

  engineering: 'product-execution',
  execution: 'product-execution',
  product: 'product-execution',
  productivity: 'product-execution',
  'building-in-public': 'product-execution',
  openclaw: 'product-execution',

  entrepreneurship: 'business-strategy',
  finance: 'business-strategy',
  'financial-analysis': 'business-strategy',
  'financial-services': 'business-strategy',
  judgment: 'business-strategy',
  strategy: 'business-strategy',
  'wealth-management': 'business-strategy',

  'career-strategy': 'personal-operating-system',
  'continuous-learning': 'personal-operating-system',
  'deep-work': 'personal-operating-system',
  life: 'personal-operating-system',
  'personal-systems': 'personal-operating-system',
  'system-thinking': 'personal-operating-system',

  'content-creation': 'creation-media',
  creativity: 'creation-media',
  media: 'creation-media',
  opinion: 'creation-media',
  writing: 'creation-media',
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeBlogCategoryId(value: unknown): BlogCategoryId | null {
  if (typeof value !== 'string') return null

  const id = slugify(value)
  if (CATEGORY_IDS.has(id)) return id as BlogCategoryId

  return CATEGORY_ALIASES[id] || null
}

function explicitCategoryValues(input: BlogCategoryInput): unknown[] {
  if (Array.isArray(input.categories) && input.categories.length > 0) return input.categories
  if (typeof input.category === 'string') return [input.category]
  return []
}

export function getBlogCategories(input: BlogCategoryInput): BlogCategoryId[] {
  const explicitValues = explicitCategoryValues(input)
  const seen = new Set<BlogCategoryId>()

  explicitValues.forEach((value) => {
    const category = normalizeBlogCategoryId(value)
    if (category) seen.add(category)
  })

  const explicitCategories = [...seen]
  if (explicitCategories.length > 0) return explicitCategories

  const legacyValues = [
    ...(Array.isArray(input.topics) ? input.topics : []),
    ...(Array.isArray(input.tags) ? input.tags : []),
  ]
  for (const value of legacyValues) {
    const category = normalizeBlogCategoryId(value)
    if (category) return [category]
  }

  return []
}

export function getBlogCategoryLabel(categoryId: string, locale = 'en') {
  const category = BLOG_CATEGORIES.find((item) => item.id === categoryId)
  if (!category) return categoryId

  return locale === 'zh' ? category.zhLabel : category.label
}

export function createCategoryCounts(posts: BlogCategoryInput[]) {
  const counts = new Map<BlogCategoryId, number>()

  posts.forEach((post) => {
    getBlogCategories(post).forEach((category) => {
      counts.set(category, (counts.get(category) || 0) + 1)
    })
  })

  return new Map(BLOG_CATEGORIES.flatMap((category) => {
    const count = counts.get(category.id)
    return count ? [[category.id, count] as const] : []
  }))
}
