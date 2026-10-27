# BrizAi health dashboard prototype

BrizAi is a React and Vite prototype for recording wellness information and experimenting with AI-generated summaries. It includes dashboards and forms for activity, sleep, water, nutrition, and tasks, plus a chat interface that can route requests to Gemini or an Ollama endpoint.

**This is an experimental project, not a validated medical or security product. Do not use real health data, live API keys, or Google Fit tokens with the current implementation until the issues below have been addressed and independently tested.**

## What the code does

- Stores profile settings, daily logs, tasks and chat history in browser `localStorage`.
- Calculates a dashboard score from hydration, sleep duration, steps and the number of logged meals. It uses fixed rules in [`Dashboard.jsx`](src/components/Dashboard/Dashboard.jsx); meal count is not a measurement of nutritional quality. The score has not been validated as a health measure and should not guide medical decisions.
- Builds prompts from user-entered logs and calls either Gemini through `@google/generative-ai` or a configured Ollama HTTP endpoint. Model-generated text can be inaccurate, and the repository does not establish access to medical databases or validated clinical guidance.
- Contains a Google Fit authorization and data-fetching implementation, with a Vite development-server proxy and code to map returned data into logs. End-to-end OAuth, syncing, token expiry and production deployment have not been verified for this documentation update. Google says new developers have not been able to sign up for the Fit APIs since May 2024, and the APIs are being deprecated in 2026; consult the [Google Fit platform overview](https://developers.google.com/fit/overview) before attempting an integration.

## Known privacy and security issues

- The profile, including the Gemini API key and Google Fit client ID, is stored in `localStorage`; the Fit access token is also stored there. Browser storage is accessible to JavaScript running in the same origin and is not a protected credential vault.
- The fitness, sleep, nutrition and water analysis functions pass the full profile into a JSON-formatted model prompt. Since that profile can contain the Gemini API key and Fit client ID, these values can be sent as prompt content to the selected AI endpoint. Do not use these analysis functions with credentials until this is fixed and verified.
- The current sync code logs a prefix of the Fit access token and health-related responses to the developer console. Avoid using real tokens and data. Remove sensitive logging and review error handling before any deployment.
- Gemini requests send the supplied prompt and context to Google's service. An Ollama URL is configurable and may point to a remote service. Local browser storage alone is not evidence that data never leaves the device.

## Project structure

- [`src/components/Dashboard/Dashboard.jsx`](src/components/Dashboard/Dashboard.jsx): dashboard, score and Fit sync flow.
- [`src/components/Features/`](src/components/Features/): activity, sleep, water, nutrition, calendar, settings and chat interfaces.
- [`src/context/AppContext.jsx`](src/context/AppContext.jsx): application state and browser persistence.
- [`src/services/aiService.js`](src/services/aiService.js): model-provider routing and prompt construction.
- [`src/services/googleFitService.js`](src/services/googleFitService.js): Fit authorization and data requests.
- [`vite.config.js`](vite.config.js): development server and Fit proxy configuration.

## Development setup

The repository contains a package lock file and uses React 19 and Vite 7. Vite 7 requires Node.js 20.19+ or 22.12+; see the [Vite 7 guide](https://v7.vite.dev/guide/). The following commands are inferred from the checked-in scripts and have not been verified end to end in this documentation update:

```bash
git clone https://github.com/D3vil-coder/BrizAi-Health-Analytics.git
cd BrizAi-Health-Analytics
npm ci
npm run dev
```

`npm run build` and `npm run lint` are also defined in `package.json`. The Google Fit proxy is configured under Vite's development server; a production deployment needs its own carefully reviewed integration. The repository does not currently contain a `LICENSE` file.

## Status

This repository documents a personal software experiment. Its calculations, data handling, provider integrations, accessibility and security need independent testing and review before any real-world use.

