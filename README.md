# VivaBuddy

**Practice explaining what you know before the real conversation.** VivaBuddy turns a study PDF or resume into an interactive practice session, asks follow-up questions grounded in that material, and gives you a final report with feedback.

VivaBuddy was built for a friends who wanted a better way to prepare for viva and interview questions. It is an MVP, focused on one uploaded document and one practice session at a time.

## What it does

- Upload a text-based PDF, such as study notes or a resume, and choose a subject and difficulty.
- Practice a five-question session grounded in the uploaded material.
- Get adaptive follow-up questions as you answer.
- Review a final report with feedback on your answers.
- Run inference with a local Ollama model or a configured Ollama service.

## Built for a friend

A friend tested VivaBuddy with his resume. He liked that the questions came from the PDF he uploaded and asked about specific projects, including what his role had been on a particular project. That feedback confirmed the value of grounding practice questions in the person's own material instead of asking only generic questions.

## Why open-source AI matters here

Document-grounded questions are the core of VivaBuddy, so the model should be something people can run and change for themselves. VivaBuddy uses Ollama with an open-weight model by default. When the app and Ollama both run locally, a student can practice with their notes or resume without sending them to a hosted AI provider. They can choose another compatible model or host as their needs change. Hosted deployments are also supported, but their data-handling and privacy depend on the selected app host and model service.

For the Hacktoberfest **Build for a Friend** submission, the useful story is the real problem, the friend's resume-based test and feedback, and why local, replaceable AI makes this practice experience more accessible and under the student's control. Saving an agent session with DevRelay is optional; it can be linked or embedded as extra process evidence, but it is not required to use or deploy VivaBuddy.

### Model choices

During development, I used **Qwen2.5-Coder 7B** with local Ollama for coding, debugging, and iteration. It let me work with a model on my own machine. For deployed practice sessions, I chose **Gemma 4 31B** because its general reasoning capabilities are a better fit for creating questions from a student's notes or resume. Using Ollama for both keeps model selection configurable, so the app can use a local model during development and a hosted model for production without tying its integration to one model provider.

## Run locally

You need [Node.js 20.9+](https://nodejs.org/) and [Ollama](https://ollama.com/download).

1. Install and start Ollama, then download a model:

   ```bash
   ollama pull qwen2.5-coder:7b
   ```

2. Install dependencies and start VivaBuddy:

   ```bash
   npm ci
   npm run dev
   ```

3. Open <http://localhost:3000>.

By default, the app connects to `http://127.0.0.1:11434` and uses `qwen2.5-coder:7b`. To use another Ollama host or model, set `OLLAMA_HOST` and `OLLAMA_MODEL` in `.env.local`. Set `OLLAMA_API_KEY` if that service requires a Bearer token. Never commit real API keys.

## Deployment

### Vercel with Ollama Cloud

Vercel can host the Next.js app while Ollama Cloud handles model inference. In your Vercel project settings, add these environment variables:

| Variable | Value |
| --- | --- |
| `OLLAMA_HOST` | `https://ollama.com` |
| `OLLAMA_MODEL` | A model tag available to your Ollama Cloud account, such as `gemma4:31b-cloud` if it is listed for your account |
| `OLLAMA_API_KEY` | A key created in [Ollama settings](https://ollama.com/settings/keys) |

Use a model available to your Ollama Cloud account; the local default `qwen2.5-coder:7b` may not be available there. Add the variables to the environments you plan to deploy to, then redeploy. Do not use `localhost` as the host on Vercel.

Vercel Functions have a 4.5 MB request-body limit, so uploads are capped at 4 MB to leave room for multipart form data. Use text-based PDFs under that limit. PDFs pass through Vercel for text extraction, and the extracted text and answers are sent to the configured Ollama service. AI requests can take time; see [Vercel Function limits](https://vercel.com/docs/functions/limitations) and [Ollama Cloud](https://ollama.com/cloud).

### Self-host with Docker Compose

The included Compose setup runs the app, Ollama, and Caddy on one Linux server. Caddy provides HTTPS and password protection; Ollama is only available inside the private Compose network. You need Docker Engine, the Docker Compose plugin, a domain pointed at your server, and inbound TCP ports 80 and 443 open (plus UDP 443 for HTTP/3).

1. Create the deployment environment file:

   ```bash
   cp deploy/.env.deploy.example deploy/.env.deploy
   ```

   Set the domain and username in `deploy/.env.deploy`.

2. Generate a password hash:

   ```bash
   docker run --rm caddy:2 caddy hash-password --plaintext 'choose-a-long-password'
   ```

3. Copy `deploy/Caddyfile.example` to `deploy/Caddyfile` and replace `REPLACE_WITH_BCRYPT_HASH` with the generated hash. Keep the deployment files private; they are excluded from version control.

4. Start the services and download the model:

   ```bash
   docker compose up --build -d
   docker compose exec ollama ollama pull qwen2.5-coder:7b
   ```

When the model download finishes, visit `https://<your-domain>`. To deploy a code update, pull the latest code on the server and run `docker compose up --build -d app`.

Useful commands:

```bash
docker compose logs -f app caddy ollama
docker compose exec ollama ollama list
docker compose down
```

`docker compose down` keeps the model and certificate volumes. `docker compose down -v` removes them. The default Qwen2.5-Coder 7B model download is about 4.7 GB and inference needs additional memory; choose a server with sufficient RAM or compatible GPU resources. See [Ollama model details](https://ollama.com/library/qwen2.5-coder).

## Privacy and limits

- The PDF is uploaded to the VivaBuddy server for text extraction. Extracted text is sent to the configured Ollama service to generate questions, evaluate answers, and prepare the report.
- With Ollama Cloud, model inference happens on Ollama's service. With the supplied Docker Compose setup, Ollama runs on the same server and is not exposed as a public port.
- VivaBuddy does not save sessions in a database. Session details are held in the current browser tab's session storage and sent to the server for AI requests. Closing the tab clears that browser session.
- The MVP accepts one text-based PDF up to 4 MB and sends up to 80,000 extracted characters to the model. Scanned image PDFs are not supported.
- The self-hosted Caddy configuration uses one shared password for app access. It is a simple demo access gate, not individual user accounts.

## API

- `POST /api/documents` — validate a PDF and extract its text.
- `POST /api/viva/start` — generate a question grounded in the document.
- `POST /api/viva/answer` — evaluate an answer and suggest an adaptive follow-up.
- `POST /api/viva/evaluate` — create a summary report for the session.
- `GET /api/health` — check Ollama connectivity and model availability.

## Project status

The core practice flow, PDF upload, adaptive questions, evaluation report, local Ollama support, and deployment configuration are implemented. A friend has tried the app with his resume and confirmed that document-specific project questions are useful. VivaBuddy remains an early MVP, focused on one document per session.

## Out of scope for this MVP

User accounts, cloud session storage, voice practice, retrieval-augmented generation, and long-term progress tracking.
