# VivaBuddy

Practice a university viva with an Ollama-powered AI examiner. Upload a study PDF, choose a subject and difficulty, answer five questions, and get adaptive follow-ups plus a final report.

VivaBuddy is being built for the Hacktoberfest **Build for a Friend** challenge. The goal is to solve a real classmate's viva-preparation problem and include their feedback in the submission.

## Run locally

Requirements: Node.js 20.9 or later and [Ollama](https://ollama.com/download).

```bash
ollama pull qwen2.5-coder:7b
npm ci
npm run dev
```

Open <http://localhost:3000> and keep Ollama running. By default, the app connects to `http://127.0.0.1:11434` and uses `qwen2.5-coder:7b`. Override `OLLAMA_HOST` and `OLLAMA_MODEL` in `.env.local` to use another Ollama service or installed model.

## Deploy on one server

VivaBuddy needs a persistent Node.js server and a reachable Ollama service. A static export cannot run its APIs, and serverless hosting is a poor fit for model inference: calls can take a while and the model needs persistent compute and storage. The included Compose setup runs the Next.js app, Ollama, and Caddy on one Docker host. Ollama is only reachable inside the Compose network; Caddy provides HTTPS, a 14 MB request-body limit, and password protection for the whole app.

The default Qwen2.5-Coder 7B model download is about 4.7 GB. That is just the model artifact size; inference also needs memory, and CPU-only hosts may respond slowly. Choose a server with enough RAM or compatible GPU resources for Ollama. [Ollama model details](https://ollama.com/library/qwen2.5-coder).

## Deploy the app on Vercel

Vercel hosts the Next.js app, while inference runs through Ollama. You can use Ollama's hosted Cloud API or run Ollama on a separate machine. Do not point `OLLAMA_HOST` at `localhost` or expose an unauthenticated Ollama port to the public internet.

In Vercel Project Settings → Environment Variables, set:

| Variable | Value |
| --- | --- |
| `OLLAMA_HOST` | `https://ollama.com` for Ollama Cloud, or the base URL of your protected Ollama reverse proxy (no `/api` suffix) |
| `OLLAMA_MODEL` | Exact model tag available to that API. For Ollama Cloud, choose one returned by its model list; the local default `qwen2.5-coder:7b` may not be available there. |
| `OLLAMA_API_KEY` | Ollama Cloud key from [ollama.com/settings/keys](https://ollama.com/settings/keys), or the Bearer token expected by your protected proxy |

Redeploy after setting the variables. Vercel Functions have a 4.5 MB request-body limit, so this app caps PDFs at 4 MB to leave room for multipart overhead. Use text-based PDFs under that size. [Vercel Function limits](https://vercel.com/docs/functions/limitations)

PDFs and extracted text pass through Vercel Functions, and extracted text and answers are sent to the configured Ollama service. With Ollama Cloud, inference happens on Ollama's service, not on the student's device. AI calls can time out if Ollama is slow or unreachable; Vercel documents a 120-second proxied request timeout. [Vercel limits](https://vercel.com/docs/limits)

### One-time setup

1. Use a Linux server with Docker Engine and the Docker Compose plugin. Point a domain's DNS A/AAAA record at the server and allow inbound TCP ports 80 and 443 (plus UDP 443 for HTTP/3).
2. Copy the deployment environment template and set the domain and username:

   ```bash
   cp deploy/.env.deploy.example deploy/.env.deploy
   ```

3. Create a bcrypt password hash with the Caddy container:

   ```bash
   docker run --rm caddy:2 caddy hash-password --plaintext 'choose-a-long-password'
   ```

4. Copy `deploy/Caddyfile.example` to `deploy/Caddyfile` and replace `REPLACE_WITH_BCRYPT_HASH` with the generated hash. Keep both deployment files out of version control.

The Compose file uses `qwen2.5-coder:7b`. To use a different model, update `OLLAMA_MODEL` in `compose.yaml` and pull the same model name from the Ollama container.

### Start and update

```bash
docker compose up --build -d
docker compose exec ollama ollama pull qwen2.5-coder:7b
```

Wait for the model download to finish, then open `https://<your-domain>`. Caddy obtains and renews the TLS certificate. To publish a code update, pull it on the server and run `docker compose up --build -d app`; the Ollama model and Caddy certificates persist in Docker volumes.

Useful operations:

```bash
docker compose logs -f app caddy ollama
docker compose exec ollama ollama list
docker compose down
```

`docker compose down` keeps model and certificate volumes. `docker compose down -v` deletes those volumes, including the downloaded model and TLS state.

## Privacy and session handling

- The PDF is uploaded to the VivaBuddy server for text extraction. Extracted text is sent to the configured Ollama service for question generation, answer evaluation, and the report.
- In the supplied Compose deployment, Ollama runs on the same server and is not published as a public port. The server operator can access uploaded material during processing; this is not private inference on the student's device.
- The app does not save sessions to a database. Session material and answers are held in the current browser tab's session storage and sent to the server for each AI request. Closing the tab clears that browser session.
- The MVP accepts one text-based PDF up to 4 MB and sends up to 80,000 extracted characters to the model. Scanned image PDFs are not supported.
- The included Caddy setup protects the public app with one shared Basic Auth credential. Share that password only with the intended friend. This is a demo access gate, not per-user authentication or a multi-user security system.

## API

- `POST /api/documents` — validate and extract PDF text.
- `POST /api/viva/start` — generate a grounded question.
- `POST /api/viva/answer` — evaluate an answer and suggest an adaptive follow-up.
- `POST /api/viva/evaluate` — summarize session answers into a report.
- `GET /api/health` — check configured Ollama connectivity and model availability.

## Build for a Friend checklist

- [ ] Try the full flow with the friend this was built for.
- [ ] Record their feedback and what changed as a result.
- [ ] Capture a short demo and add screenshots.
- [ ] Write the Hacktoberfest submission around the problem, build, and feedback story.

## MVP scope

One PDF per session, five questions, local/self-hosted Ollama inference, and browser-tab session state. Authentication accounts, cloud storage, voice, RAG, and long-term progress tracking are out of scope.
