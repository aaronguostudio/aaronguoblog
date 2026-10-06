---
title: '上下文语言模型'
fullName: 'Context Language Models · 上下文语言模型'
shortName: 'CLM'
description: '用一份会更新的工作记录，让 AI 下一次回答读到当前有效的要求。'
mentalModel: '天数改了，预算和孩子的需求还在。AI 下一次读到的资料，也应该反映这个变化。'
date: '2026-10-06'
updated: '2026-10-06'
domain: 'AI 系统'
domainKey: 'ai-systems'
tags: ['上下文管理', 'AI Agent', '工作记录']
maturity: '持续生长'
published: true
featured: false
translationKey: 'context-language-models'
neighbors:
  - name: '上下文窗口'
    fullName: 'Context Window · 上下文窗口'
    category: '输入边界'
    summary: '模型一次能处理多少输入；窗口更大，也仍然需要把当前要求说清楚。'
  - name: '任务状态'
    fullName: 'Task State · 任务状态'
    category: '工作记录'
    summary: '记录现在的目标、仍有效的条件、已经作出的决定和未完成的工作。'
sources:
  - title: 'Rulin Shao 等 · Context Language Models'
    url: 'https://arxiv.org/abs/2609.37725'
  - title: '官方 CLM harness · 每轮怎样读回编辑'
    url: 'https://github.com/facebookresearch/context-language-models/blob/main/clm/clm_harness/README.md'
---

假设一家三口让 AI 安排东京三日游：爸爸、妈妈和女儿，全程总预算 **3,000 美元**，女儿走太远容易累。后来，他们说：“改成五天吧。”

五天是新要求，但预算没有增加，孩子也没有突然变得更能走。AI 继续规划时，需要同时看见这些条件。

## 上下文，就是这次回答收到的资料

模型生成回答时，会读取这次调用提供的指令、对话和工具结果。把它想成桌上的工作资料：旧方案可以很多，但当前要做什么，必须清楚。

Rulin Shao 等研究者在 2026 年 9 月提出了 [Context Language Models（CLM）](https://arxiv.org/abs/2609.37725)：让模型直接编辑自己的工作上下文，把需要带入后续工作的内容整理出来。

## 把“三天”更新成“五天”，其他条件继续保留

用这个假设旅行来理解，一份工作记录可以这样更新：

| 条件 | 之前 | 现在 |
| --- | --- | --- |
| 天数 | 3 天 | **5 天** |
| 总预算 | 3,000 美元 | 3,000 美元 |
| 同行者 | 爸爸、妈妈、女儿 | 爸爸、妈妈、女儿 |
| 步行要求 | 少走远路 | 少走远路 |

记录还应加上下一步：**重新计算多住两晚后的住宿和交通费用。** 改了天数，不代表五日游已经符合预算。

关键在于，这份记录必须真的进入下一次调用。官方实现会把可编辑的上下文写成文件，模型修改后，运行系统再读回这些修改；系统指令和原始任务另外保留。[官方运行说明](https://github.com/facebookresearch/context-language-models/blob/main/clm/clm_harness/README.md)描述了这个过程。

## 平时可以借用的做法

任务中途变更时，可以先让 AI 核对：

> 请先列出这次改了什么、哪些条件仍然有效，以及因此还需要做什么。确认后，再按更新后的条件继续。

这能帮助你检查任务状态，但一句提示词不会自动开启 CLM。模型仍可能漏掉条件；旅行例子也只是解释机制，没有证明效果提升。

检查 AI 有没有跟上变化，可以先看一件事：**它接下来依据的资料，是否仍然准确描述你现在要做的事。**
