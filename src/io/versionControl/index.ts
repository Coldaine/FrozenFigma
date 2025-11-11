import { Graph } from '../../schema';
import { generateDiff, GraphDiff } from '../artifacts';
import { saveArtifact, loadArtifact, listArtifacts } from '../artifacts';
import { getFileManager } from '../utils/fileManager';

// ============================================================================
// VERSION CONTROL TYPES & INTERFACES
// ============================================================================

/**
 * Represents a commit in the version control system.
 */
export interface Commit {
  id: string;
  parentId: string | null; // null for initial commit
  timestamp: string;
  message: string;
  author: string;
  graph: Graph;
  diff: GraphDiff; // The diff between this commit and parent
}

/**
 * Represents the current state of the repository.
 */
export interface RepositoryState {
  head: string | null; // Current commit ID (or null for initial state)
  commits: Commit[]; // All commits in the repository
  branches: { [name: string]: string }; // Branch name to commit ID mapping
  currentBranch: string;
}

/**
 * Options for commit operations.
 */
export interface CommitOptions {
  message: string;
  author?: string;
 branch?: string;
}

// ============================================================================
// VERSION CONTROL IMPLEMENTATION
// ============================================================================

/**
 * A lightweight Git-like version control system for UI graphs.
 */
export class VersionControl {
  private state: RepositoryState;
  private repoPath: string;

  constructor(repoPath: string = '/vcs') {
    this.repoPath = repoPath;
    this.state = {
      head: null,
      commits: [],
      branches: { main: '' }, // Initially empty commit ID
      currentBranch: 'main',
    };
  }

  /**
   * Initializes the repository.
   * @returns Promise that resolves when initialization is complete
   */
  async init(): Promise<void> {
    const fm = getFileManager();
    
    // Create the VCS directory structure
    await fm.mkdir(`${this.repoPath}/commits`, { recursive: true });
    await fm.mkdir(`${this.repoPath}/branches`, { recursive: true });
    await fm.mkdir(`${this.repoPath}/refs`, { recursive: true });
    
    // Initialize with an empty state
    this.state = {
      head: null,
      commits: [],
      branches: { main: '' },
      currentBranch: 'main',
    };
    
    console.log('Repository initialized');
  }

  /**
   * Creates a new commit with the current graph state.
   * @param graph - The current graph state to commit
   * @param options - Commit options
   * @returns Promise that resolves to the new commit ID
   */
  async commit(graph: Graph, options: CommitOptions): Promise<string> {
    try {
      // Get the parent commit (current HEAD)
      const parentId = this.state.head;
      
      // Create the commit object
      const commitId = this.generateCommitId();
      const timestamp = new Date().toISOString();
      const author = options.author || 'FrozenFigma User';
      
      // Get the parent graph to calculate diff
      let parentGraph: Graph | null = null;
      if (parentId) {
        const parentCommit = this.state.commits.find(c => c.id === parentId);
        if (parentCommit) {
          parentGraph = parentCommit.graph;
        }
      }
      
      // Calculate diff if we have a parent
      const diff: GraphDiff = parentGraph ? generateDiff(parentGraph, graph) : {
        timestamp: new Date().toISOString(),
        changes: {
          nodes: { added: [], removed: [], updated: [] },
          tokens: null,
          meta: null,
        },
        summary: {
          nodeCount: { old: 0, new: 0, change: 0 },
          tokensChanged: false,
          metaChanged: false,
        }
      };
      
      const newCommit: Commit = {
        id: commitId,
        parentId,
        timestamp,
        message: options.message,
        author,
        graph: JSON.parse(JSON.stringify(graph)), // Deep clone the graph
        diff,
      };
      
      // Add commit to state
      this.state.commits.push(newCommit);
      this.state.head = commitId;
      
      // Update the current branch to point to this commit
      this.state.branches[this.state.currentBranch] = commitId;
      
      // Save commit to storage
      await saveArtifact(
        newCommit,
        `${this.repoPath}/commits/${commitId}.json`,
        'session',
        `commit-${commitId}`,
        `Commit: ${options.message}`
      );
      
      // Update branch reference
      await saveArtifact(
        { commitId },
        `${this.repoPath}/refs/heads/${this.state.currentBranch}`,
        'session',
        `branch-${this.state.currentBranch}`,
        `Branch ${this.state.currentBranch} reference`
      );
      
      console.log(`Created commit ${commitId}: ${options.message}`);
      return commitId;
    } catch (error) {
      console.error('Error creating commit:', error);
      throw error;
    }
  }

