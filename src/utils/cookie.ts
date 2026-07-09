/**
 * Cookie 解析工具。逻辑与浏览器端 apps/web/src/utils/cookie.ts 保持一致，
 * 支持 JSON、Netscape、Name=Value 三种格式的自动识别与解析。
 * 与浏览器端的差异：移除了 i18n（$t）与浏览器 DOM 依赖（readCookiesFile）。
 */

interface CookieInput {
  name?: unknown
  value?: unknown
  domain?: unknown
  path?: unknown
  expires?: unknown
  expiry?: unknown
  httpOnly?: unknown
  secure?: unknown
  sameSite?: unknown
  session?: unknown
  [key: string]: unknown
}

export interface ParsedCookie {
  name: string
  value: string
  domain: string
  path: string
  expires: number
  httpOnly: boolean
  secure: boolean
  sameSite: string
  session: boolean
  [key: string]: unknown
}

export interface ParseCookieOptions {
  /** 为 Name=Value / document.cookie 链中的每条 Cookie 注入的默认属性 */
  defaultAttributes?: CookieInput
  /** windowPlatformList 中的 platformUrl，用于 Name=Value 无 domain 时按行顺序填充 */
  platformUrls?: string[]
}

export const COOKIE_MISSING_DOMAIN_MSG = '缺少 domain 信息，请在下面平台账号中选择或新增对应的业务平台'

const COOKIE_ATTRIBUTE_KEYS = new Set([
  'domain',
  'path',
  'expires',
  'expiry',
  'maxage',
  'secure',
  'httponly',
  'samesite',
])

function normalizeExpires(expires: unknown): number {
  if (expires === undefined || expires === null || expires === '')
    return -1

  const num = Number(expires)
  if (!Number.isFinite(num) || num <= 0)
    return -1

  if (num > 1e10)
    return Math.floor(num / 1000)

  return Math.floor(num)
}

function normalizeSameSite(sameSite: unknown): string {
  if (typeof sameSite !== 'string' || !sameSite.trim())
    return 'Lax'

  const normalized = sameSite.trim().toLowerCase()
  if (normalized === 'none')
    return 'None'
  if (normalized === 'strict')
    return 'Strict'
  return 'Lax'
}

function normalizeCookie(cookie: CookieInput): ParsedCookie {
  const expires = normalizeExpires(cookie.expires ?? cookie.expiry)
  const sameSite = normalizeSameSite(cookie.sameSite)
  const secure = sameSite === 'None' ? true : Boolean(cookie.secure)

  return {
    ...cookie,
    name: String(cookie.name ?? ''),
    value: String(cookie.value ?? ''),
    domain: String(cookie.domain ?? ''),
    path: String(cookie.path || '/'),
    expires,
    httpOnly: Boolean(cookie.httpOnly),
    secure,
    sameSite,
    session: Boolean(cookie.session ?? expires === -1),
  }
}

function normalizeCookieAttributeKey(key: string) {
  return key.trim().toLowerCase().replace(/-/g, '')
}

function isCookieAttributeKey(key: string) {
  return COOKIE_ATTRIBUTE_KEYS.has(normalizeCookieAttributeKey(key))
}

function parseBooleanAttribute(value?: string) {
  if (value === undefined || value === '')
    return true

  return /^(?:1|true|yes)$/i.test(value.trim())
}

function applyCookieAttribute(cookie: CookieInput, key: string, value?: string) {
  switch (normalizeCookieAttributeKey(key)) {
    case 'domain':
      cookie.domain = value?.trim() ?? ''
      break
    case 'path':
      cookie.path = value?.trim() || '/'
      break
    case 'expires':
    case 'expiry':
      cookie.expires = value?.trim()
      break
    case 'maxage':
      if (value?.trim()) {
        cookie.expires = Math.floor(Date.now() / 1000) + Number.parseInt(value.trim(), 10)
      }
      break
    case 'secure':
      cookie.secure = parseBooleanAttribute(value)
      break
    case 'httponly':
      cookie.httpOnly = parseBooleanAttribute(value)
      break
    case 'samesite':
      cookie.sameSite = value?.trim()
      break
  }
}

