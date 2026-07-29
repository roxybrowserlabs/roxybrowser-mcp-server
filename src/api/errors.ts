export class RoxyApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoxyApiConfigError";
  }
}

export class RoxyApiHttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: string;

  constructor(status: number, statusText: string, body: string) {
    super(`HTTP ${status}: ${statusText}${body ? ` ${body}` : ""}`);
    this.name = "RoxyApiHttpError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}