  /**
   * Checks out a specific commit, updating the graph to that state.
   * @param commitId - The ID of the commit to check out
   * @returns Promise that resolves to the graph at that commit
   */
  async checkout(commitId: string): Promise<Graph> {
    try {
      // Find the commit
      const commit = this.state.commits.find(c => c.id === commitId);
      if (!commit) {
        throw new Error(`Commit ${commitId} not found`);
      }
      
      // Update HEAD to point to this commit
      this.state.head = commitId;
      
      // Update the current branch to point to this commit
      this.state.branches[this.state.currentBranch] = commitId;
      
      // Update branch reference
      await saveArtifact(
        { commitId },
        `${this.repoPath}/refs/heads/${this.state.currentBranch}`,
        'session',
        `branch-${this.state.currentBranch}`,
        `Branch ${this.state.currentBranch} reference`
      );
      
      console.log(`Checked out commit ${commitId}`);
      return commit.graph;
    } catch (error) {
      console.error('Error checking out commit:', error);
      throw error;
    }
  }

  /**
   * Checks out a specific branch.
   * @param branchName - The name of the branch to check out
   * @returns Promise that resolves to the graph at the branch tip
   */
  async checkoutBranch(branchName: string): Promise<Graph> {
    if (!this.state.branches[branchName]) {
      throw new Error(`Branch ${branchName} does not exist`);
    }
    
    const commitId = this.state.branches[branchName];
    this.state.currentBranch = branchName;
    
    return this.checkout(commitId);
  }

  /**
   * Creates a new branch from the current HEAD.
   * @param branchName - The name of the new branch
   * @returns Promise that resolves when the branch is created
   */
  async createBranch(branchName: string): Promise<void> {
    if (this.state.branches[branchName]) {
      throw new Error(`Branch ${branchName} already exists`);
    }
    
    if (!this.state.head) {
      throw new Error('Cannot create branch from initial state - make a commit first');
    }
    
    this.state.branches[branchName] = this.state.head;
    
    // Save branch reference
    await saveArtifact(
      { commitId: this.state.head },
      `${this.repoPath}/refs/heads/${branchName}`,
      'session',
      `branch-${branchName}`,
      `Branch ${branchName} reference`
    );
    
    console.log(`Created branch ${branchName} at ${this.state.head}`);
  }

  /**
   * Lists all commits in the repository.
   * @returns Array of commits
   */
  getCommits(): Commit[] {
    return [...this.state.commits].reverse(); // Return in reverse chronological order
  }

  /**
   * Gets the commit history for the current branch.
   * @returns Array of commits in the current branch
   */
  getCurrentBranchHistory(): Commit[] {
    const history: Commit[] = [];
    let currentCommitId: string | null = this.state.branches[this.state.currentBranch];
    
    // If there's no commit for the current branch, return empty array
    if (!currentCommitId || currentCommitId === '') {
      return [];
    }
    
    // Traverse the commit chain from current branch tip to initial commit
    while (currentCommitId) {
      const commit = this.state.commits.find(c => c.id === currentCommitId);
      if (!commit) break;
      
      history.push(commit);
      currentCommitId = commit.parentId;
    }
    
    return history;
 }

  /**
   * Gets the current HEAD commit.
   * @returns The current HEAD commit or null if initial state
   */
  getCurrentCommit(): Commit | null {
    if (!this.state.head) return null;
    return this.state.commits.find(c => c.id === this.state.head) || null;
  }

  /**
   * Gets the current branch name.
   * @returns The current branch name
   */
  getCurrentBranch(): string {
    return this.state.currentBranch;
  }

  /**
   * Gets all branch names.
   * @returns Array of branch names
   */
  getBranches(): string[] {
    return Object.keys(this.state.branches);
  }

