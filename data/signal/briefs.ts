import type { LocalizedSignalText, SignalLocale } from './threads'

export type SignalBriefSection = {
  heading: LocalizedSignalText
  body: LocalizedSignalText[]
  bullets?: LocalizedSignalText[]
}

export type SignalBrief = {
  slug: string
  threadSlug: string
  date: string
  readTime: LocalizedSignalText
  title: LocalizedSignalText
  description: LocalizedSignalText
  sections: SignalBriefSection[]
}

export const SIGNAL_BRIEFS: SignalBrief[] = [
  {
    slug: 'coding-agents-workflow-owners-2026-06-21',
    threadSlug: 'coding-agents-own-workflows',
    date: '2026-06-21',
    readTime: {
      en: '4 min read',
      zh: '约 4 分钟',
    },
    title: {
      en: 'Signal Brief: Coding Agents Are Becoming Workflow Owners',
      zh: 'Signal Brief：Coding agents 正在变成工作流负责人',
    },
    description: {
      en: "This first Signal Brief turns this week's coding-agent signals into a working thesis: the category is moving from coding assistance toward workflow ownership.",
      zh: '第一篇 Signal Brief 把本周 coding-agent 信号转成一个工作假设：这个类别正在从编码辅助走向工作流 ownership。',
    },
    sections: [
      {
        heading: {
          en: 'The strongest signal',
          zh: '最强的信号',
        },
        body: [
          {
            en: 'Coding agents are being framed less like smarter autocomplete and more like work surfaces.',
            zh: 'Coding agents 正在被重新定义。它们不再只是更聪明的 autocomplete，而是开始变成一种工作界面。',
          },
          {
            en: 'Cursor, Kiro, and the broader agentic IDE category all point in the same direction: the interesting product surface is no longer only the editor. It is task handoff, repo context, review, memory, and proof that the work is real.',
            zh: 'Cursor、Kiro，以及整个 agentic IDE 类别都在指向同一个方向：真正重要的产品界面不只是 editor，而是任务交接、仓库上下文、review、memory，以及证明工作真的完成的 evidence。',
          },
        ],
      },
      {
        heading: {
          en: 'The pattern behind it',
          zh: '背后的模式',
        },
        body: [
          {
            en: 'The category is moving from assistance to ownership.',
            zh: '这个类别正在从 assistance 走向 ownership。',
          },
          {
            en: 'That does not mean agents should run without boundaries. It means the unit of work is getting larger. A developer is no longer asking for one completion or one function. They are increasingly delegating a scoped task and expecting the system to plan, edit, check, and report back.',
            zh: '这不代表 agent 应该无边界地自己乱跑。它代表工作单位正在变大。开发者不再只是要一个 completion 或一个 function，而是在委托一个有范围的任务，并期待系统能计划、修改、检查、汇报。',
          },
        ],
      },
      {
        heading: {
          en: 'Why it matters for builders',
          zh: '为什么这对 builders 重要',
        },
        body: [
          {
            en: 'This changes what builders need to design. The scarce skill is not only prompting. It is designing the operating contract around the agent.',
            zh: '这会改变 builders 需要设计的东西。稀缺能力不只是 prompt，而是为 agent 设计 operating contract。',
          },
        ],
        bullets: [
          {
            en: 'What can it read?',
            zh: '它能读什么？',
          },
          {
            en: 'What can it change?',
            zh: '它能改什么？',
          },
          {
            en: 'When should it stop?',
            zh: '它什么时候应该停？',
          },
          {
            en: 'What evidence proves it finished?',
            zh: '什么证据能证明它完成了？',
          },
          {
            en: 'How does a human review the result without redoing the work?',
            zh: '人怎么 review，而不是重新做一遍？',
          },
        ],
      },
      {
        heading: {
          en: 'What I am skeptical about',
          zh: '我保持怀疑的地方',
        },
        body: [
          {
            en: 'I am skeptical of demos that make agentic work look frictionless.',
            zh: '我对那些让 agentic work 看起来完全无摩擦的 demo 保持怀疑。',
          },
          {
            en: 'Real work has messy context, unclear constraints, repo-specific judgment, and review cost. The category will not be won only by the model that writes the most code. It will be won by systems that make delegated work legible, checkable, and reversible.',
            zh: '真实工作里有混乱的上下文、不清晰的限制、仓库特有的判断，以及 review 成本。这个类别不会只由最会写代码的模型赢。它会由那些能让委托工作变得可读、可检查、可回滚的系统赢。',
          },
        ],
      },
      {
        heading: {
          en: 'What I might build because of this',
          zh: '我可能因此构建什么',
        },
        body: [
          {
            en: 'The product hypothesis is an Agent Operating Contract: a simple set of templates and review workflows for builders and small teams.',
            zh: '这里的产品假设是 Agent Operating Contract：先从一组简单模板和 review 工作流开始，服务 builders 和小团队。',
          },
          {
            en: 'That is small enough to test, but valuable enough to become a real product surface.',
            zh: '这足够小，可以测试；也足够有价值，可以慢慢变成真正的产品界面。',
          },
        ],
      },
    ],
  },
]

export function normalizeSignalBriefLocale(locale: string): SignalLocale {
  return locale === 'zh' ? 'zh' : 'en'
}
