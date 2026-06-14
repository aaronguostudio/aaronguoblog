const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'ref',
  'spm',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term',
])

export function canonicalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl)
    url.hash = ''
    url.hostname = url.hostname.toLowerCase()

    const keptParams = [...url.searchParams.entries()]
      .filter(([key]) => !TRACKING_PARAMS.has(key.toLowerCase()))
      .sort(([aKey, aValue], [bKey, bValue]) => aKey.localeCompare(bKey) || aValue.localeCompare(bValue))

    url.search = ''
    for (const [key, value] of keptParams) {
      url.searchParams.append(key, value)
    }

    const asString = url.toString()
    return asString.endsWith('/') ? asString.slice(0, -1) : asString
  } catch {
    return ''
  }
}