  /**
   * Generates a unique commit ID.
   * @returns A unique commit ID
   */
  private generateCommitId(): string {
    // Create a simple hash of timestamp and random data
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${timestamp}${random}`;
  }

  /**
   * Loads the repository state from storage.
   * @returns Promise that resolves when the repository is loaded
   */
  async load(): Promise<void> {
    try {
      // Load all commits from storage
      const commitArtifacts = await listArtifacts('session', ['commit']);
      
      // Load each commit
      for (const artifact of commitArtifacts) {
        const commitArtifact = await loadArtifact(artifact.id);
        if (commitArtifact && commitArtifact.content) {
          const commit = commitArtifact.content as Commit;
          // Basic validation of artifact shape
          if (commit && commit.id && commit.graph) {
            this.state.commits.push(commit);
          }
          
          // If this is the latest commit for the main branch, set as HEAD
          if (!this.state.head || new Date(commit.timestamp) > new Date(this.state.head)) {
            this.state.head = commit.id;
          }
        }
      }
      
      // Load branch references
      // In a real implementation, we would load all branch refs
      // For now, we'll just set the main branch to the current HEAD if it exists
      if (this.state.head) {
        this.state.branches.main = this.state.head;
      }
      
      console.log(`Loaded repository with ${this.state.commits.length} commits`);
    } catch (error) {
      console.error('Error loading repository:', error);
      // Initialize with empty state if loading fails
      this.state = {
        head: null,
        commits: [],
        branches: { main: '' },
        currentBranch: 'main',
      };
    }
  }

  /**
   * Resets the repository to a previous commit (soft reset).
   * @param commitId - The ID of the commit to reset to
   * @returns Promise that resolves to the graph at the reset commit
   */
  async resetToCommit(commitId: string): Promise<Graph> {
    try {
      // Find the commit
      const commit = this.state.commits.find(c => c.id === commitId);
      if (!commit) {
        throw new Error(`Commit ${commitId} not found`);
      }
      
      // Update HEAD to point to this commit
      this.state.head = commitId;
      
      // Update the current branch to point to this commit
      this.state.branches[this.state.currentBranch] = commitId;
      
      // Update branch reference
      await saveArtifact(
        { commitId },
        `${this.repoPath}/refs/heads/${this.state.currentBranch}`,
        'session',
        `branch-${this.state.currentBranch}`,
        `Branch ${this.state.currentBranch} reference`
      );
      
      console.log(`Reset to commit ${commitId}`);
      return commit.graph;
    } catch (error) {
      console.error('Error resetting to commit:', error);
      throw error;
    }
  }

  /**
   * Gets the diff between two commits.
   * @param fromCommitId - The starting commit ID
   * @param toCommitId - The ending commit ID
   * @returns The diff object
   */
  getDiff(fromCommitId: string, toCommitId: string): GraphDiff {
    // Find both commits
    const fromCommit = this.state.commits.find(c => c.id === fromCommitId);
    const toCommit = this.state.commits.find(c => c.id === toCommitId);
    
    if (!fromCommit || !toCommit) {
      throw new Error('One or both commits not found');
    }
    
    // Generate diff between the two graph states
    return generateDiff(fromCommit.graph, toCommit.graph);
  }
}

// ============================================================================
// DEFAULT INSTANCE AND CONVENIENCE FUNCTIONS
// ============================================================================

// Create a default instance for easy use
let defaultVCS = new VersionControl();

/**
 * Initializes the default version control system.
 * @param repoPath - Optional repository path
 * @returns Promise that resolves when initialization is complete
 */
export async function initVCS(repoPath?: string): Promise<void> {
  if (repoPath) {
    defaultVCS = new VersionControl(repoPath);
  }
  await defaultVCS.init();
}

/**
 * Commits the current graph state to the default VCS.
 * @param graph - The graph to commit
 * @param options - Commit options
 * @returns Promise that resolves to the commit ID
 */
export async function commitToVCS(graph: Graph, options: CommitOptions): Promise<string> {
  return defaultVCS.commit(graph, options);
}

/**
 * Gets the commit history from the default VCS.
 * @returns Array of commits
 */
export function getCommitHistory(): Commit[] {
  return defaultVCS.getCurrentBranchHistory();
}

/**
 * Checks out a commit from the default VCS.
 * @param commitId - The ID of the commit to check out
 * @returns Promise that resolves to the graph at that commit
 */
export async function checkoutVCS(commitId: string): Promise<Graph> {
  return defaultVCS.checkout(commitId);
}

/**
 * Resets to a commit from the default VCS.
 * @param commitId - The ID of the commit to reset to
 * @returns Promise that resolves to the graph at the reset commit
 */
export async function resetToVCS(commitId: string): Promise<Graph> {
  return defaultVCS.resetToCommit(commitId);
}

/**
 * Loads the default VCS from storage.
 * @returns Promise that resolves when loading is complete
 */
export async function loadVCS(): Promise<void> {
  await defaultVCS.load();
}