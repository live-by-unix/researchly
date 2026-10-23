import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Download,
  Filter,
  SortAsc,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import type { ResearchResponse, Source } from '@shared/types';

interface ResultsPageProps {
  result: ResearchResponse;
}

export default function ResultsPage({ result }: ResultsPageProps) {
  const navigate = useNavigate();
  const [filterDomain, setFilterDomain] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'domain'>('relevance');
  const [savedResearch, setSavedResearch] = useState<ResearchResponse[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('researchly-saved');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedResearch(parsed);
      setIsSaved(parsed.some((r: ResearchResponse) => r.id === result.id));
    }
  }, [result.id]);

  const uniqueDomains = Array.from(new Set(result.sources.map((s) => s.domain)));

  const filteredSources = result.sources.filter((source: Source) =>
    filterDomain ? source.domain === filterDomain : true
  );

  const sortedSources = [...filteredSources].sort((a, b) => {
    if (sortBy === 'domain') {
      return a.domain.localeCompare(b.domain);
    }
    // For relevance, we could add a relevance score field
    // For now, keep original order
    return 0;
  });

  const handleSave = () => {
    if (isSaved) {
      const updated = savedResearch.filter((r) => r.id !== result.id);
      setSavedResearch(updated);
      localStorage.setItem('researchly-saved', JSON.stringify(updated));
      setIsSaved(false);
    } else {
      const updated = [...savedResearch, result];
      setSavedResearch(updated);
      localStorage.setItem('researchly-saved', JSON.stringify(updated));
      setIsSaved(true);
    }
  };

  const handleExportMarkdown = () => {
    const markdown = generateMarkdown(result);
    downloadFile(markdown, `research-${result.id}.md`, 'text/markdown');
  };

  const handleExportJson = () => {
    const json = JSON.stringify(result, null, 2);
    downloadFile(json, `research-${result.id}.json`, 'application/json');
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const handleNewResearch = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNewResearch}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                  {result.topic}
                </h1>
                <p className="text-sm text-gray-500">
                  {result.totalSources} source{result.totalSources !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isSaved ? 'Remove from saved' : 'Save research'}
              >
                {isSaved ? (
                  <Trash2 className="w-5 h-5 text-gray-600" />
                ) : (
                  <Save className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={handleExportMarkdown}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export as Markdown"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleExportJson}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export as JSON"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Domains</option>
              {uniqueDomains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'domain')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="relevance">Relevance</option>
              <option value="domain">Domain</option>
            </select>
          </div>
          {filterDomain && (
            <button
              onClick={() => setFilterDomain('')}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              <span>Clear filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {sortedSources.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No sources match your filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedSources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                isExpanded={expandedSource === source.id}
                onToggle={() =>
                  setExpandedSource(expandedSource === source.id ? null : source.id)
                }
                onCopyLink={handleCopyLink}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SourceCardProps {
  source: Source;
  isExpanded: boolean;
  onToggle: () => void;
  onCopyLink: (url: string) => void;
}

function SourceCard({ source, isExpanded, onToggle, onCopyLink }: SourceCardProps) {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{source.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="truncate">{source.domain}</span>
            <span>•</span>
            <span>{new Date(source.extractedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </a>
          <button
            onClick={() => onCopyLink(source.url)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy link"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isExpanded ? 'Show less' : 'Show more'}
          >
            {isExpanded ? (
              <X className="w-4 h-4 text-gray-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 mb-3">{source.summary}</p>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {source.keyPoints.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {source.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Relevance</h4>
              <p className="text-gray-700">{source.relevance}</p>
            </div>

            {source.sourceLimitations && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 text-amber-500" />
                  Limitations
                </h4>
                <p className="text-gray-700">{source.sourceLimitations}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function generateMarkdown(result: ResearchResponse): string {
  let md = `# Research: ${result.topic}\n\n`;
  md += `Generated on: ${new Date(result.completedAt).toLocaleString()}\n`;
  md += `Total sources: ${result.totalSources}\n\n`;
  md += `---\n\n`;

  result.sources.forEach((source, idx) => {
    md += `## ${idx + 1}. ${source.title}\n\n`;
    md += `**Source:** [${source.url}](${source.url})\n\n`;
    md += `**Domain:** ${source.domain}\n\n`;
    md += `### Summary\n\n${source.summary}\n\n`;

    if (source.keyPoints.length > 0) {
      md += `### Key Points\n\n`;
      source.keyPoints.forEach((point) => {
        md += `- ${point}\n`;
      });
      md += '\n';
    }

    md += `### Relevance\n\n${source.relevance}\n\n`;

    if (source.sourceLimitations) {
      md += `### Limitations\n\n${source.sourceLimitations}\n\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
