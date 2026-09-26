import type {ClaudeClient} from "./client.js";

type ClaudeResponse={content?:Array<{type:string;text?:string}>};

export class AnthropicAdapter implements ClaudeClient{
  constructor(
    private readonly apiKey:string,
    private readonly model=process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
    private readonly apiUrl=process.env.ANTHROPIC_API_URL || "https://api.anthropic.com/v1/messages"
  ){}
  async generate<T>(input:{system:string;user:string;schema?:object}):Promise<T>{
    if(!this.apiKey) throw new Error("ANTHROPIC_API_KEY is required.");
    const response=await fetch(this.apiUrl,{
      method:"POST",
      headers:{
        "content-type":"application/json",
        "x-api-key":this.apiKey,
        "anthropic-version":process.env.ANTHROPIC_VERSION || "2023-06-01"
      },
      body:JSON.stringify({
        model:this.model,
        max_tokens:4096,
        system:input.system,
        messages:[{role:"user",content:input.user}]
      })
    });
    if(!response.ok) throw new Error("Claude API request failed: "+response.status+" "+await response.text());
    const data=await response.json() as ClaudeResponse;
    const text=data.content?.find(item=>item.type==="text")?.text;
    if(!text) throw new Error("Claude returned no text content.");
    try{return JSON.parse(text) as T;}catch{return text as T;}
  }
}