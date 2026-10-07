import React from 'react';
import { BookOpen } from 'lucide-react';

function Docs() {
  return (
    <div className="glass-panel" style={{padding: '40px', maxWidth: '800px', margin: '0 auto'}}>
      <h1 style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px'}}>
        <BookOpen color="var(--primary)" /> API Documentation
      </h1>
      
      <h2 style={{marginBottom: '15px'}}>1. Edge Inference (Vision)</h2>
      <p style={{color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.6'}}>
        The system captures hardware video streams using OpenCV and pipes the frames into the Ultralytics YOLOv8 network. 
        Object bounding boxes and class IDs are extracted to formulate telemetry metadata.
      </p>

      <h2 style={{marginBottom: '15px'}}>2. Retrieval-Augmented Generation (RAG)</h2>
      <p style={{color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.6'}}>
        Security logs are embedded using HuggingFace sentence-transformers (`all-MiniLM-L6-v2`) and stored in a persistent ChromaDB vector space. 
        When a user submits a query, LangChain performs semantic search to retrieve the Top-K relevant events, which are injected into Meta's Llama 3.2 LLM for context-aware answering.
      </p>
    </div>
  );
}

export default Docs;
