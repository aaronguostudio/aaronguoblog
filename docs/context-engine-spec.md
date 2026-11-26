# Context Engine 规范

这是 Context Engine 的唯一事实来源。Notion 保存供人阅读的副本，并标注当前规范版本和 Git 提交链接。每次修改本规范都必须用下方的变更单发起 PR。PR 合并后，才按合并版本同步 Notion。

## 四层架构

| 层 | 负责方 | 输入与产物 |
| --- | --- | --- |
| 采集 | Grok Bot @X | 发现候选内容，填入 Notion 来源字段，从 Google Drive 交付公开白名单 `radar-public.json`。导出文件由维护者从指定 Drive 位置下载。 |
| 编辑 | Aaron、Codex | Aaron 在 Notion「AI 精选资料库」作出取舍、标星及选择去向。Codex 按已授权的发布任务记录实际发布链接。 |
| 分发 | Codex、aaronguoblog | 从公开导出生成 `public/radar/latest.json`。Signal 使用该投影提供双语标题、缩略图和出站点击。Blog 和 YouTube 用稳定 ID 关联采用的资料。 |
| 反馈 | Codex | 按周汇总编辑决策、站点行为和 YouTube 指标，写入本地 `feedback/feedback-weekly-YYYY-Www.json`。Phase 1 产出周报元数据，Phase 2 接 Notion，Phase 3 接 Rybbit 和 YouTube。 |

## `radar-public.json` v1 / v2

| 路径 | v1 | v2 | 约定 |
| --- | --- | --- | --- |
| `schema_version` | 必填，整数 `1` | 必填，整数 `2` | 数值版本。 |
| `generated_at` | 必填 | 必填 | ISO 8601 日期或带时区的时间。 |
| `items` | 必填 | 必填 | 非空数组。 |
| `items[].id` | 可选 | 必填 | 非空字符串，Grok Bot 为同一记录持续使用同一 ID。迁移时可延用已有的 v1 派生 ID。 |
| `items[].title` | 必填 | 必填 | 原语言纯文本标题。 |
| `items[].lang` | 可选 | 必填 | `en`、`zh`、`ja`、`ko` 或 `other`。v1 缺省时按假名、韩文、汉字、拉丁文字的顺序推断，其余记为 `other`。纯汉字日文或非英语拉丁文字等有歧义的标题由上游填写。 |
| `items[].url` | 必填 | 必填 | 公开 HTTPS 原文链接，保留原跳转地址。 |
| `items[].source` | 必填 | 必填 | 来源名称，纯文本。 |
| `items[].topic` | 必填 | 必填 | 仓库中已配置的 Radar topic slug 或 `general`。 |
| `items[].published_at` | 必填 | 必填 | ISO 8601 日期或带时区的时间。 |
| `items[].image` | 可选 | 可选 | 可公开加载的 HTTPS 图片 URL。空值或无效地址视为缺失。 |

v1 缺 ID 时，对规范化 URL 的 UTF-8 字节做 SHA-1，取小写十六进制前 16 位。规范化沿用 WHATWG URL 序列化，去掉主机尾点、片段、路径尾斜线（根路径保留）、`utm_*`、`fbclid`、`gclid`、`msclkid`，再按查询键排序。相同规范化 URL 保留第一条。同一个 ID 对应多个规范化 URL 时拒绝导入。旧导出和相同时间戳但来源字段冲突的导出都会被拒绝。重跑同一导出可更新其派生字段。

公开快照的 `version` 为 `2`。每条记录输出 `id`、`title: { en, zh, original }`、`lang`、`url`、`source`、`topic`、`published_at`，以及存在时的 `image`。`published_at` 转为 UTC ISO 8601。主题分类保存在快照的 `topics` 中，供页面继续筛选。导入器仅投影表中的公开字段，页面也支持旧快照的字符串标题。

- 标题缓存为 `data/signal/title-cache.json`，键为 ID，值为 `{ en, zh, src_lang, title_hash }`。`title_hash` 是去首尾空白后原文标题的 SHA-256。新 ID、标题哈希变化或来源语言修正时才请求翻译。每批最多 20 条。英文只译中文，中文只译英文，日文、韩文和其他语言各译两种。失败的目标语言缓存为 `null`，公开快照显示原文。未配置 key 时直接用原文且不写入新的翻译缓存。需要对失败条目重试时，可清除该条的缓存再导入。
- 图片缓存为 `data/signal/image-cache.json`，键为 ID，值为 `{ url, image, checked_at }`。上游缺图时，读取原页面的 `og:image`，其次是 `twitter:image`。最多 4 项并发，每项包括重定向在内限时 3 秒。仅访问解析到公开地址的 HTTPS 页面。缓存命中时复用图片 URL，失败或无图记为 `null`，至少 7 天后重试。源 URL 改变时重查。仓库仅保存图片 URL，页面以无 Referrer 的懒加载方式直接渲染。
- 下载公开导出后执行 `node scripts/signal/import-radar.mjs /path/to/radar-public.json`。命令报告翻译批次数和图片查询条数。重复导入时携带仓库内的两份缓存。
- 运行时从环境读取已有的 `OPENAI_API_KEY`，可用新增的 `SIGNAL_TRANSLATION_MODEL` 覆盖默认 `gpt-4.1-mini`。密钥只进入运行进程环境。

## Notion「AI 精选资料库」字段所有权

| 字段 | 写入方 | 规则 |
| --- | --- | --- |
| 来源 ID（含可用的 `story_id` / `event_id`）、原文标题、语言、原文链接、来源、主题、发布时间、来源图片 | Grok Bot | 初次写入和来源更正。公开导出只包含其字段表允许的值。 |
| 状态 | Grok Bot 初始化，Aaron 持续维护 | 每条新资料初始化为「新」，此后的状态转换由 Aaron 决定。 |
| 星标、发布去向 | Aaron | 记录编辑优先级和所选渠道。 |
| 发布链接 | Codex | 对 Aaron 授权且已核验存在的发布补录链接。 |
| 状态、星标、发布去向、发布链接的周报投影 | Codex | Phase 2 对上述字段及行标识只读查询。周报写在文件系统。 |

状态机允许以下转换，星标独立于状态。

```text
新 → 待用 → 已用 → 归档
  ↘ 跳过 ───────→ 归档
待用 → 跳过
```

「待用」表示明确保留为候选。「已用」表示已在至少一个发布产物采用，实际去向可由发布链接核对。「归档」为最终状态，保留历史和归因 ID。

## `feedback-weekly.json` v1 schema

输出命令为 `node scripts/feedback/build-feedback-weekly.mjs [--week YYYY-Www]`。默认取 Edmonton 最近一个完整的 ISO 周。开始和结束是当地的周一与周日，两端包含，文件名使用 ISO 周所属的年份。每段在对应来源的数据读取成功后才出现，未接通或取数失败的段落省略。成功查询的空结果可以输出空数组。

| 字段 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `schema_version` | 整数 `1` | 是 | 周报版本。 |
| `week` | `YYYY-Www` 字符串 | 是 | ISO 周。 |
| `timezone` | 字符串 `America/Edmonton` | 是 | 站点和编辑周历。 |
| `period_start`、`period_end` | ISO 日期字符串 | 是 | 本地周一和周日。 |
| `generated_at` | UTC ISO 时间字符串 | 是 | 生成时间。 |
| `editorial` | `{ items: EditorialItem[] }` | 否 | Phase 2 的 Notion 快照。 |
| `site` | `{ pages: SitePage[], signal_clicks: SignalClick[] }` | 否 | Phase 3 的 Rybbit 周汇总。 |
| `external` | `{ youtube: { source: "youtube_studio_csv", videos: YouTubeVideo[] } }` | 否 | Phase 3 的 YouTube 周汇总。 |

| 记录 | 字段 |
| --- | --- |
| `EditorialItem` | `id: string`（Radar ID 或生产者记录 ID）、`status: "新" \| "待用" \| "跳过" \| "已用" \| "归档"`、`starred: boolean`、`destinations: string[]`、`publication_links: string[]`。 |
| `SitePage` | `pathname: string`、`pageviews: integer`、`time_on_page_seconds: number \| null`。 |
| `SignalClick` | `id: string`、`source: string`、`topic: string`、`lang: string`、`locale: string`、`count: integer`。 |
| `YouTubeVideo` | `video_id: string`、`views: integer`、`watch_time_minutes: number`、`average_view_duration_seconds: number \| null`、`story_ids: string[]`、`event_ids: string[]`。 |

各记录字段均必填，计数和时长非负。时长不可用时用 `null`。周报在仓库根目录的 `feedback/` 下生成，本地文件不进入 Git 或站点公开目录。

### Phase 2 编辑反馈

对 Notion「AI 精选资料库」只读分页查询状态、星标、发布去向和发布链接，外加用来关联导出的稳定记录 ID。`editorial` 表示周报生成时的编辑状态快照。无需从状态更新时间推算历史转换。

### Phase 3 站点反馈

站点已通过 Nuxt 加载 Rybbit，站点 ID 为 `82289e0e12a1`。Signal 的公开证据条目点击调用 `window.rybbit?.event("signal_click", { id, source, topic, lang, locale })`。

周报用环境变量 `RYBBIT_SITE_ID` 和 `RYBBIT_API_KEY`。请求使用 `Authorization: Bearer`，key 权限仅为 `analytics:read` 和 `events:read`。从 `GET /api/sites/:site/metric?parameter=pathname` 分页取 Signal 和 Blog 的路径级浏览量和停留秒数，包括 `/signal`、`/zh/signal` 及其子路径和 `/blogs`、`/zh/blogs` 及其子路径。传周起止日期和 `time_zone`。从 `GET /api/sites/:site/events?event_name=signal_click` 分页读取自定义事件，用 `id/source/topic/lang/locale` 的组合计数。周报仅保存聚合值。详见 [Rybbit API](https://rybbit.com/docs/api/getting-started)、[路径指标](https://rybbit.com/docs/api/overview/metric)和 [事件列表](https://rybbit.com/docs/api/events/list)。

### Phase 3 YouTube 反馈

使用 YouTube Studio 高级模式按周、按视频导出的 CSV。现阶段每周导出一次即可拿到所需指标，无需维护额外的 OAuth 客户端、令牌或 API 配额。保留 YouTube 导出所用的周日期范围和原始报表时间口径，用视频 ID 与发布记录关联。发布视频时，在视频描述或相关章节文本中记录 `story_id=<id>` 或 `event_id=<id>`。存在多个来源时逐一记录。周报保留视频级指标以及对应的来源 ID，避免把一条视频的完整观看量重复计给每个来源。操作见 [YouTube Studio 高级模式导出](https://support.google.com/youtube/answer/9717005?hl=en)。

## 变更单 PR 模板

```markdown
## 变更原因与负责人
- 申请方和受影响的上游、下游负责人
- 需要解决的问题和拟生效日期

## 契约变动
- 涉及的架构层、字段、字段写入方或状态转换
- 旧值、新值、schema 版本及兼容期
- 发布顺序、数据迁移及回滚步骤

## 验收
- v1 / v2 样例、兼容与回滚检查
- 签核人、证据链接及合并后 Notion 同步负责人
```

## 版本记录

| 规范版本 | 日期 | 内容 |
| --- | --- | --- |
| 1.0 | 2026-11-26 | Phase 1。确定四层架构、公开 Radar v1/v2 契约、Notion 写入责任、Signal 分发及反馈 v1 周报骨架。 |