function parseNameValueSegment(part: string): { name: string, value: string } | null {
  const trimmed = part.trim()
  if (!trimmed)
    return null

  const eqIndex = trimmed.indexOf('=')
  if (eqIndex === -1)
    return { name: trimmed, value: '' }

  if (eqIndex <= 0)
    return null

  const name = trimmed.slice(0, eqIndex).trim()
  if (!name || isCookieAttributeKey(name))
    return null

  return { name, value: trimmed.slice(eqIndex + 1) }
}

/** 剥离行首连续属性：domain=...; path=...; */
function peelLeadingAttributes(text: string) {
  const defaults: CookieInput = { path: '/' }
  let rest = text.trim()

  while (rest) {
    const match = rest.match(/^(domain|path|expires|expiry|max-age|maxage|secure|httponly|samesite)=([^;]*)\s*;\s*/i)
    if (!match)
      break

    applyCookieAttribute(defaults, match[1]!, match[2])
    rest = rest.slice(match[0].length).trim()
  }

  return { defaults, rest }
}

function mergeDefaultAttributes(cookie: CookieInput, defaults: CookieInput = {}) {
  const merged = {
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
    ...defaults,
    ...cookie,
  }

  return {
    ...merged,
    path: String(merged.path || '/'),
  }
}

function dedupeCookies(cookies: CookieInput[]) {
  const seen = new Set<string>()
  const result: CookieInput[] = []

  for (const cookie of cookies) {
    const key = JSON.stringify({
      name: cookie.name,
      domain: cookie.domain ?? '',
      path: cookie.path || '/',
      value: cookie.value ?? '',
    })
    if (seen.has(key))
      continue

    seen.add(key)
    result.push(cookie)
  }

  return result
}

function normalizeCookieList(cookies: CookieInput[]) {
  return dedupeCookies(cookies).map(cookie => normalizeCookie(cookie))
}

function splitSemicolonParts(text: string) {
  return text.split(';').map(part => part.trim()).filter(Boolean)
}

function isPlainNameValueChain(text: string) {
  const { rest } = peelLeadingAttributes(text)
  const parts = splitSemicolonParts(rest)
  if (!parts.length)
    return false

  return parts.every((part) => {
    const eqIndex = part.indexOf('=')
    if (eqIndex === -1)
      return Boolean(part.trim())

    const key = part.slice(0, eqIndex).trim()
    return Boolean(key) && !isCookieAttributeKey(key)
  })
}

/**
 * document.cookie 风格：name=value; name=value
 * 可通过 defaultAttributes 或行首 domain=...; path=...; 注入通用属性
 */
function parseCookieStringChain(text: string, defaultAttributes: CookieInput = {}): CookieInput[] | null {
  const { defaults: leadingDefaults, rest } = peelLeadingAttributes(text)
  const mergedDefaults = mergeDefaultAttributes({}, { ...defaultAttributes, ...leadingDefaults })
  const cookies: CookieInput[] = []

  for (const part of splitSemicolonParts(rest)) {
    const pair = parseNameValueSegment(part)
    if (!pair)
      continue

    cookies.push(mergeDefaultAttributes({ name: pair.name, value: pair.value }, mergedDefaults))
  }

  return cookies.length ? cookies : null
}

function createCookieDraft(defaults: CookieInput = {}) {
  return mergeDefaultAttributes({}, defaults)
}

