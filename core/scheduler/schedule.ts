export interface ScheduleJob{name:string;intervalMinutes:number;enabled:boolean}
export const defaultSchedules:ScheduleJob[]=[
{name:"lead-research",intervalMinutes:60,enabled:true},
{name:"reply-sync",intervalMinutes:10,enabled:true},
{name:"health-monitor",intervalMinutes:5,enabled:true},
{name:"daily-report",intervalMinutes:1440,enabled:true},
{name:"learning-cycle",intervalMinutes:10080,enabled:true}
];