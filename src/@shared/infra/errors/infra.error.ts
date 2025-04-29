export class InfraError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'InfraError';
    this.cause = cause;
    Object.setPrototypeOf(this, InfraError.prototype);
  }
}
