import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import mammoth from "mammoth";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import {
  initDB,
  vectorStore,
  llm,
} from "./services/rag";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Upload + Index Documents
|--------------------------------------------------------------------------
*/

app.post(
  "/api/upload",
  upload.single("file"),
  async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Attach a document file",
        });
      }

      let textContent = "";

      // Handle .docx
      if (
        req.file.originalname
          .toLowerCase()
          .endsWith(".docx")
      ) {
        const result =
          await mammoth.extractRawText({
            buffer: req.file.buffer,
          });

        textContent = result.value;
      }

      // Handle text files
      else {
        textContent =
          req.file.buffer.toString(
            "utf-8"
          );
      }

      if (!textContent.trim()) {
        return res.status(400).json({
          error:
            "Document contains no readable text",
        });
      }

      const splitter =
        new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 150,
        });

      const docs =
        await splitter.createDocuments([
          textContent,
        ]);

      console.log(
        `Processing ${docs.length} chunks...`
      );

      await vectorStore.addDocuments(
        docs
      );

      console.log(
        "Vector indexing complete"
      );

      return res.json({
        message:
          "Document ingestion successful",
        chunks: docs.length,
      });
    } catch (error: any) {
      console.error(
        "Upload error:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Query RAG
|--------------------------------------------------------------------------
*/

app.post(
  "/api/query",
  async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { question } =
        req.body;

      if (!question) {
        return res.status(400).json({
          error:
            "Question is required",
        });
      }

      const retriever =
        vectorStore.asRetriever({
          k: 4,
        });

      const contextDocs =
        await retriever.invoke(
          question
        );

      const context =
        contextDocs
          .map(
            (d) => d.pageContent
          )
          .join("\n\n");

      const prompt = `
Context:
${context}

Question:
${question}

Answer ONLY using the supplied context.
If context is insufficient, say so.
`;

      const response =
        await llm.invoke(prompt);

      return res.json({
        answer:
          response.content,
      });
    } catch (error: any) {
      console.error(
        "Query error:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

async function startServer() {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(
        `Backend alive on port ${PORT}`
      );
    });
  } catch (err) {
    console.error(
      "Startup failed:",
      err
    );

    process.exit(1);
  }
}

startServer();

/*
import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { initDB, vectorStore, llm } from './services/rag';
import mammoth from "mammoth";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

async function startServer() {
  await initDB();

  app.listen(PORT, () => {
    console.log(`Backend alive on ${PORT}`);
  });
}
startServer();

// Ingest Documents
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) return res.status(400).json({ error: "Please attach a document file." });

    const textContent = req.file.buffer.toString('utf-8');
    
    // Split texts to avoid hitting LLM token ceilings
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
    const docs = await splitter.createDocuments([textContent]);

    await vectorStore.addDocuments(docs);
    return res.json({ message: "Document ingestion complete. Vector spaces indexed successfully." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Query RAG Context
app.post('/api/query', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    const retriever = vectorStore.asRetriever({ k: 4 });
    const contextDocs = await retriever.invoke(question);
    
    const contextStr = contextDocs.map(d => d.pageContent).join("\n\n");
    const formattedPrompt = `Context:\n${contextStr}\n\nQuestion: ${question}\n\nProvide an accurate, concise answer based strictly on the context above:`;
    
    const aiResponse = await llm.invoke(formattedPrompt);
    res.json({ answer: aiResponse.content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend Engine alive on port ${PORT}`));

*/