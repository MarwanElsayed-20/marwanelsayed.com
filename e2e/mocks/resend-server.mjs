import { createServer } from "node:http";

// A stand-in for the Resend API used only by the end-to-end suite. It records the last email it
// was asked to send so tests can verify exactly what the contact route delivered.
let last = null;
let count = 0;

createServer((request, response) => {
  const send = (status, body) => {
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(body));
  };
  if (request.method === "GET" && request.url === "/_health") return send(200, { ok: true });
  if (request.method === "GET" && request.url === "/_last") return send(200, { count, last });
  if (request.method === "DELETE" && request.url === "/_last") {
    last = null;
    count = 0;
    return send(200, { ok: true });
  }
  if (request.method === "POST" && request.url === "/emails") {
    let raw = "";
    request.on("data", (chunk) => (raw += chunk));
    request.on("end", () => {
      const payload = JSON.parse(raw);
      count += 1;
      last = { authorization: request.headers.authorization, payload };
      // A message containing this marker simulates the provider rejecting the email.
      if (String(payload.text).includes("FAIL_DELIVERY")) return send(500, { message: "rejected" });
      send(200, { id: `mock-${count}` });
    });
    return;
  }
  send(404, { error: "not found" });
}).listen(3999, "127.0.0.1");
