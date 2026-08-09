import type { PlatformCookie } from "../../../api/index.js";

type CookieRecord = Partial<PlatformCookie> & Record<string, unknown>;

function scalar(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : fallback;
}

function normalizeCookie(value: CookieRecord): PlatformCookie {
  const expiresValue = Number(value.expires ?? value.expiry);
  const expires = Number.isFinite(expiresValue) && expiresValue > 0 ? Math.floor(expiresValue) : -1;
  const sameSite =
    ["None", "Strict", "Lax"].find(
      (candidate) => candidate.toLowerCase() === scalar(value.sameSite).toLowerCase(),
    ) ?? "Lax";
  return {
    ...value,
    name: scalar(value.name),
    value: scalar(value.value),
    domain: scalar(value.domain),
    path: scalar(value.path, "/") || "/",
    expires,
    httpOnly: Boolean(value.httpOnly),
    secure: sameSite === "None" || Boolean(value.secure),
    sameSite,
    session: Boolean(value.session ?? expires === -1),
  } as PlatformCookie;
}

export function normalizeCookies(value: unknown): PlatformCookie[] {
  const values = Array.isArray(value) ? value : [value];
  return values
    .filter((item): item is CookieRecord => Boolean(item && typeof item === "object"))
    .map(normalizeCookie);
}

function domainFromUrl(url: unknown) {
  const text = scalar(url).trim();
  if (!text) return "";
  try {
    return new URL(text.includes("://") ? text : `https://${text}`).hostname;
  } catch {
    return text.replace(/^https?:\/\//i, "").split(/[/:?#]/)[0] ?? "";
  }
}

function parseNetscape(text: string): PlatformCookie[] {
  return text
    .split(/\r?\n/)
    .filter((line) => (line.trim() && !line.startsWith("#")) || line.startsWith("#HttpOnly_"))
    .map((line) => line.split("\t"))
    .filter((parts) => parts.length >= 7)
    .map(([rawDomain, , path, secure, expires, name, ...values]) =>
      normalizeCookie({
        domain: rawDomain?.replace(/^#HttpOnly_/, ""),
        path,
        secure: secure?.toUpperCase() === "TRUE",
        expires,
        httpOnly: rawDomain?.startsWith("#HttpOnly_"),
        name,
        value: values.join("\t"),
      }),
    );
}

function parseNameValue(text: string, platformUrls: string[]): PlatformCookie[] {
  const groups = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  let platformIndex = 0;
  return groups.flatMap((group) => {
    const leadingDomain = group.match(/(?:^|;)\s*domain=([^;]+)/i)?.[1]?.trim();
    const entries = group
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part.includes("="));
    const domain = leadingDomain || domainFromUrl(platformUrls[platformIndex++]);
    return entries
      .filter((entry) => !/^(domain|path|expires|secure|httponly|samesite|max-age)=/i.test(entry))
      .map((entry) => {
        const index = entry.indexOf("=");
        return normalizeCookie({
          name: entry.slice(0, index).trim(),
          value: entry.slice(index + 1),
          domain,
        });
      });
  });
}

export function validateCookieInput(
  input: string,
  options: { platformUrls?: string[] } = {},
): { valid: true; cookies: PlatformCookie[] } | { valid: false; message: string } {
  const text = input.trim();
  if (!text) return { valid: true, cookies: [] };
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const cookies = normalizeCookies(JSON.parse(text));
      return cookies.length > 0
        ? { valid: true, cookies }
        : { valid: false, message: "no Cookie objects were found" };
    } catch {
      return { valid: false, message: "invalid JSON Cookie input" };
    }
  }
  if (/^#\s*(?:Netscape\s+)?HTTP Cookie File/m.test(text)) {
    const cookies = parseNetscape(text);
    return cookies.length > 0
      ? { valid: true, cookies }
      : { valid: false, message: "no valid Netscape Cookie rows were found" };
  }
  const cookies = parseNameValue(text, options.platformUrls ?? []);
  return cookies.length > 0
    ? { valid: true, cookies }
    : { valid: false, message: "no Name=Value Cookies were found" };
}

export function parseImportCookies(
  input: string,
  windowPlatformList: Array<{ platformUrl?: string }> = [],
): PlatformCookie[] {
  const result = validateCookieInput(input, {
    platformUrls: windowPlatformList.map((item) => item.platformUrl ?? ""),
  });
  return result.valid ? result.cookies : [];
}
