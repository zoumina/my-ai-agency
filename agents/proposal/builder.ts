export type ProposalLevel="essential"|"professional"|"premium";
export function chooseProposalLevel(v:number):ProposalLevel{return v>=8000?"premium":v>=3000?"professional":"essential"}
export function buildProposal(company:string,service:string,price:number,level:ProposalLevel){return{company,service,price,currency:"EUR",level,validityDays:14};}