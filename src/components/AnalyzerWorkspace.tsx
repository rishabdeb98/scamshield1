import { useMemo, useState } from 'react';
import {
  ClipboardPaste,
  Link2,
  MessageSquareText,
  RotateCcw,
  Search,
  ShieldAlert,
} from 'lucide-react';
import type { MessageChannel, SampleMessage } from '../types/scamshield';

interface AnalyzerWorkspaceProps {
  focusMode?: 'both' | 'message' | 'url';
  messageText: string;
  onMessageTextChange: (value: string) => void;
  channel: MessageChannel;
  onChannelChange: (value: MessageChannel) => void;
  urlInput: string;
  onUrlInputChange: (value: string) => void;
  saveToHistory: boolean;
  onToggleSaveToHistory: (enabled: boolean) => void;
  samples: SampleMessage[];
  isAnalyzingMessage: boolean;
  isAnalyzingUrl: boolean;
  errorMessage: string | null;
  onAnalyzeMessage: () => void;
  onClearMessage: () => void;
  onAnalyzeUrl: () => void;
  onClearUrl: () => void;
  onSelectSample: (sample: SampleMessage) => void;
}

const MAX_MESSAGE_CHARS = 5000;

const CHANNEL_OPTIONS: Array<{ value: MessageChannel; label: string }> = [
  { value: 'auto', label: 'Any Source' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' },
];

export function AnalyzerWorkspace({
  focusMode = 'both',
  messageText,
  onMessageTextChange,
  channel,
  onChannelChange,
  urlInput,
  onUrlInputChange,
  saveToHistory,
  onToggleSaveToHistory,
  samples,
  isAnalyzingMessage,
  isAnalyzingUrl,
  errorMessage,
  onAnalyzeMessage,
  onClearMessage,
  onAnalyzeUrl,
  onClearUrl,
  onSelectSample,
}: AnalyzerWorkspaceProps) {
  const [showSamples, setShowSamples] = useState(false);
  const [clipboardHint, setClipboardHint] = useState<string | null>(null);

  const charCount = messageText.length;
  const isOverLimit = charCount > MAX_MESSAGE_CHARS;
  const showMessagePanel = focusMode === 'both' || focusMode === 'message';
  const showUrlPanel = focusMode === 'both' || focusMode === 'url';

  const suspiciousSamples = samples.filter((s) => s.expectedRisk !== 'LOW');
  const genuineSamples = samples.filter((s) => s.expectedRisk === 'LOW');

  const detectedLinkCount = useMemo(() => {
    const matches = messageText.match(/\b(?:https?|hxxps?):\/\/[^\s<>"')\]}]+/gi);
    return matches ? matches.length : 0;
  }, [messageText]);

  const handlePasteToMessage = async () => {
    setClipboardHint(null);
    if (!navigator.clipboard?.readText) {
      setClipboardHint('Clipboard paste is unavailable in this browser—use Ctrl+V / Cmd+V.');
      document.getElementById('message-textarea')?.focus();
      return;
    }
    try {
      const clip = await navigator.clipboard.readText();
      if (clip.trim()) {
        onMessageTextChange(clip.trim());
      } else {
        setClipboardHint('Your clipboard appears empty.');
      }
    } catch {
      setClipboardHint('Clipboard permission blocked—click the text box and press Ctrl+V / Cmd+V.');
      document.getElementById('message-textarea')?.focus();
    }
  };

  const handlePasteToUrl = async () => {
    setClipboardHint(null);
    if (!navigator.clipboard?.readText) {
      setClipboardHint('Clipboard paste is unavailable in this browser—use Ctrl+V / Cmd+V.');
      document.getElementById('url-input')?.focus();
      return;
    }
    try {
      const clip = await navigator.clipboard.readText();
      if (clip.trim()) {
        onUrlInputChange(clip.trim());
      } else {
        setClipboardHint('Your clipboard appears empty.');
      }
    } catch {
      setClipboardHint('Clipboard permission blocked—click the URL box and press Ctrl+V / Cmd+V.');
      document.getElementById('url-input')?.focus();
    }
  };

  return (
    <section id="analyzer" aria-label="Message and URL Analysis" className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/70 text-sm text-red-900 dark:text-red-200"
        >
          <ShieldAlert
            className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <span>{errorMessage}</span>
        </div>
      )}

      {clipboardHint && (
        <div
          role="status"
          className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200"
        >
          {clipboardHint}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Panel: Message Analysis */}
        {showMessagePanel && (
          <div
            className={`${
              focusMode === 'message' ? 'lg:col-span-12' : 'lg:col-span-7'
            } bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#273449]">
              <div className="flex items-center gap-2.5">
                <MessageSquareText
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    Message Analysis
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-[#A7B4C7]">
                    Inspect SMS, WhatsApp, email, or social media text
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handlePasteToMessage()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#273449] bg-slate-50 dark:bg-[#111827] hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-colors whitespace-nowrap shrink-0"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Paste</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSamples((prev) => !prev)}
                  aria-expanded={showSamples}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#273449] hover:border-blue-300 dark:hover:border-blue-500 bg-slate-50 dark:bg-[#111827] hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-colors whitespace-nowrap shrink-0"
                >
                  {showSamples ? 'Hide Demo Samples' : 'Compare Scam vs. Genuine'}
                </button>
              </div>
            </div>

            {showSamples && samples.length > 0 && (
              <div className="mt-4 pb-4 border-b border-slate-100 dark:border-[#273449] space-y-4">
                <p className="text-xs font-medium text-slate-600 dark:text-[#A7B4C7]">
                  Choose a suspicious or genuine sample to inspect how context affects scoring:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                      Fraudulent / Phishing Samples
                    </div>
                    <div className="space-y-2">
                      {suspiciousSamples.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => {
                            onSelectSample(sample);
                            setShowSamples(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-lg border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#111827] hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <div className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                            {sample.title}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-[#A7B4C7] truncate">
                            {sample.categoryLabel} · Expected {sample.expectedRisk}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      Genuine / Safe Control Samples
                    </div>
                    <div className="space-y-2">
                      {genuineSamples.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => {
                            onSelectSample(sample);
                            setShowSamples(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-lg border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#111827] hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors"
                        >
                          <div className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                            {sample.title}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-[#A7B4C7] truncate">
                            {sample.categoryLabel} · Expected {sample.expectedRisk}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Source channel segmented selector */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div
                role="group"
                aria-label="Message source channel"
                className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-[#111827] border border-transparent dark:border-[#273449] rounded-lg"
              >
                {CHANNEL_OPTIONS.map((opt) => {
                  const active = channel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChannelChange(opt.value)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-[#A7B4C7] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToHistory}
                  onChange={(e) => onToggleSaveToHistory(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600"
                />
                <span>Save to history</span>
              </label>
            </div>

            <div className="mt-4">
              <label htmlFor="message-textarea" className="sr-only">
                Suspicious message text
              </label>
              <textarea
                id="message-textarea"
                rows={7}
                value={messageText}
                onChange={(e) => onMessageTextChange(e.target.value)}
                placeholder="Paste your suspicious SMS, WhatsApp message or email here..."
                className={`w-full rounded-lg border px-3.5 py-3 text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-[#0B1220] focus:outline-none focus:ring-2 transition-shadow resize-y ${
                  isOverLimit
                    ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-300 dark:border-[#273449] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-blue-600/15'
                }`}
              />
              <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 dark:text-[#A7B4C7]">
                  {detectedLinkCount > 0
                    ? `Detected ${detectedLinkCount} embedded link${detectedLinkCount === 1 ? '' : 's'} — will be inspected safely without opening.`
                    : 'Embedded links inside your message are inspected automatically.'}
                </span>
                <span
                  className={`font-mono tabular-nums ${
                    isOverLimit
                      ? 'text-red-600 dark:text-red-400 font-semibold'
                      : 'text-slate-500 dark:text-[#A7B4C7]'
                  }`}
                >
                  {charCount.toLocaleString()} / {MAX_MESSAGE_CHARS.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onAnalyzeMessage}
                disabled={isAnalyzingMessage || isOverLimit}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>{isAnalyzingMessage ? 'Analysing...' : 'Analyse Message'}</span>
              </button>

              <button
                type="button"
                onClick={onClearMessage}
                disabled={isAnalyzingMessage || messageText.length === 0}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* Secondary Panel: URL Analysis */}
        {showUrlPanel && (
          <div
            className={`${
              focusMode === 'url' ? 'lg:col-span-12' : 'lg:col-span-5'
            } bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#273449]">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    URL Analysis
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-[#A7B4C7]">
                    Inspect a standalone link without opening it
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handlePasteToUrl()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#273449] bg-slate-50 dark:bg-[#111827] hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-colors whitespace-nowrap shrink-0"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Paste Link</span>
                </button>

                {focusMode === 'url' && (
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-[#A7B4C7] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveToHistory}
                      onChange={(e) => onToggleSaveToHistory(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600"
                    />
                    <span>Save to history</span>
                  </label>
                )}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAnalyzeUrl();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label
                  htmlFor="url-input"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  Suspicious URL
                </label>
                <input
                  id="url-input"
                  type="text"
                  value={urlInput}
                  onChange={(e) => onUrlInputChange(e.target.value)}
                  placeholder="https://example-verify-login.xyz/account"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-lg border border-slate-300 dark:border-[#273449] px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-[#0B1220] focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isAnalyzingUrl}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  <Link2 className="w-4 h-4" aria-hidden="true" />
                  <span>{isAnalyzingUrl ? 'Checking...' : 'Check URL'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClearUrl}
                  disabled={isAnalyzingUrl || urlInput.length === 0}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Clear</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#273449] space-y-2 text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                What URL Analysis Checks
              </p>
              <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-[#A7B4C7]">
                <li>Raw IP hosts, URL shorteners, and punycode lookalikes</li>
                <li>Misspelled brand domains, APK downloads, and stacked subdomains</li>
                <li>Unencrypted HTTP and excessive URL length or obfuscation</li>
              </ul>
              <p className="pt-1 text-slate-500 dark:text-[#A7B4C7]">
                Links are parsed statically on the server and are never fetched or visited.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
