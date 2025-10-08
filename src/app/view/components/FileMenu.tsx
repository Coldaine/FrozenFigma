import React, { useState, useRef, ChangeEvent } from 'react';
import { useStore } from '../../state/store';
import { createCheckpoint, restoreFromCheckpoint } from '../../../io/persistence';

// ============================================================================
// FILE MENU COMPONENT
// ============================================================================

interface FileMenuProps {
  onOpenExportDialog: () => void;
}

const FileMenu: React.FC<FileMenuProps> = ({ onOpenExportDialog }) => {
  const { actions, session } = useStore();
  const [showCheckpointMenu, setShowCheckpointMenu] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      // The save functionality is handled by the persistence system
      // We'll trigger a manual save through the store integration
      actions.incrementTurn(); // Increment turn before saving
      console.log('Save operation triggered');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleLoad = async (file: File) => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const content = await file.text();
      const graph = JSON.parse(content);
      
      // Load the graph into the store
      actions.setGraph(graph);
      
      console.log('File loaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLoadError(`Failed to load file: ${errorMessage}`);
      console.error('Load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleLoad(file);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleCreateCheckpoint = async () => {
    try {
      await createCheckpoint(
        useStore.getState().graph, 
        `checkpoint-${Date.now()}`, 
        `Checkpoint at ${new Date().toLocaleString()}`
      );
      console.log('Checkpoint created');
    } catch (error) {
      console.error('Failed to create checkpoint:', error);
    }
  };

  const handleRestoreCheckpoint = async (checkpointId: string) => {
    try {
      const graph = await restoreFromCheckpoint(checkpointId);
      actions.setGraph(graph);
      console.log(`Restored from checkpoint: ${checkpointId}`);
      setShowCheckpointMenu(false);
    } catch (error) {
      console.error(`Failed to restore from checkpoint ${checkpointId}:`, error);
    }
  };

  const handleLoadFromList = async (checkpointId: string) => {
    try {
      const graph = await restoreFromCheckpoint(checkpointId);
      actions.setGraph(graph);
      console.log(`Loaded from checkpoint: ${checkpointId}`);
      setShowLoadMenu(false);
    } catch (error) {
      console.error(`Failed to load from checkpoint ${checkpointId}:`, error);
    }
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          title="Save UI"
        >
          Save
        </button>

        <div className="relative">
          <button
            onClick={() => setShowLoadMenu(!showLoadMenu)}
            className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            title="Load UI"
          >
            Load
          </button>

          {showLoadMenu && (
            <div className="absolute left-0 mt-1 w-64 bg-white shadow-lg rounded-md z-10 border border-gray-200">
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 mb-1">Load from file:</div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                >
                  Choose File...
                </button>

                <div className="text-xs font-semibold text-gray-500 mb-1 mt-2">Load from checkpoint:</div>
                {session.checkpoints.length > 0 ? (
                  session.checkpoints.map((checkpoint) => (
                    <div 
                      key={checkpoint.id} 
                      className="flex justify-between items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => handleLoadFromList(checkpoint.id)}
                    >
                      <span className="truncate max-w-[160px]">{checkpoint.description}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(checkpoint.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No checkpoints available</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCheckpointMenu(!showCheckpointMenu)}
            className="px-3 py-1.5 bg-purple-60 text-white rounded hover:bg-purple-700 text-sm"
            title="Checkpoints"
          >
            Checkpoints
          </button>

          {showCheckpointMenu && (
            <div className="absolute left-0 mt-1 w-64 bg-white shadow-lg rounded-md z-10 border border-gray-200">
              <div className="p-2">
                <button
                  onClick={handleCreateCheckpoint}
                  className="w-full mb-2 px-2 py-1.5 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm"
                >
                  Create Checkpoint
                </button>

                {session.checkpoints.length > 0 ? (
                  session.checkpoints.map((checkpoint) => (
                    <div 
                      key={checkpoint.id} 
                      className="flex justify-between items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => handleRestoreCheckpoint(checkpoint.id)}
                    >
                      <span className="truncate max-w-[160px]">{checkpoint.description}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(checkpoint.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No checkpoints available</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onOpenExportDialog}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          title="Export"
        >
          Export
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p>Loading UI...</p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{loadError}</p>
          <button 
            onClick={() => setLoadError(null)}
            className="absolute top-1 right-1 text-red-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default FileMenu;