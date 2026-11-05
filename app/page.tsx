'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setDownloadUrl(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao processar o arquivo.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setFileName(`convertido_${file.name.replace(/\.[^/.]+$/, '')}.txt`);
    } catch (err) {
      alert('Ocorreu um erro ao converter o arquivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-yellow-400">Conversor Goodyear</h1>
        <p className="text-sm text-gray-400 mb-6">
          Ajuste automático para o layout exigido pelo portal (Separador `;`, decimal com `.`, cabeçalho minúsculo e sem linhas vazias).
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-yellow-400 transition cursor-pointer">
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-bold rounded-xl transition duration-200"
          >
            {loading ? 'Convertendo...' : 'Converter Arquivo'}
          </button>
        </form>

        {downloadUrl && (
          <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-green-500/30 text-center animate-fade-in">
            <p className="text-green-400 text-sm font-medium mb-3">Arquivo convertido com sucesso!</p>
            <a
              href={downloadUrl}
              download={fileName}
              className="inline-block w-full py-2.5 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition"
            >
              Baixar Arquivo Corrigido
            </a>
          </div>
        )}
      </div>
    </main>
  );
}