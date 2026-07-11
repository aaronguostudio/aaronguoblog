export type SignalLocale = 'en' | 'zh'

export type LocalizedSignalText = Record<SignalLocale, string>

export type SignalThreadConfidence = 'low' | 'medium' | 'high'
export type SignalThreadHorizon = 'now' | 'emerging' | 'watch'

export type SignalThreadRef = {
  url: string
  topicSlug?: string
  note: LocalizedSignalText
}

export type SignalResearchThread = {
  slug: string
  primaryTopicSlug: string
  horizon: SignalThreadHorizon
  title: LocalizedSignalText
  thesis: LocalizedSignalText
  builderImplication: LocalizedSignalText
  confidence: SignalThreadConfidence
  lastUpdated: string
  signalRefs: SignalThreadRef[]
  openQuestion: LocalizedSignalText
  productHypothesis: LocalizedSignalText
}

export const SIGNAL_RESEARCH_THREADS: SignalResearchThread[] = [
  {
    slug: 'coding-agents-own-workflows',
    primaryTopicSlug: 'coding-agents',
    horizon: 'now',
    title: {
      en: 'Coding agents are becoming workflow owners',
      zh: 'Coding agents 正在变成工作流负责人',
    },
    thesis: {
      en: 'The important shift is not better autocomplete. It is agents taking responsibility for scoped tasks, repo context, review loops, and handoff.',
      zh: '关键变化不是更好的自动补全，而是 agent 开始承担有边界的任务、仓库上下文、review 循环和交付交接。',
    },
    builderImplication: {
      en: 'Builders need operating contracts for agents: what they can do, when they stop, and what evidence proves the work is real.',
      zh: '构建者需要为 agent 设计 operating contract：它能做什么、什么时候停、什么证据能证明工作是真的。',
    },
    confidence: 'high',
    lastUpdated: '2026-06-21',
    signalRefs: [
      {
        url: 'https://cursor.com/',
        topicSlug: 'coding-agents',
        note: {
          en: 'Cursor is increasingly framed as an agent surface, not only an editor surface.',
          zh: 'Cursor 越来越像 agent 工作界面，而不只是编辑器界面。',
        },
      },
      {
        url: 'https://kiro.dev/',
        topicSlug: 'coding-agents',
        note: {
          en: 'Kiro explicitly frames the category as agentic engineering across IDE, CLI, and web.',
          zh: 'Kiro 明确把这个类别定义为跨 IDE、CLI 和 Web 的 agentic engineering。',
        },
      },
      {
        url: 'https://www.paralect.com/stack/top-agentic-ides',
        topicSlug: 'coding-agents',
        note: {
          en: 'Comparison content around agentic IDEs shows the category becoming legible to buyers.',
          zh: '围绕 agentic IDE 的对比内容说明这个类别正在被买家理解。',
        },
      },
    ],
    openQuestion: {
      en: 'Where does the handoff boundary belong between human judgment and autonomous coding work?',
      zh: '人的判断和自主编码工作之间，交接边界应该放在哪里？',
    },
    productHypothesis: {
      en: 'Agent Operating Contract: templates and review workflows for teams delegating real engineering work to agents.',
      zh: 'Agent Operating Contract：给团队委托真实工程任务给 agent 时使用的模板和 review 工作流。',
    },
  },
  {
    slug: 'solo-builders-small-team-output',
    primaryTopicSlug: 'personal-ai-systems',
    horizon: 'emerging',
    title: {
      en: 'Solo builders are approaching small-team output',
      zh: '个人构建者正在接近小团队产出',
    },
    thesis: {
      en: 'AI-native builders can now combine product judgment, code generation, research, and distribution into one tighter operating loop.',
      zh: 'AI 原生构建者现在可以把产品判断、代码生成、研究和分发压缩进一个更紧密的操作循环。',
    },
    builderImplication: {
      en: 'The new leverage is not doing every task faster; it is designing a system where many small tasks keep moving while the human protects taste and direction.',
      zh: '新的杠杆不是把每个任务都做快，而是设计一个系统，让很多小任务持续推进，同时由人守住品味和方向。',
    },
    confidence: 'medium',
    lastUpdated: '2026-06-21',
    signalRefs: [
      {
        url: 'https://news.ycombinator.com/item?id=48524387',
        topicSlug: 'personal-ai-systems',
        note: {
          en: 'Low-cost local AI infrastructure keeps lowering the experimentation floor.',
          zh: '低成本本地 AI 基础设施继续降低个人实验门槛。',
        },
      },
      {
        url: 'https://github.com/google-ai-edge/gallery',
        topicSlug: 'mobile-ai',
        note: {
          en: 'On-device model demos make local experimentation more accessible.',
          zh: '端侧模型 demo 让本地实验更容易被个人构建者使用。',
        },
      },
      {
        url: 'https://github.com/stevelaskaridis/awesome-mobile-llm',
        topicSlug: 'mobile-ai',
        note: {
          en: 'Mobile LLM resources point toward smaller, more personal product surfaces.',
          zh: 'Mobile LLM 资源指向更小、更个人化的产品界面。',
        },
      },
    ],
    openQuestion: {
      en: 'Which parts of a product studio can be systematized without making the work generic?',
      zh: '产品工作室的哪些部分可以系统化，同时不让作品变得平庸？',
    },
    productHypothesis: {
      en: 'Solo Product Studio OS: a repeatable workflow for turning signals into experiments, essays, and small products.',
      zh: 'Solo Product Studio OS：把信号转成实验、文章和小产品的可复用工作流。',
    },
  },
  {
    slug: 'internal-workflows-become-products',
    primaryTopicSlug: 'consumer-ai-apps',
    horizon: 'watch',
    title: {
      en: 'Internal workflows are becoming product candidates',
      zh: '内部工作流正在变成产品候选',
    },
    thesis: {
      en: 'The best AI product ideas may come from workflows people already run manually: reports, research loops, reviews, audits, and handoffs.',
      zh: '最好的 AI 产品想法可能来自人们已经手动执行的工作流：报告、研究循环、review、audit 和交接。',
    },
    builderImplication: {
      en: 'Consulting work should be treated as discovery for repeatable tools, not only as one-off delivery.',
      zh: '咨询和项目工作应该被当成可复用工具的发现过程，而不只是一次性交付。',
    },
    confidence: 'medium',
    lastUpdated: '2026-06-21',
    signalRefs: [
      {
        url: 'https://techcrunch.com/2026/05/19/googles-ai-studio-now-lets-anyone-build-android-apps-in-minutes/',
        topicSlug: 'consumer-ai-apps',
        note: {
          en: 'App-building tools keep compressing the distance between workflow and product surface.',
          zh: '应用构建工具持续压缩工作流和产品界面之间的距离。',
        },
      },
      {
        url: 'https://catdoes.com/blog/ai-mobile-app-builder',
        topicSlug: 'consumer-ai-apps',
        note: {
          en: 'AI app-builder comparisons show demand for packaging expertise into buildable systems.',
          zh: 'AI app builder 对比内容说明市场需要把专业知识包装成可构建系统。',
        },
      },
      {
        url: 'https://bubble.io/blog/ai-tools-for-app-development/',
        topicSlug: 'consumer-ai-apps',
        note: {
          en: 'No-code and AI-assisted app tooling keeps turning internal process knowledge into software candidates.',
          zh: 'No-code 和 AI 辅助应用工具持续把内部流程知识变成软件候选。',
        },
      },
    ],
    openQuestion: {
      en: 'Which client or personal workflows are valuable enough to become repeatable products?',
      zh: '哪些客户或个人工作流足够有价值，值得变成可复用产品？',
    },
    productHypothesis: {
      en: 'AI Workflow Audit: a lightweight productized service that finds repeatable AI product opportunities inside a team.',
      zh: 'AI Workflow Audit：一个轻量产品化服务，用来在团队内部发现可复用的 AI 产品机会。',
    },
  },
]
