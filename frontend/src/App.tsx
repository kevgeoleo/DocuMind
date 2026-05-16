import React, { useState } from 'react';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3000/api';

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploadStatus('Processing document chunks...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      setUploadStatus(data.message || data.error);
    } catch {
      setUploadStatus('Upload operation failed.');
    }
  };

  const handleQuery = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('Searching local vectors & generating response...');

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer || data.error);
    } catch {
      setAnswer('Inference connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'system-ui' }}>
      <h2>🧠 DocuMind RAG System</h2>
      
      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
        <h4>1. Document Knowledge Source</h4>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={(e) => e.target.files && setFile(e.target.files[0])} required />
          <button type="submit" style={{ background: '#0070f3', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>Upload</button>
        </form>
        {uploadStatus && <p style={{ fontSize: '13px', color: '#555' }}>{uploadStatus}</p>}
      </div>

      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', borderRadius: '6px' }}>
        <h4>2. Run Vector Query</h4>
        <input style={{ width: '100%', padding: '8px', marginBottom: '10px' }} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask anything about the document..." />
        <button onClick={handleQuery} disabled={loading} style={{ background: '#000', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px' }}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
        <h5>Engine Output:</h5>
        <div style={{ background: '#f4f4f4', padding: '12px', minHeight: '40px', borderRadius: '4px', fontSize: '14px' }}>{answer}</div>
      </div>
    </div>
  );
}