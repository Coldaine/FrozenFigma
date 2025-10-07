import React, { useState } from 'react';
import { useStore } from '../../state/store';
import { exportAll, exportGraph, exportTokens, ExportOptions } from '../../../io/export';
import { saveUI } from '../../../io/persistence';
import { captureScreenshot } from '../../../io/artifacts';

// ============================================================================
// EXPORT DIALOG COMPONENT
// ============================================================================

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const { graph, actions, selectors } = useStore();
  const [exportFormat, setExportFormat] = useState<'tsx' | 'jsx' | 'vue' | 'svelte'>('tsx');
  const [includeTokens, setIncludeTokens] = useState(true);
  const [includeStyles, setIncludeStyles] = useState(true);
  const [exportType, setExportType] = useState<'all' | 'selected' | 'current'>('all');
  const [exportPath, setExportPath] = useState('./exports');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);

  if (!isOpen) return null;

 const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);
    
    try {
      const options: ExportOptions = {
        format: exportFormat,
        includeTokens,
        includeStyles,
        basePath: exportPath
      };

      // Apply component filter based on export type
      if (exportType === 'selected') {
        const selectedIds = useStore.getState().selection.selectedIds;
        options.componentFilter = (component) => selectedIds.includes(component.id);
      } else if (exportType === 'current') {
        // For current, we might want to filter by some other criteria
        // For now, we'll just export all
      }

      let result;
      
      if (exportType === 'all' || exportType === 'selected') {
        result = await exportAll(graph, exportPath, options);
      } else {
        result = await exportGraph(graph, `${exportPath}/App.tsx`, options);
      }

      if (result.success) {
        setExportResult(`Export completed successfully! Files: ${result.exportedFiles.join(', ')}`);
      } else {
        setExportResult(`Export failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      setExportResult(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveUI = async () => {
    try {
      await saveUI(graph);
      setExportResult('UI saved successfully to ui.json');
    } catch (error) {
      setExportResult(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
 };

  const handleScreenshot = async () => {
    try {
      const screenshot = await captureScreenshot();
      // In a real implementation, we would save this screenshot
      setExportResult('Screenshot captured successfully');
      
      // Create a temporary link to allow user to download the screenshot
      const link = document.createElement('a');
      link.href = screenshot;
      link.download = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setExportResult(`Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
 };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Export Options</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="w-full p-2 border-gray-300 rounded-md"
            >
              <option value="tsx">React TSX</option>
              <option value="jsx">React JSX</option>
              <option value="vue">Vue</option>
              <option value="svelte">Svelte</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Type
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Components</option>
              <option value="selected">Selected Components</option>
              <option value="current">Current View</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Path
            </label>
            <input
              type="text"
              value={exportPath}
              onChange={(e) => setExportPath(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., ./exports"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeTokens"
              checked={includeTokens}
              onChange={(e) => setIncludeTokens(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeTokens" className="text-sm text-gray-700">
              Include Design Tokens
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeStyles"
              checked={includeStyles}
              onChange={(e) => setIncludeStyles(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeStyles" className="text-sm text-gray-700">
              Include Styles
            </label>
          </div>

          {exportResult && (
            <div className={`p-3 rounded-md ${exportResult.includes('failed') || exportResult.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {exportResult}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`flex-1 py-2 px-4 rounded-md text-white ${
                isExporting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>

            <button
              onClick={handleSaveUI}
              disabled={isExporting}
              className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
            >
              Save UI
            </button>

            <button
              onClick={handleScreenshot}
              disabled={isExporting}
              className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400"
            >
              Screenshot
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;