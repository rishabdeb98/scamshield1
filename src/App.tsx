import { useCallback, useEffect, useState } from 'react';
import {
  analyzeMessageApi,
  analyzeUrlApi,
  clearHistoryApi,
  deleteHistoryItemApi,
  fetchAwarenessApi,
  fetchHistoryApi,
  fetchSamples,
  recordExampleExploredApi,
  recordQuizAttemptApi,
} from './api/scamshield';
import { AboutView } from './components/AboutView';
import { AnalyzerWorkspace } from './components/AnalyzerWorkspace';
import { DashboardView } from './components/DashboardView';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HistoryView } from './components/HistoryView';
import { HowItWorksView } from './components/HowItWorksView';
import { ResultsPanel } from './components/ResultsPanel';
import { SafetyCenterView } from './components/SafetyCenterView';
import { ScamLibraryView, type LibrarySubTab } from './components/ScamLibraryView';
import { SettingsView } from './components/SettingsView';
import { SCAM_LIBRARY_EXAMPLES } from './data/scamLibrary';
import type {
  ActiveView,
  AnalysisResult,
  AwarenessProgress,
  HistoryItem,
  LibraryTrialContext,
  MessageChannel,
  SampleMessage,
  ScamLibraryExample,
} from './types/scamshield';
import { applyTheme, getInitialTheme, type ThemeMode } from './utils/theme';