/** Set-Cookie 扩展：name=value; domain=...; path=...（属性可在 name 前后） */
function parseExtendedCookieEntry(entry: string, defaultAttributes: CookieInput = {}): CookieInput[] {
  const cookies: CookieInput[] = []
  let draft = createCookieDraft(defaultAttributes)

  for (const part of splitSemicolonParts(entry)) {
    const eqIndex = part.indexOf('=')
    if (eqIndex <= 0) {
      if (!draft.name && !String(draft.domain ?? '').trim())
        continue

      applyCookieAttribute(draft, part)
      continue
    }

    const key = part.slice(0, eqIndex).trim()
    const value = part.slice(eqIndex + 1)
    if (!key)
      continue

    if (isCookieAttributeKey(key)) {
      applyCookieAttribute(draft, key, value)
      continue
    }

    if (draft.name)
      cookies.push({ ...draft })

    draft = createCookieDraft(defaultAttributes)
    draft.name = key
    draft.value = value
  }

  if (draft.name)
    cookies.push({ ...draft })

  return cookies
}

function parseSemicolonCookieString(text: string, defaultAttributes: CookieInput = {}): ParsedCookie[] | null {
  if (isPlainNameValueChain(text)) {
    const cookies = parseCookieStringChain(text, defaultAttributes)
    return cookies ? normalizeCookieList(cookies) : null
  }

  const cookies = parseExtendedCookieEntry(text, defaultAttributes)
  return cookies.length ? normalizeCookieList(cookies) : null
}

function splitCookieEntryParts(entry: string): string[] {
  if (entry.includes(';'))
    return splitSemicolonParts(entry)

  return entry
    .split(/,(?=\s*(?:domain|path|expires|expiry|max-age|maxage|secure|httponly|http-only|samesite|same-site)\s*=)/i)
    .map(part => part.trim())
    .filter(Boolean)
}

function parseExtendedNameValueEntry(entry: string, defaultAttributes: CookieInput = {}): CookieInput[] {
  const cookies: CookieInput[] = []
  let current: CookieInput | null = null

  for (const part of splitCookieEntryParts(entry)) {
    const eqIndex = part.indexOf('=')
    if (eqIndex <= 0) {
      if (!current?.name)
        return []

      applyCookieAttribute(current, part)
      continue
    }

    const key = part.slice(0, eqIndex).trim()
    const value = part.slice(eqIndex + 1)
    if (!key)
      return []

    if (isCookieAttributeKey(key)) {
      if (!current?.name)
        return []

      applyCookieAttribute(current, key, value)
      continue
    }

    if (current?.name)
      cookies.push(current)

    current = mergeDefaultAttributes({ name: key, value }, defaultAttributes)
  }

  if (current?.name)
    cookies.push(current)

  return cookies
}

function groupCommaSeparatedCookieEntries(text: string): string[] {
  const parts = text.split(',').map(part => part.trim()).filter(Boolean)
  if (parts.length <= 1)
    return parts

  const entries: string[] = []
  let current: string[] = []

  for (const part of parts) {
    const eqIndex = part.indexOf('=')
    const key = eqIndex > 0 ? part.slice(0, eqIndex).trim() : part.trim()

    if (!current.length) {
      current.push(part)
      continue
    }

    if (isCookieAttributeKey(key)) {
      current.push(part)
      continue
    }

    entries.push(current.join(', '))
    current = [part]
  }

  if (current.length)
    entries.push(current.join(', '))

  return entries
}

