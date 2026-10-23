import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Globe, CheckCircle } from 'lucide-react';
import { submitResearch } from '../lib/api';
import type { ResearchResponse } from '@shared/types';

interface LandingPageProps {
  onResearchComplete: (result: ResearchResponse) => void;
}

const EXAMPLE_TOPICS = [
  'Quantum computing applications',
  'Climate change mitigation strategies',
  'Artificial intelligence in healthcare',
  'Renewable energy storage solutions',
];

export default function LandingPage({ onResearchComplete }: LandingPageProps) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await submitResearch({ topic, maxSources: 10 });
      onResearchComplete(result);
      navigate('/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (exampleTopic: string) => {
    setTopic(exampleTopic);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-primary-600" />
            <h1 className="text-5xl font-bold text-gray-900 ml-3">Research.ly</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover, extract, and summarize relevant online sources with AI-powered research.
            Each source is grounded in real web content.
          </p>
        </header>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-16">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a research topic, question, or concept..."
                className="input-field pl-12 text-lg py-4 shadow-sm"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="btn-primary w-full text-lg py-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Researching...' : 'Start Research'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Example Topics */}
        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-sm text-gray-500 mb-3 text-center">Try an example:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_TOPICS.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-colors disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            How Research.ly Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Discover Sources</h3>
              <p className="text-gray-600 text-sm">
                Search the web to find relevant sources on your topic
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Extract Content</h3>
              <p className="text-gray-600 text-sm">
                Read and analyze the actual content from each source
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Summarize & Explain</h3>
              <p className="text-gray-600 text-sm">
                AI-powered summaries grounded in real source content
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
