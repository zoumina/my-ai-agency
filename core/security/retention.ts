export interface RetentionRule{dataType:string;days:number;reason:string}
export const retentionRules:RetentionRule[]=[
{dataType:"audit",days:3650,reason:"Accountability and security"},
{dataType:"lead-research",days:365,reason:"Company history and deduplication"},
{dataType:"message-body",days:180,reason:"Operational need"},
{dataType:"temporary-job-data",days:30,reason:"Minimize retained data"}
];