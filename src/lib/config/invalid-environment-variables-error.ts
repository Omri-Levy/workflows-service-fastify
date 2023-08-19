export class InvalidEnvironmentVariablesError extends Error {
  constructor(public readonly errors: unknown) {
    super('❌ Invalid environment variables');
  }
}
