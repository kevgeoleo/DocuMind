// services/rag.ts
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";

const client = new MongoClient(process.env.MONGO_URI!);

export async function initDB() {
  await client.connect();
  console.log("MongoDB connected");
}

const db = client.db("documind");
const collection = db.collection("embeddings");

const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  },
  modelName: "text-embedding-3-small",
});

export const vectorStore =
  new MongoDBAtlasVectorSearch(embeddings, {
    collection,
    indexName: "vector_index",
    textKey: "text",
    embeddingKey: "embedding",
  });

export const llm = new ChatOpenAI({
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  },
  modelName: "deepseek/deepseek-v4-flash:free",
});
/*
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";

const client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017");
const db = client.db("documind");
const collection = db.collection("embeddings");

// Initialize OpenRouter-compatible Embeddings
const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  },
  modelName: "text-embedding-3-small",
});

// Configure MongoDB Vector Engine
export const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection: collection,
  indexName: "vector_index", 
  textKey: "text",
  embeddingKey: "embedding",
});

// Initialize DeepSeek via OpenRouter
export const llm = new ChatOpenAI({
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "DocuMind Local RAG",
    }
  },
  modelName: "deepseek/deepseek-v4-flash:free",
  temperature: 0.3,
});
*/