/** 从 platformUrl（含 http(s) 及账号后缀）提取 hostname 作为 cookie domain */
export function extractDomainFromPlatformUrl(platformUrl: string): string {
  const trimmed = platformUrl?.trim()
  if (!trimmed)
    return ''

  const platformPart = trimmed.match(/^(https?:\/\/[^:\s{]+)/i)?.[1] ?? trimmed

  try {
    return new URL(platformPart).hostname
  }
  catch {
    return platformPart.replace(/^https?:\/\//i, '').split(/[/:?#]/)[0] ?? ''
  }
}

export function isNameValueCookieText(text: string): boolean {
  const trimmed = text?.trim()
  if (!trimmed)
    return false

  if (trimmed.startsWith('[') || trimmed.startsWith('{'))
    return false

  return !isNetscapeCookieFormat(trimmed)
}

function countNameValueDomainFillGroups(text: string): number {
  const trimmed = text.trim()
  if (!trimmed)
    return 0

  const lines = trimmed.includes('\n')
    ? trimmed.split('\n').map(line => line.trim()).filter(Boolean)
    : [trimmed]

  return lines.filter(line => lineNeedsDomainFill(line)).length
}

function parseNameValueLineContent(line: string, defaultAttributes: CookieInput = {}): ParsedCookie[] | null {
  const lineText = line.trim()
  if (!lineText)
    return null

  const { defaults: leadingDefaults } = peelLeadingAttributes(lineText)
  const mergedDefaults = mergeDefaultAttributes(defaultAttributes, leadingDefaults)

  if (lineText.includes(';'))
    return parseSemicolonCookieString(lineText, mergedDefaults)

  const parsed = (lineText.includes(',')
    ? groupCommaSeparatedCookieEntries(lineText)
    : [lineText])
    .flatMap(entry => parseExtendedNameValueEntry(entry, mergedDefaults))
    .filter((cookie): cookie is CookieInput => Boolean(cookie.name))

  return parsed.length ? normalizeCookieList(parsed) : null
}

function lineNeedsDomainFill(line: string): boolean {
  const lineText = line.trim()
  if (!lineText)
    return false

  const { defaults } = peelLeadingAttributes(lineText)
  if (String(defaults.domain ?? '').trim())
    return false

  const cookies = parseNameValueLineContent(lineText)
  return Boolean(cookies?.some(cookie => !cookie.domain.trim()))
}

interface PlatformIndex { index: number }

function parseNameValueLine(
  line: string,
  defaultAttributes: CookieInput = {},
  platformUrls?: string[],
  platformIndex: PlatformIndex = { index: 0 },
): ParsedCookie[] | 'missing_domain' | null {
  const lineText = line.trim()
  if (!lineText)
    return null

  const { defaults: leadingDefaults } = peelLeadingAttributes(lineText)
  const hasLeadingDomain = Boolean(String(leadingDefaults.domain ?? '').trim())
  const cookies = parseNameValueLineContent(lineText, defaultAttributes)

  if (!cookies?.length)
    return null

  if (!hasLeadingDomain && cookies.some(cookie => !cookie.domain.trim())) {
    if (!platformUrls?.length || platformIndex.index >= platformUrls.length)
      return 'missing_domain'

    const domain = extractDomainFromPlatformUrl(platformUrls[platformIndex.index]!)
    platformIndex.index += 1

    return cookies.map(cookie => ({
      ...cookie,
      domain: cookie.domain.trim() || domain,
    }))
  }

  return cookies
}

function parseNameValueCookies(
  text: string,
  defaultAttributes: CookieInput = {},
  platformUrls?: string[],
): ParsedCookie[] | null {
  const trimmed = text.trim()
  if (!trimmed)
    return null

  const platformIndex: PlatformIndex = { index: 0 }

  if (trimmed.includes('\n')) {
    const merged: ParsedCookie[] = []
    for (const line of trimmed.split('\n')) {
      const lineText = line.trim()
      if (!lineText)
        continue

      const parsed = parseNameValueLine(lineText, defaultAttributes, platformUrls, platformIndex)
      if (parsed === 'missing_domain')
        return null

      if (parsed)
        merged.push(...parsed)
    }
    return merged.length ? merged : null
  }

  const parsed = parseNameValueLine(trimmed, defaultAttributes, platformUrls, platformIndex)
  if (parsed === 'missing_domain')
    return null

  return parsed
}

function isNetscapeCookieFormat(text: string): boolean {
  if (/^#\s*(?:Netscape\s+)?HTTP Cookie File/m.test(text))
    return true

  return text.split('\n').some((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#'))
      return false

    const parts = trimmed.split('\t')
    if (parts.length < 7)
      return false

    return /^(?:TRUE|FALSE)$/i.test(parts[1]!.trim()) && /^(?:TRUE|FALSE)$/i.test(parts[3]!.trim())
  })
}

function parseNetscapeCookies(text: string): ParsedCookie[] | null {
  const cookies: ParsedCookie[] = []

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || (trimmed.startsWith('#') && !trimmed.startsWith('#HttpOnly_')))
      continue

    const parts = trimmed.split('\t')
    if (parts.length < 7)
      continue

    let domain = parts[0]!.trim()
    let httpOnly = false
    if (domain.startsWith('#HttpOnly_')) {
      httpOnly = true
      domain = domain.slice('#HttpOnly_'.length)
    }

    const [, , path, secure, expiration, name, ...valueParts] = parts
    const cookieName = name?.trim()
    if (!domain || !cookieName)
      continue

    const expires = Number.parseInt(expiration?.trim() || '0', 10)

    cookies.push(normalizeCookie({
      domain,
      path: path?.trim() || '/',
      secure: secure?.trim().toUpperCase() === 'TRUE',
      expires: expires > 0 ? expires : undefined,
      httpOnly,
      name: cookieName,
      value: valueParts.join('\t'),
    }))
  }

  return cookies.length ? cookies : null
}

function isCookieRecord(value: unknown): value is CookieInput {
  return Boolean(value && typeof value === 'object' && 'name' in value && (value as CookieInput).name)
}

function parseJsonCookies(text: string): ParsedCookie[] | null {
  try {
    const parsed: unknown = JSON.parse(text)
    const cookies = (Array.isArray(parsed) ? parsed : [parsed]).filter(isCookieRecord)
    if (!cookies.length)
      return null

    return normalizeCookieList(cookies)
  }
  catch {
    return null
  }
}

export function normalizeCookies(cookies: unknown): ParsedCookie[] {
  if (!Array.isArray(cookies))
    return []

  return cookies.filter(isCookieRecord).map(cookie => normalizeCookie(cookie))
}

export function parseCookies(input: string, options: ParseCookieOptions = {}): ParsedCookie[] | null {
  const result = validateCookieInput(input, options)
  return result.valid ? result.cookies : null
}

export function validateCookieInput(
  input: string,
  options: ParseCookieOptions = {},
): { valid: true, cookies: ParsedCookie[] } | { valid: false, message: string } {
  const text = input?.trim() ?? ''
  if (!text)
    return { valid: true, cookies: [] }

  const defaultAttributes = options.defaultAttributes ?? {}
  const platformUrls = options.platformUrls ?? []

  if (text.startsWith('[') || text.startsWith('{')) {
    const cookies = parseJsonCookies(text)
    return cookies
      ? { valid: true, cookies }
      : { valid: false, message: 'Cookie 格式错误，请检查格式' }
  }

  if (isNetscapeCookieFormat(text)) {
    const cookies = parseNetscapeCookies(text)
    return cookies
      ? { valid: true, cookies }
      : { valid: false, message: 'Cookie 格式错误，请检查格式' }
  }

  const groupsNeedingDomain = countNameValueDomainFillGroups(text)
  if (groupsNeedingDomain > platformUrls.length) {
    return {
      valid: false,
      message: `* ${COOKIE_MISSING_DOMAIN_MSG}`,
    }
  }

  const cookies = parseNameValueCookies(text, defaultAttributes, platformUrls)
  if (!cookies) {
    if (groupsNeedingDomain > 0 && groupsNeedingDomain > platformUrls.length) {
      return {
        valid: false,
        message: `* ${COOKIE_MISSING_DOMAIN_MSG}`,
      }
    }
    return { valid: false, message: 'Cookie 格式错误，请检查格式' }
  }

  return { valid: true, cookies }
}

/** 批量导入：结合同行 windowPlatformList 解析 Cookie（支持 Name=Value 从 platformUrl 补 domain） */
export function parseImportCookies(
  input: string,
  windowPlatformList: Array<{ platformUrl?: string }> = [],
): ParsedCookie[] {
  const platformUrls = windowPlatformList
    .map(item => item.platformUrl)
    .filter((url): url is string => Boolean(url?.trim()))

  const result = validateCookieInput(input?.trim() ?? '', { platformUrls })
  return result.valid ? result.cookies : []
}
