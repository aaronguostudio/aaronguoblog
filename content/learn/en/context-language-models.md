---
title: 'Context Language Models'
fullName: 'Context Language Models'
shortName: 'CLM'
description: 'Keep an editable working record so the next AI call receives the requirements that still apply.'
mentalModel: 'The trip gets longer. The budget and the child’s needs stay. The next call should see all three.'
date: '2026-10-06'
updated: '2026-10-06'
domain: 'AI systems'
domainKey: 'ai-systems'
tags: ['context-management', 'AI-agents', 'working-context']
maturity: 'growing'
published: true
featured: false
translationKey: 'context-language-models'
socialImage: '/learn-img/context-language-models/og-1200x627.jpg'
socialImageAlt: 'An illustrated Tokyo family trip record changes from three to five days, retains a US$3,000 budget and short-walk constraint, and feeds the updated record into the next AI call.'
cardImage: '/learn-img/context-language-models/card-4x5.jpg'
cardImageAlt: 'An illustrated Tokyo family trip record changes from three to five days, retains a US$3,000 budget and short-walk constraint, and feeds the updated record into the next AI call.'
neighbors:
  - name: 'Context Window'
    fullName: 'Context Window'
    category: 'input boundary'
    summary: 'How much input a model can process in one call. A larger window still needs clear current requirements.'
  - name: 'Task State'
    fullName: 'Task State'
    category: 'working record'
    summary: 'The current goal, active constraints, decisions already made, and unfinished work.'
sources:
  - title: 'Rulin Shao et al. · Context Language Models'
    url: 'https://arxiv.org/abs/2609.37725'
  - title: 'Official CLM harness · How a turn works'
    url: 'https://github.com/facebookresearch/context-language-models/blob/main/clm/clm_harness/README.md'
---

Imagine a father, mother, and daughter asking an AI to plan three days in Tokyo. Their **total budget is US$3,000**, and their daughter tires on long walks. Then they ask: “Make it five days.”

The duration changed. The budget and walking limit still apply. The next answer needs to account for all of them.

## Context is the material supplied to this call

A model generates an answer from the instructions, conversation, and tool results supplied to that call. Think of those as papers on a desk: there may be many old plans, but the current job needs to be clear.

In September 2026, Rulin Shao and colleagues introduced [Context Language Models (CLM)](https://arxiv.org/abs/2609.37725), which let a model edit its own working context and organize the material carried into later work.

## Update the days. Keep the other conditions.

For this hypothetical trip, an updated working record could look like this:

| Condition    | Before             | Now                |
| ------------ | ------------------ | ------------------ |
| Duration     | 3 days             | **5 days**         |
| Total budget | US$3,000           | US$3,000           |
| Family       | Dad, mom, daughter | Dad, mom, daughter |
| Walking      | Keep walks short   | Keep walks short   |

It should also retain new unfinished work: **recalculate accommodation and transport for two extra nights.** Updating a field does not prove the longer trip fits the budget.

The record must reach the next call. The official implementation mirrors editable context into a file, lets the model change it, and reads accepted changes back. System instructions and the original task stay pinned separately. The [official harness documentation](https://github.com/facebookresearch/context-language-models/blob/main/clm/clm_harness/README.md) explains this handoff.

## A habit you can borrow

When a task changes, ask:

> Before continuing, list what changed, which conditions still apply, and what new work the change creates. Then continue using the updated requirements.

This helps you inspect task state. A prompt alone does not activate CLM, and the model can still omit a condition. The trip is an illustration, not a measured result.

To check whether an AI has kept up, start with the material it will use next: **does it still accurately describe the job you now want done?**
