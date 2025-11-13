import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../state/store';
import { createComponent, generateId } from '../../schema';

/**
 * Command action definition
 */
interface CommandAction {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon: string;
  action: () => void;
  category: 'component' | 'edit' | 'view' | 'selection';
}

/**
 * CommandBar component - Command Palette for quick actions (Cmd/Ctrl+K).
 * 
 * Features:
 * - Activated with Cmd/Ctrl+K
 * - Searchable list of actions
 * - Keyboard navigation (up/down arrows, Enter to execute)
 * - Categorized commands
 * - ESC to close
 */
const CommandBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { actions, selectors } = useStore();

  /**
   * Define all available commands
   */
  const commands: CommandAction[] = [
    // Component commands
    {
      id: 'add-button',
      label: 'Add Button',
      description: 'Add a new button component',
      keywords: ['button', 'add', 'create'],
      icon: '🔘',
      category: 'component',
      action: () => {
        const component = createComponent('button', {
          x: 100, y: 100, w: 120, h: 40, region: 'center'
        }, { props: { label: 'Button' }, name: `button-${generateId().slice(0, 4)}` });
        actions.addComponent(component);
      },
    },
    {
      id: 'add-card',
      label: 'Add Card',
      description: 'Add a new card component',
      keywords: ['card', 'add', 'create'],
      icon: '🃏',
      category: 'component',
      action: () => {
        const component = createComponent('card', {
          x: 100, y: 100, w: 300, h: 200, region: 'center'
        }, { props: { title: 'Card Title', description: 'Card description' }, name: `card-${generateId().slice(0, 4)}` });
        actions.addComponent(component);
      },
    },
    {
      id: 'add-modal',
      label: 'Add Modal',
      description: 'Add a new modal dialog',
      keywords: ['modal', 'dialog', 'add', 'create'],
      icon: '📦',
      category: 'component',
      action: () => {
        const component = createComponent('modal', {
          x: 200, y: 100, w: 400, h: 300, region: 'overlay'
        }, { props: { title: 'Modal', content: 'Modal content', open: true }, name: `modal-${generateId().slice(0, 4)}` });
        actions.addComponent(component);
      },
    },
    // Edit commands
    {
      id: 'delete-selected',
      label: 'Delete Selected',
      description: 'Delete all selected components',
      keywords: ['delete', 'remove', 'selected'],
      icon: '🗑️',
      category: 'edit',
      action: () => {
        const selected = selectors.getSelectedComponents();
        selected.forEach(comp => actions.removeComponent(comp.id));
      },
    },
    {
      id: 'clear-canvas',
      label: 'Clear Canvas',
      description: 'Remove all components from canvas',
      keywords: ['clear', 'delete', 'all', 'reset'],
      icon: '🧹',
      category: 'edit',
      action: () => {
        if (confirm('Are you sure you want to clear the entire canvas?')) {
          actions.resetGraph();
        }
      },
    },
    {
      id: 'undo',
      label: 'Undo',
      description: 'Undo last action',
      keywords: ['undo', 'back'],
      icon: '↶',
      category: 'edit',
      action: () => {
        if (actions.canUndo()) {
          actions.undo();
        }
      },
    },
    {
      id: 'redo',
      label: 'Redo',
      description: 'Redo last undone action',
      keywords: ['redo', 'forward'],
      icon: '↷',
      category: 'edit',
      action: () => {
        if (actions.canRedo()) {
          actions.redo();
        }
      },
    },
    // Selection commands
    {
      id: 'select-all',
      label: 'Select All',
      description: 'Select all components',
      keywords: ['select', 'all'],
      icon: '☑️',
      category: 'selection',
      action: () => {
        const allComponents = selectors.getAllComponents();
        actions.selectMultiple(allComponents.map(c => c.id));
      },
    },
    {
      id: 'clear-selection',
      label: 'Clear Selection',
      description: 'Deselect all components',
      keywords: ['deselect', 'clear', 'selection'],
      icon: '⬜',
      category: 'selection',
      action: () => {
        actions.clearSelection();
      },
    },
    // View commands
    {
      id: 'checkpoint',
      label: 'Create Checkpoint',
      description: 'Save current state as checkpoint',
      keywords: ['checkpoint', 'save', 'snapshot'],
      icon: '💾',
      category: 'view',
      action: () => {
        const description = prompt('Enter checkpoint description:');
        if (description) {
          actions.createCheckpoint(description);
        }
      },
    },
  ];

  /**
   * Filter commands based on search query
   */
  const filteredCommands = commands.filter((cmd) => {
    const query = searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.keywords.some((kw) => kw.toLowerCase().includes(query))
    );
  });

  /**
   * Handle global keyboard shortcut to open command palette
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  /**
   * Focus input when opened
   */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * Reset selected index when search query changes
   */
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  /**
   * Handle command selection and execution
   */
  const handleExecuteCommand = useCallback((command: CommandAction) => {
    command.action();
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  }, []);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleExecuteCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => {
          setIsOpen(false);
          setSearchQuery('');
          setSelectedIndex(0);
        }}
      />

      {/* Command Palette */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="p-4 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands... (↑↓ to navigate, Enter to execute, ESC to close)"
              className="w-full px-4 py-3 bg-surface border border-border rounded-md text-text placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Command list */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-secondary">
                No commands found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleExecuteCommand(cmd)}
                    className={`
                      w-full px-4 py-3 flex items-center space-x-3 transition-colors text-left
                      ${index === selectedIndex
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface text-text'}
                    `}
                  >
                    <span className="text-2xl">{cmd.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{cmd.label}</div>
                      <div className={`text-sm ${index === selectedIndex ? 'text-white/80' : 'text-secondary'}`}>
                        {cmd.description}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      index === selectedIndex 
                        ? 'bg-white/20' 
                        : 'bg-surface'
                    }`}>
                      {cmd.category}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-surface">
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>
                <kbd className="px-2 py-1 bg-background rounded border border-border">↑↓</kbd> Navigate
                <kbd className="ml-2 px-2 py-1 bg-background rounded border border-border">↵</kbd> Execute
              </span>
              <span>
                <kbd className="px-2 py-1 bg-background rounded border border-border">ESC</kbd> Close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommandBar;