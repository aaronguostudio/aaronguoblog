CREATE TABLE IF NOT EXISTS radar_topics (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  category TEXT NOT NULL,
  cadence TEXT NOT NULL,
  mode TEXT NOT NULL,
  lookback_days INTEGER NOT NULL,
  visibility TEXT NOT NULL,
  min_relevance INTEGER NOT NULL,
  source_hints_json TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS radar_runs (
  id INTEGER PRIMARY KEY,
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  status TEXT NOT NULL,
  cadence TEXT,
  mode TEXT,
  topic_slug TEXT,
  lookback_days INTEGER,
  raw_archive_path TEXT,
  warning_json TEXT,
  source_error_json TEXT,
  items_seen INTEGER DEFAULT 0,
  items_written INTEGER DEFAULT 0,
  error_message TEXT,
  FOREIGN KEY (topic_slug) REFERENCES radar_topics(slug)
);

CREATE TABLE IF NOT EXISTS radar_items (
  id INTEGER PRIMARY KEY,
  canonical_url TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  source_item_id TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  ai_summary TEXT,
  author TEXT,
  published_at TEXT,
  raw_json TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS radar_item_topics (
  item_id INTEGER NOT NULL,
  topic_slug TEXT NOT NULL,
  category TEXT NOT NULL,
  score REAL DEFAULT 0,
  relevance INTEGER DEFAULT 1,
  cluster_id TEXT,
  cluster_title TEXT,
  first_seen_at TEXT DEFAULT (datetime('now')),
  last_seen_at TEXT DEFAULT (datetime('now')),
  sighting_count INTEGER DEFAULT 1,
  latest_run_id INTEGER,
  PRIMARY KEY (item_id, topic_slug),
  FOREIGN KEY (item_id) REFERENCES radar_items(id),
  FOREIGN KEY (topic_slug) REFERENCES radar_topics(slug),
  FOREIGN KEY (latest_run_id) REFERENCES radar_runs(id)
);

CREATE TABLE IF NOT EXISTS radar_daily_pulses (
  date TEXT PRIMARY KEY,
  pulse_text TEXT NOT NULL,
  top_item_ids TEXT NOT NULL,
  generated_at TEXT DEFAULT (datetime('now')),
  run_id INTEGER,
  FOREIGN KEY (run_id) REFERENCES radar_runs(id)
);

CREATE TABLE IF NOT EXISTS radar_deep_reads (
  id INTEGER PRIMARY KEY,
  topic_slug TEXT NOT NULL,
  thread_slug TEXT NOT NULL,
  read_at TEXT NOT NULL,
  status TEXT NOT NULL,
  input_fingerprint TEXT UNIQUE NOT NULL,
  title_json TEXT NOT NULL,
  question_json TEXT NOT NULL,
  synthesis_json TEXT NOT NULL,
  caveat_json TEXT NOT NULL,
  sources_json TEXT NOT NULL,
  source_count INTEGER NOT NULL DEFAULT 0,
  model TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (topic_slug) REFERENCES radar_topics(slug)
);

CREATE INDEX IF NOT EXISTS idx_radar_item_topics_topic_relevance
  ON radar_item_topics(topic_slug, relevance DESC, score DESC);

CREATE INDEX IF NOT EXISTS idx_radar_items_source
  ON radar_items(source);

CREATE INDEX IF NOT EXISTS idx_radar_runs_status
  ON radar_runs(status, started_at);

CREATE INDEX IF NOT EXISTS idx_radar_deep_reads_topic_read_at
  ON radar_deep_reads(topic_slug, read_at DESC);
