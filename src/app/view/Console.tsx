import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../state/store';
import { AgentOrchestrator } from '../../agent';

/**
 * Log entry type
 */
interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'command';
  message: string;
  details?: string;
}

/**
 * Console component - Shows logs and provides command input for natural language prompts.
 * 
 * Features:
 * - Command input field with history
 * - Shows per-turn logs and gate reports
 * - Auto-scrolls to latest log
 * - Command history navigation (up/down arrows)
 * - Log filtering by type
 * - Integrated with Agent Orchestrator
 */
const Console: React.FC = () => {
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'info',
      message: 'FrozenFigma Console initialized',
      details: 'Ready to accept commands',
    },
  ]);
  const [filterType, setFilterType] = useState<'all' | LogEntry['type']>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const logContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const agentRef = useRef(new AgentOrchestrator({ verbose: false }));
  const { graph, actions } = useStore();

  /**
   * Auto-scroll to bottom when new logs are added
   */
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  /**
   * Add a log entry
   */
  const addLog = (type: LogEntry['type'], message: string, details?: string) => {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
    };
    setLogs((prev) => [...prev, logEntry]);
  };

  /**
   * Handle command submission
   */
  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commandInput.trim() || isProcessing) return;

    // Add to command history
    setCommandHistory((prev) => [...prev, commandInput]);
    setHistoryIndex(-1);

    // Log the command
    addLog('command', commandInput);

    setIsProcessing(true);

    try {
      // Execute agent turn
      addLog('info', 'Processing command...', `Agent turn ${agentRef.current.getTurnCounter() + 1}`);
      
      const result = await agentRef.current.executeTurn(commandInput, graph);
      
      if (result.success) {
        // Update the store with the new graph
        actions.setGraph(result.graph);
        
        // Log success
        addLog(
          'success', 
          'Command completed successfully',
          `${result.summary.description}\nChanges: +${result.summary.changes.added} ~${result.summary.changes.updated} -${result.summary.changes.removed} -${result.summary.changes.moved} (moved)`
        );
      } else {
        // Log error
        addLog(
          'error',
          'Command failed',
          'Unknown error occurred'
        );
      }
    } catch (error) {
      addLog(
        'error',
        'Unexpected error',
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setIsProcessing(false);
    }

    // Clear input
    setCommandInput('');
  };

  /**
   * Handle command history navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      
      const newIndex = historyIndex === -1 
        ? commandHistory.length - 1 
        : Math.max(0, historyIndex - 1);
      
      setHistoryIndex(newIndex);
      setCommandInput(commandHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      
      const newIndex = historyIndex + 1;
      
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[newIndex]);
      }
    }
  };

  /**
   * Clear all logs
   */
  const handleClearLogs = () => {
    setLogs([
      {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'info',
        message: 'Console cleared',
      },
    ]);
  };

  /**
   * Filter logs by type
   */
  const filteredLogs = filterType === 'all' 
    ? logs 
    : logs.filter((log) => log.type === filterType);

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  /**
   * Get log entry styling based on type
   */
  const getLogStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'command':
        return 'text-primary font-semibold';
      default:
        return 'text-text';
    }
  };

  /**
   * Get log icon based on type
   */
  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'command':
        return '▶️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="console-container h-full flex flex-col bg-surface border-t border-border">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text">Console</h3>
          <p className="text-xs text-secondary">
            Turn {agentRef.current.getTurnCounter()} • {logs.length} log{logs.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Filter buttons */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'info' | 'success' | 'error' | 'command')}
            className="px-2 py-1 text-xs bg-background border border-border rounded-md text-text"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="command">Commands</option>
          </select>
          
          {/* Clear button */}
          <button
            onClick={handleClearLogs}
            className="px-3 py-1 text-xs bg-background hover:bg-border text-text rounded-md transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Log display */}
      <div 
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs"
      >
        {filteredLogs.map((log) => (
          <div 
            key={log.id} 
            className="px-2 py-1 hover:bg-surface/50 rounded"
          >
            <div className="flex items-start space-x-2">
              <span className="text-secondary">{formatTime(log.timestamp)}</span>
              <span>{getLogIcon(log.type)}</span>
              <span className={getLogStyle(log.type)}>
                {log.message}
              </span>
            </div>
            {log.details && (
              <div className="ml-24 text-secondary text-xs whitespace-pre-wrap">
                {log.details}
              </div>
            )}
          </div>
        ))}
        
        {filteredLogs.length === 0 && (
          <div className="flex items-center justify-center h-full text-secondary">
            No logs to display
          </div>
        )}
      </div>

      {/* Command input */}
      <div className="p-3 border-t border-border">
        <form onSubmit={handleCommandSubmit}>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
                placeholder={isProcessing ? "Processing..." : "Enter command or natural language prompt..."}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-secondary">
                {isProcessing ? '⏳' : commandHistory.length > 0 ? '↑↓ History' : ''}
              </div>
            </div>
            <button
              type="submit"
              disabled={!commandInput.trim() || isProcessing}
              className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-opacity"
            >
              {isProcessing ? 'Processing...' : 'Run'}
            </button>
          </div>
        </form>
        
        <div className="mt-2 flex items-center justify-between text-xs text-secondary">
          <span>💡 Try: &quot;Add a button&quot;, &quot;Create 3 sliders&quot;, &quot;Make a modal&quot;</span>
          <span>{commandHistory.length} command{commandHistory.length !== 1 ? 's' : ''} in history</span>
        </div>
      </div>
    </div>
  );
};

export default Console;