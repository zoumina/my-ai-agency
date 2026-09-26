import type {ScheduleJob} from "./schedule.js"; import {defaultSchedules} from "./schedule.js";
export class SchedulerRunner{
 private timers:NodeJS.Timeout[]=[];
 constructor(private readonly handlers:Record<string,()=>Promise<void>|void>,private readonly schedules:ScheduleJob[]=defaultSchedules){}
 start():void{if(process.env.NODE_ENV==="test")return;for(const job of this.schedules.filter(x=>x.enabled)){const h=this.handlers[job.name];if(!h)continue;const ms=job.intervalMinutes*60000;const t=setInterval(()=>Promise.resolve(h()).catch(()=>{}),ms);t.unref();this.timers.push(t);}}
 stop():void{for(const t of this.timers)clearInterval(t);this.timers=[];}
}