const EMPTY_AWARENESS: AwarenessProgress = {
  exploredExampleIds: [],
  exploredCategories: [],
  quizAttempts: 0,
  bestQuizScore: null,
  lastQuizScore: null,
};

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [messageText, setMessageText] = useState('');
  const [channel, setChannel] = useState<MessageChannel>('auto');
  const [urlInput, setUrlInput] = useState('');
  const [saveToHistory, setSaveToHistory] = useState(true);

  const [samples, setSamples] = useState<SampleMessage[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [awarenessProgress, setAwarenessProgress] = useState<AwarenessProgress>(EMPTY_AWARENESS);
  const [selectedLibraryExample, setSelectedLibraryExample] = useState<ScamLibraryExample | null>(
    null,
  );
  const [librarySubTab, setLibrarySubTab] = useState<LibrarySubTab>('browse');
  const [trialContext, setTrialContext] = useState<LibraryTrialContext | null>(null);

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isAnalyzingMessage, setIsAnalyzingMessage] = useState(false);
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    applyTheme(theme, false);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
      return next;
    });
  };

  const handleSetTheme = (next: ThemeMode) => {
    setTheme(next);
    applyTheme(next, true);
  };

  const refreshHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const items = await fetchHistoryApi();
      setHistoryItems(items);
    } catch {
      // Non-blocking on initial load
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const refreshAwareness = useCallback(async () => {
    try {
      const progress = await fetchAwarenessApi();
      setAwarenessProgress(progress);
    } catch {
      // Non-blocking on initial load
    }
  }, []);

  useEffect(() => {
    fetchSamples()
      .then(setSamples)
      .catch(() => {
        // Ignore silent sample load failure
      });
    void refreshHistory();
    void refreshAwareness();
  }, [refreshHistory, refreshAwareness]);

  const scrollToElement = (id: string) => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const prependResultToHistory = (result: AnalysisResult) => {
    if (!result.savedToHistory || !result.id) return;
    const newEntry: HistoryItem = {
      id: result.id,
      mode: result.mode,
      channel: result.channel ?? 'auto',
      redactedPreview: result.redactedPreview,
      score: result.score,
      classification: result.classification,
      summary: result.summary,
      indicatorCount: result.indicators.length,
      result,
      createdAt: result.analyzedAt,
    };
    setHistoryItems((prev) => [newEntry, ...prev.filter((item) => item.id !== newEntry.id)]);
  };

  const handleMessageTextChange = (value: string) => {
    setMessageText(value);
    if (trialContext) {
      setTrialContext(null);
    }
  };

  const handleAnalyzeMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) {
      setErrorMessage('Please paste or enter a message before clicking Analyse Message.');
      return;
    }

    setTrialContext(null);
    setErrorMessage(null);
    setIsAnalyzingMessage(true);
    try {
      const result = await analyzeMessageApi({
        message: trimmed,
        channel,
        saveToHistory,
      });
      setCurrentResult(result);
      if (saveToHistory) {
        prependResultToHistory(result);
      }
      scrollToElement('analysis-results');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to analyse message.');
    } finally {
      setIsAnalyzingMessage(false);
    }
  };

  const handleAnalyzeUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a URL before clicking Check URL.');
      return;
    }

    setTrialContext(null);
    setErrorMessage(null);
    setIsAnalyzingUrl(true);
    try {
      const result = await analyzeUrlApi({
        url: trimmed,
        saveToHistory,
      });
      setCurrentResult(result);
      if (saveToHistory) {
        prependResultToHistory(result);
      }
      scrollToElement('analysis-results');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to check URL.');
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  const handleQuickVerify = async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const looksLikeStandaloneUrl =
      !/\s/.test(trimmed) &&
      (/^(https?|hxxps?|javascript|vbscript|data|file):/i.test(trimmed) ||
        /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/.*)?$/i.test(trimmed));

    setTrialContext(null);
    setErrorMessage(null);

    if (looksLikeStandaloneUrl) {
      setUrlInput(trimmed);
      setActiveView('url-scanner');
      setIsAnalyzingUrl(true);
      try {
        const result = await analyzeUrlApi({ url: trimmed, saveToHistory });
        setCurrentResult(result);
        if (saveToHistory) {
          prependResultToHistory(result);
        }
        setTimeout(() => scrollToElement('analysis-results'), 60);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Unable to check URL.');
      } finally {
        setIsAnalyzingUrl(false);
      }
      return;
    }

    setMessageText(trimmed);
    setChannel('auto');
    setActiveView('message-scanner');
    setIsAnalyzingMessage(true);
    try {
      const result = await analyzeMessageApi({
        message: trimmed,
        channel: 'auto',
        saveToHistory,
      });
      setCurrentResult(result);
      if (saveToHistory) {
        prependResultToHistory(result);
      }
      setTimeout(() => scrollToElement('analysis-results'), 60);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to analyse message.');
    } finally {
      setIsAnalyzingMessage(false);
    }
  };

  const handleClearMessage = () => {
    setMessageText('');
    setChannel('auto');
    setTrialContext(null);
    setErrorMessage(null);
    if (currentResult?.mode === 'message') {
      setCurrentResult(null);
    }
  };

  const handleClearUrl = () => {
    setUrlInput('');
    setTrialContext(null);
    setErrorMessage(null);
    if (currentResult?.mode === 'url') {
      setCurrentResult(null);
    }
  };

  const handleSelectSample = (sample: SampleMessage) => {
    setMessageText(sample.content);
    setChannel(sample.channel);
    setTrialContext(null);
    setErrorMessage(null);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await deleteHistoryItemApi(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete history item.');
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await clearHistoryApi();
      setHistoryItems([]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to clear history.');
    }
  };

  const handleInspectHistoryResult = (result: AnalysisResult) => {
    setTrialContext(null);
    setCurrentResult(result);
    setActiveView(result.mode === 'url' ? 'url-scanner' : 'message-scanner');
    setTimeout(() => scrollToElement('analysis-results'), 50);
  };

  const handleNavigate = (view: ActiveView) => {
    setErrorMessage(null);
    setActiveView(view);
    if (view === 'history' || view === 'dashboard') {
      void refreshHistory();
    }
    if (view === 'dashboard' || view === 'scam-library') {
      void refreshAwareness();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'message-scanner') {
      setTimeout(() => document.getElementById('message-textarea')?.focus(), 60);
    } else if (view === 'url-scanner') {
      setTimeout(() => document.getElementById('url-input')?.focus(), 60);
    }
  };

  const handleOpenLibraryTab = (tab: LibrarySubTab) => {
    setSelectedLibraryExample(null);
    setLibrarySubTab(tab);
    handleNavigate('scam-library');
  };

  const handleOpenLibraryExample = (example: ScamLibraryExample) => {
    setSelectedLibraryExample(example);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    recordExampleExploredApi(example.id, example.category)
      .then(setAwarenessProgress)
      .catch(() => {
        // Non-blocking awareness update
      });
  };

  const handleExploreLibraryExampleById = (exampleId: string) => {
    const match = SCAM_LIBRARY_EXAMPLES.find((ex) => ex.id === exampleId);
    setLibrarySubTab('browse');
    setActiveView('scam-library');
    if (match) {
      handleOpenLibraryExample(match);
    } else {
      setSelectedLibraryExample(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuizComplete = (score: number) => {
    recordQuizAttemptApi(score)
      .then(setAwarenessProgress)
      .catch(() => {
        // Non-blocking awareness update
      });
  };

  const handleTryExample = async (example: ScamLibraryExample) => {
    setMessageText(example.sampleMessage);
    setChannel(example.channel);
    setTrialContext({
      exampleId: example.id,
      exampleTitle: example.title,
      expectedRisk: example.riskLevel,
    });
    setErrorMessage(null);
    setActiveView('message-scanner');
    setIsAnalyzingMessage(true);

    try {
      const result = await analyzeMessageApi({
        message: example.sampleMessage,
        channel: example.channel,
        saveToHistory,
      });
      setCurrentResult(result);
      if (saveToHistory) {
        prependResultToHistory(result);
      }
      setTimeout(() => scrollToElement('analysis-results'), 60);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to analyse example.');
    } finally {
      setIsAnalyzingMessage(false);
    }
  };

  const handleReturnToLibrary = () => {
    setErrorMessage(null);
    setActiveView('scam-library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewScan = () => {
    setErrorMessage(null);
    setTrialContext(null);
    setActiveView('message-scanner');
    setTimeout(() => {
      document.getElementById('message-textarea')?.focus();
      scrollToElement('analyzer');
    }, 50);
  };

  const isScannerView = activeView === 'message-scanner' || activeView === 'url-scanner';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-[#F8FAFC] transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onNewScan={handleNewScan}
        historyCount={historyItems.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pb-8 focus:outline-none"
      >
        {activeView === 'dashboard' && (
          <DashboardView
            historyItems={historyItems}
            isLoadingHistory={isLoadingHistory}
            awarenessProgress={awarenessProgress}
            isQuickVerifying={isAnalyzingMessage || isAnalyzingUrl}
            onQuickVerify={handleQuickVerify}
            onNavigate={handleNavigate}
            onOpenLibraryTab={handleOpenLibraryTab}
            onInspectResult={handleInspectHistoryResult}
          />
        )}

        {isScannerView && (
          <>
            <HeroSection />
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Scanner mode"
                className="inline-flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-[#111827] border border-transparent dark:border-[#273449] rounded-lg"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeView === 'message-scanner'}
                  onClick={() => handleNavigate('message-scanner')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeView === 'message-scanner'
                      ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Message Scanner
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeView === 'url-scanner'}
                  onClick={() => handleNavigate('url-scanner')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeView === 'url-scanner'
                      ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  URL Scanner
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {trialContext && (
                  <button
                    type="button"
                    onClick={handleReturnToLibrary}
                    className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap"
                  >
                    ← Return to Scam Library
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleNavigate('dashboard')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap"
                >
                  ← Back to Security Overview
                </button>
              </div>
            </div>

            <AnalyzerWorkspace
              focusMode={activeView === 'url-scanner' ? 'url' : 'message'}
              messageText={messageText}
              onMessageTextChange={handleMessageTextChange}
              channel={channel}
              onChannelChange={setChannel}
              urlInput={urlInput}
              onUrlInputChange={setUrlInput}
              saveToHistory={saveToHistory}
              onToggleSaveToHistory={setSaveToHistory}
              samples={samples}
              isAnalyzingMessage={isAnalyzingMessage}
              isAnalyzingUrl={isAnalyzingUrl}
              errorMessage={errorMessage}
              onAnalyzeMessage={handleAnalyzeMessage}
              onClearMessage={handleClearMessage}
              onAnalyzeUrl={handleAnalyzeUrl}
              onClearUrl={handleClearUrl}
              onSelectSample={handleSelectSample}
            />
            {currentResult && (
              <ResultsPanel
                result={currentResult}
                trialContext={currentResult.mode === 'message' ? trialContext : null}
                onReturnToLibrary={handleReturnToLibrary}
                onOpenSafetyCenter={() => handleNavigate('safety-center')}
              />
            )}
          </>
        )}

        {activeView === 'scam-library' && (
          <ScamLibraryView
            selectedExample={selectedLibraryExample}
            activeTab={librarySubTab}
            onChangeTab={setLibrarySubTab}
            onOpenExample={handleOpenLibraryExample}
            onCloseExample={() => setSelectedLibraryExample(null)}
            onTryExample={handleTryExample}
            onQuizComplete={handleQuizComplete}
            exploredExampleIds={awarenessProgress.exploredExampleIds}
          />
        )}

        {activeView === 'safety-center' && (
          <SafetyCenterView
            onExploreLibraryExample={handleExploreLibraryExampleById}
            onOpenScanner={() => handleNavigate('message-scanner')}
          />
        )}

        {activeView === 'history' && (
          <HistoryView
            items={historyItems}
            isLoading={isLoadingHistory}
            saveToHistory={saveToHistory}
            onToggleSaveToHistory={setSaveToHistory}
            onInspectResult={handleInspectHistoryResult}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearAllHistory}
            onBackToAnalyzer={() => handleNavigate('message-scanner')}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            saveToHistory={saveToHistory}
            onToggleSaveToHistory={setSaveToHistory}
            historyItems={historyItems}
            onClearAllHistory={handleClearAllHistory}
            onNavigate={handleNavigate}
            theme={theme}
            onSetTheme={handleSetTheme}
          />
        )}

        {activeView === 'how-it-works' && (
          <HowItWorksView onTryAnalyzer={() => handleNavigate('message-scanner')} />
        )}

        {activeView === 'about' && (
          <AboutView onBackToAnalyzer={() => handleNavigate('dashboard')} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
