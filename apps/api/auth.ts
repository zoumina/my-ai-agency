export interface AuthContext{userId:string;roles:string[]}
export function requireRole(ctx:AuthContext,role:string){if(!ctx.roles.includes(role))throw new Error("Forbidden");return true}