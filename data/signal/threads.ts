export type SignalLocale = 'en' | 'zh'

export type LocalizedSignalText = Record<SignalLocale, string>

export type SignalThreadConfidence = 'low' | 'medium' | 'high'
export type SignalThreadHorizon = 'now' | 'emerging' | 'watch'
export type SignalReadingStage = 'selected' | 'deep-read'

export type SignalDeepReadSource = {
  url: string
  title: LocalizedSignalText
  finding: LocalizedSignalText
}

export type SignalDeepRead = {
  title: LocalizedSignalText
  question: LocalizedSignalText
  synthesis: LocalizedSignalText
  caveat: LocalizedSignalText
  readAt: string
  sources: SignalDeepReadSource[]
}

export type SignalThreadRef = {
  url: string
  title?: LocalizedSignalText
  topicSlug?: string
  note: LocalizedSignalText
  readingStage?: SignalReadingStage
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
  deepRead?: SignalDeepRead
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
        title: {
          en: 'Cursor',
          zh: 'Cursor',
        },
        topicSlug: 'coding-agents',
        readingStage: 'selected',
        note: {
          en: 'Cursor is increasingly framed as an agent surface, not only an editor surface.',
          zh: 'Cursor 越来越像 agent 工作界面，而不只是编辑器界面。',
        },
      },
      {
        url: 'https://kiro.dev/',
        title: {
          en: 'Kiro: agentic engineering',
          zh: 'Kiro：agentic engineering',
        },
        topicSlug: 'coding-agents',
        readingStage: 'deep-read',
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
    deepRead: {
      title: {
        en: 'Deep read: the workflow is becoming the product',
        zh: '深读：工作流正在变成产品本身',
      },
      question: {
        en: 'What is actually changing when coding agents move beyond autocomplete?',
        zh: '当 coding agent 超越自动补全时，真正发生了什么变化？',
      },
      synthesis: {
        en: 'The durable shift is not that agents write more code. It is that they are absorbing the operating loop around code: gather context, turn intent into a plan, execute across a repo, run checks, and hand back evidence. Cursor’s usage data points to more agent-generated changes moving through commits and automation expanding into security review and SDK workflows. Kiro packages a similar loop as specs, parallel agents, tests, and cloud sessions. The common product surface is therefore an operating contract, not a smarter text box.',
        zh: '真正持久的变化不是 agent 写出了更多代码，而是它开始吸收代码周围的 operating loop：获取上下文、把意图变成计划、跨仓库执行、运行检查，再带着证据交付回来。Cursor 的使用数据指向更多 agent 生成的改动进入 commit 流程，自动化也开始扩展到安全审查和 SDK 工作流；Kiro 则把类似的循环包装成 spec、并行 agent、测试和云端 session。共同的产品表面因此不是一个更聪明的文本框，而是一份 operating contract。',
      },
      caveat: {
        en: 'This is directional evidence, not causal proof: Cursor reports aggregate product data, Kiro describes its own product, and Ornith’s benchmark numbers come from its own repository. The stronger claim is about converging product design, not universal adoption.',
        zh: '这是一组方向性证据，不是因果证明：Cursor 报告的是聚合产品数据，Kiro 描述的是自己的产品，Ornith 的 benchmark 数字也来自项目自身。更稳妥的判断是产品设计正在收敛，而不是所有开发者都已经普遍采用。',
      },
      readAt: '2026-07-12',
      sources: [
        {
          url: 'https://cursor.com/insights',
          title: {
            en: 'Cursor Developer Habits Report',
            zh: 'Cursor Developer Habits 报告',
          },
          finding: {
            en: 'Cursor reports that more than five times as many agent-generated changes are reaching commits without a separate manual diff-acceptance step, while automation and SDK runs are spreading across workflows.',
            zh: 'Cursor 报告称，不经过单独人工 diff 接受步骤就进入 commit 的 agent 改动数量增长超过五倍，同时自动化和 SDK run 正在扩展到更多工作流。',
          },
        },
        {
          url: 'https://kiro.dev/',
          title: {
            en: 'Kiro: agentic engineering',
            zh: 'Kiro：agentic engineering',
          },
          finding: {
            en: 'Kiro turns prompts into requirements, architecture, and sequenced tasks, then combines parallel agents, property-based tests, and IDE, CLI, and web sessions into one delivery loop.',
            zh: 'Kiro 把 prompt 转成需求、架构和有顺序的任务，再把并行 agent、property-based tests，以及 IDE、CLI 和 Web session 组合成一条交付循环。',
          },
        },
        {
          url: 'https://github.com/deepreinforce-ai/Ornith-1',
          title: {
            en: 'Ornith-1.0: self-improving agentic coding',
            zh: 'Ornith-1.0：自我改进的 agentic coding',
          },
          finding: {
            en: 'Ornith treats the scaffold that drives a coding rollout as part of what the model learns to improve, showing the frontier moving from code generation toward search strategy and execution structure.',
            zh: 'Ornith 把驱动 coding rollout 的 scaffold 也视为模型要学习改进的一部分，说明前沿正在从代码生成走向搜索策略和执行结构。',
          },
        },
      ],
    },
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
        title: {
          en: 'Local AI infrastructure discussion',
          zh: '关于本地 AI 基础设施的讨论',
        },
        topicSlug: 'personal-ai-systems',
        readingStage: 'selected',
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
        title: {
          en: 'Google AI Studio Android app builder',
          zh: 'Google AI Studio 的 Android 应用构建器',
        },
        topicSlug: 'consumer-ai-apps',
        readingStage: 'selected',
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
