import type {ClaudeClient} from "./client.js";
export class AnthropicAdapter implements ClaudeClient{
 constructor(private readonly apiKey:string){}
 async generate<T>():Promise<T>{if(!this.apiKey)throw new Error("ANTHROPIC_API_KEY is required.");throw new Error("Production Claude HTTP adapter is intentionally isolated behind this interface.");}
}