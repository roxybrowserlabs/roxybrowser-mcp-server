export function hostWithPort(
  baseHost: string | undefined,
  port: number | undefined,
): string | undefined {
  if (port === undefined) return baseHost;
  const fallback = `http://127.0.0.1:${port}`;
  try {
    const url = new URL(baseHost ?? fallback);
    url.port = String(port);
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}
