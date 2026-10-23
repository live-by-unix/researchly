import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ResultsPage from './pages/ResultsPage';
import type { ResearchResponse } from '@shared/types';

function App() {
  const [researchResult, setResearchResult] = useState<ResearchResponse | null>(null);

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route
            path="/"
            element={<LandingPage onResearchComplete={setResearchResult} />}
          />
          <Route
            path="/results"
            element={
              researchResult ? (
                <ResultsPage result={researchResult} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
