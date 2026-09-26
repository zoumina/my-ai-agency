export interface ClaudeClient {
  generate<T>(input: {
    system: string;
    user: string;
    schema?: object;
  }): Promise<T>;
}

export function createClaudePlaceholder(): ClaudeClient {
  return {
    async generate<T>(): Promise<T> {
      throw new Error("Claude adapter is not configured. Configure the production adapter before enabling autonomous execution.");
    }
  };
}