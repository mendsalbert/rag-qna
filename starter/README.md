# RAG Q&A Starter

Hands-on starter for building a **Retrieval-Augmented Generation (RAG)** app.

Same folder structure as the full app at the repo root. **UI is complete** — you fill in the backend in four steps while recording.



## Quick start (recording)

```bash
cd starter
npm install
cp .env.example .env
# Add POSTGRES_URL and GOOGLE_API_KEY
npm run init-db
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The UI loads immediately. Ingest and chat show helpful errors until you complete the TODOs.

---

## Same structure as root

```
starter/
├── app/
│   ├── page.tsx                 # Complete UI
│   └── api/
│       ├── chat/route.ts        # TODO Step 4
│       ├── learn/route.ts       # TODO Step 3
│       ├── learn/upload/        # TODO Step 3
│       ├── stats/               # Complete
│       ├── health/              # Complete
│       └── corpus/              # Complete
├── components/                  # Complete
├── lib/
│   ├── vectorStore.ts           # TODO Step 1
│   ├── rag.ts                   # TODO Step 2
│   └── ...                      # Complete utilities
├── scripts/
│   ├── init-db.ts
│   ├── seed.ts
│   └── solution-restore.ts
└── .solution/                   # Full answer key for the TODO files
```

| File | Status |
|------|--------|
| `app/page.tsx` + `components/*` | Complete |
| `app/api/stats`, `health`, `corpus` | Complete |
| `lib/chunker.ts`, `env.ts`, `llm.ts`, `db.ts`, etc. | Complete |
| `lib/vectorStore.ts` | **TODO — Step 1** |
| `lib/rag.ts` | **TODO — Step 2** |
| `app/api/learn/route.ts` + upload | **TODO — Step 3** |
| `app/api/chat/route.ts` | **TODO — Step 4** |

---

## Setup

### Neon Postgres

1. Create a project at [console.neon.tech](https://console.neon.tech)
2. Copy the connection string into `.env` as `POSTGRES_URL`
3. Run `npm run init-db`

### Gemini API key

1. Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Add to `.env` as `GOOGLE_API_KEY`

---

## TODO checklist (fill these in on camera)

### Step 1 — `lib/vectorStore.ts`

Implement `createEmbeddingsClient()` and `loadVectorStore()` with `GoogleGenerativeAIEmbeddings` + `NeonPostgres.initialize`.

**Test:** `npm run seed`

### Step 2 — `lib/rag.ts`

Implement `createRagChain()` with retriever + `createStuffDocumentsChain` + `createRetrievalChain`.

### Step 3 — `app/api/learn/route.ts` + upload route

Uncomment: `await vectorStore.addDocuments(documents)`

**Test:** Paste text → **Save & index** → chunk count increases

### Step 4 — `app/api/chat/route.ts`

Uncomment the RAG streaming block (see hints in file or `.solution/app/api/chat/route.ts`).

**Test:** Ask a question → streamed grounded answer

---

## Peek at / restore the solution

Answer key lives in `.solution/` (same paths as the TODO files).

```bash
npm run solution:restore
```

Copies the complete implementations from `.solution/` into the working tree.
