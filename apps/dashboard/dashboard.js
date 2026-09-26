async function refresh(){const r=await fetch("/health");const d=await r.json();document.querySelector("#system").textContent=d.status;document.querySelector("#autonomy").textContent=d.autonomousExecutionEnabled?"Enabled":"Disabled"}
async function stopAgency(){await fetch("/control/emergency-stop",{method:"POST"});await refresh()}
async function resumeAgency(){await fetch("/control/resume",{method:"POST"});await refresh()}
refresh().catch(()=>{document.querySelector("#system").textContent="Unavailable"});