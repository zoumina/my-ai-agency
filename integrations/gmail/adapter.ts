export interface GmailMessage{to:string;subject:string;body:string;providerId?:string}
export interface GmailReply{id:string;threadId?:string;from?:string;to?:string;subject?:string;snippet?:string;internalDate?:string}
export interface GmailAdapter{send(input:GmailMessage):Promise<{providerId:string}>;listReplies():Promise<GmailReply[]>}

type GmailTokenResponse={access_token:string;expires_in:number};
export function createGmailAdapter():GmailAdapter{
 const clientId=process.env.GMAIL_CLIENT_ID,clientSecret=process.env.GMAIL_CLIENT_SECRET,refreshToken=process.env.GMAIL_REFRESH_TOKEN,user=process.env.GMAIL_USER;
 async function accessToken():Promise<string>{
  if(!clientId||!clientSecret||!refreshToken)throw new Error("Gmail OAuth configuration is incomplete.");
  const body=new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:refreshToken,grant_type:"refresh_token"});
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
  if(!r.ok)throw new Error("Google OAuth token refresh failed: "+r.status);
  return (await r.json() as GmailTokenResponse).access_token;
 }
 function b64(s:string){return Buffer.from(s,"utf8").toString("base64url")}
 return {
  async send(input){
   if(!user)throw new Error("GMAIL_USER is required.");
   const token=await accessToken();
   const raw=[
    "From: "+user,
    "To: "+input.to,
    "Subject: "+input.subject,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8","",
    input.body
   ].join("\r\n");
   const r=await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send",{method:"POST",headers:{Authorization:"Bearer "+token,"content-type":"application/json"},body:JSON.stringify({raw:b64(raw)})});
   if(!r.ok)throw new Error("Gmail send failed: "+r.status+" "+await r.text());
   const d=await r.json() as {id?:string}; if(!d.id)throw new Error("Gmail returned no message id.");
   return {providerId:d.id};
  },
  async listReplies(){
   if(!user)throw new Error("GMAIL_USER is required.");
   const token=await accessToken();
   const list=await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread",{headers:{Authorization:"Bearer "+token}});
   if(!list.ok)throw new Error("Gmail list failed: "+list.status);
   const data=await list.json() as {messages?:Array<{id:string;threadId?:string}>};
   const messages=data.messages??[];
   const replies:GmailReply[]=[];
   for(const m of messages.slice(0,50)){
    const r=await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/"+m.id+"?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date",{headers:{Authorization:"Bearer "+token}});
    if(!r.ok)continue;
    const d=await r.json() as {id:string;threadId?:string;snippet?:string;internalDate?:string;payload?:{headers?:Array<{name:string;value:string}>}};
    const headers=Object.fromEntries((d.payload?.headers??[]).map(h=>[h.name.toLowerCase(),h.value]));
    replies.push({id:d.id,threadId:d.threadId,from:headers.from,to:headers.to,subject:headers.subject,snippet:d.snippet,internalDate:d.internalDate});
   }
   return replies;
  }
 };
}