import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.setHeader("content-type", "application/json");
  if (req.url === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", service: "ai-agency-api" }));
    return;
  }
  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`API listening on :${port}`));