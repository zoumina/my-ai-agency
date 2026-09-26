async function refresh(){const r=await fetch("/health");const d=await r.json();document.querySelector("#system").textContent=d.status;document.querySelector("#autonomy").textContent=d.autonomousExecutionEnabled?"Enabled":"Disabled"}
async function stopAgency(){await fetch("/control/emergency-stop",{method:"POST"});await refresh()}
async function resumeAgency(){await fetch("/control/resume",{method:"POST"});await refresh()}
refresh().catch(()=>{document.querySelector("#system").textContent="Unavailable"});
async function loadApprovals(){const r=await fetch("/approvals");const items=await r.json();document.querySelector("#approvals").innerHTML=items.length?items.map(x=>`<div><strong>${x.action}</strong> — ${x.status}</div>`).join(""):"None"}
setInterval(()=>{refresh().catch(()=>{});loadApprovals().catch(()=>{})},10000);loadApprovals().catch(()=>{});
