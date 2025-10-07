import { Graph } from '../../schema';
import { getFileManager, safeSaveFile, safeLoadFile, createUniqueFileName } from '../utils/fileManager';

// ============================================================================
// ARTIFACT TYPES & INTERFACES
// ============================================================================

/**
 * Represents different types of artifacts that can be captured.
 */
export type ArtifactType = 
  | 'screenshot' 
  | 'log' 
  | 'diff' 
  | 'checkpoint' 
  | 'export' 
  | 'session' 
  | 'turn-data'
  | 'validation-report'
  | 'unknown'; // Added to handle cases where type is unknown

/**
 * Represents metadata for an artifact.
 */
export interface ArtifactMetadata {
  id: string;
  type: ArtifactType;
  timestamp: string;
  name: string;
  description?: string;
  size?: number;
  path: string;
  tags?: string[];
  relatedTo?: string[]; // IDs of related artifacts or components
}

/**
 * Represents an artifact with its metadata and content.
 */
export interface Artifact {
  metadata: ArtifactMetadata;
 content: any; // The actual artifact data (could be string, object, binary, etc.)
}

// ============================================================================
// SCREENSHOT CAPTURE
// ============================================================================

/**
 * Captures a screenshot of the entire canvas or a specific element.
 * 
 * @param element - Optional element to capture (if not provided, captures entire canvas)
 * @param quality - Quality of the screenshot (0-1, default: 0.8)
 * @returns Promise that resolves to the screenshot as a data URL
 */
export async function captureScreenshot(element?: HTMLElement, quality: number = 0.8): Promise<string> {
  try {
    // In a browser environment, we'll use html2canvas or similar library
    // For now, we'll simulate the screenshot capture
    if (typeof window !== 'undefined') {
      // If element is provided, capture just that element
      if (element) {
        // In a real implementation, we would use a library like html2canvas
        console.log(`Capturing screenshot of element:`, element);
      } else {
        // Capture the entire visible area
        console.log('Capturing screenshot of entire canvas');
      }
      
      // Return a mock data URL (in a real implementation, this would be the actual screenshot)
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    } else {
      // In Node.js environment, we might use Puppeteer or similar
      console.log('Screenshot capture not available in this environment');
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
}

/**
 * Saves a screenshot artifact.
 * 
 * @param element - Optional element to capture
 * @param name - Name for the screenshot artifact
 * @param description - Description of the screenshot
 * @param tags - Optional tags for the screenshot
 * @returns Promise that resolves to the artifact metadata
 */
export async function saveScreenshotArtifact(
  element?: HTMLElement, 
  name: string = 'screenshot', 
  description?: string,
  tags?: string[]
): Promise<ArtifactMetadata> {
  try {
    const screenshot = await captureScreenshot(element);
    const timestamp = new Date().toISOString();
    const id = generateArtifactId('screenshot');
    
    const artifact: Artifact = {
      metadata: {
        id,
        type: 'screenshot',
        timestamp,
        name,
        description,
        size: screenshot.length,
        path: `/artifacts/screenshots/${id}.png`,
        tags,
      },
      content: screenshot
    };
    
    // Save the artifact using the file manager
    const fm = getFileManager();
    const uniquePath = await createUniqueFileName(artifact.metadata.path, fm);
    artifact.metadata.path = uniquePath;
    
    await fm.writeFile(uniquePath, screenshot);
    
    // Also save metadata as a separate JSON file for reference
    const metadataPath = uniquePath.replace(/\.[^/.]+$/, '.json');
    await fm.writeFile(metadataPath, JSON.stringify(artifact.metadata, null, 2));
    
    return artifact.metadata;
  } catch (error) {
    console.error('Error saving screenshot artifact:', error);
    throw error;
 }
}

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

/**
 * Logs turn data with metadata.
 * 
 * @param turnData - The turn data to log
 * @param turnNumber - The turn number
 * @param description - Description of the turn
 * @returns Promise that resolves when the log is saved
 */
export async function logTurn(turnData: any, turnNumber?: number, description?: string): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const id = generateArtifactId('log');
    
    const logEntry = {
      id,
      timestamp,
      turn: turnNumber,
      description,
      data: turnData,
      type: 'turn-data'
    };
    
    // Save to session log
    const fm = getFileManager();
    const logPath = `/logs/session-${timestamp.substring(0, 10)}.jsonl`;
    
    // Append to JSONL file (each entry on its own line)
    const logContent = await fm.exists(logPath) 
      ? await fm.readFile(logPath) 
      : '';
    
    const newLogLine = JSON.stringify(logEntry) + '\n';
    await fm.writeFile(logPath, logContent + newLogLine);
    
    console.log(`Logged turn ${turnNumber || 'unknown'}:`, description);
  } catch (error) {
    console.error('Error logging turn:', error);
    throw error;
 }
}

/**
 * Logs a session event.
 * 
 * @param eventType - Type of event to log
 * @param data - Event data
 * @param description - Description of the event
 * @returns Promise that resolves when the event is logged
 */
export async function logSessionEvent(
  eventType: string, 
  data: any, 
 description?: string
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const id = generateArtifactId('session');
    
    const event = {
      id,
      timestamp,
      type: eventType,
      description,
      data
    };
    
    // Save to session log
    const fm = getFileManager();
    const logPath = `/logs/session-${timestamp.substring(0, 10)}.jsonl`;
    
    const logContent = await fm.exists(logPath) 
      ? await fm.readFile(logPath) 
      : '';
    
    const newLogLine = JSON.stringify(event) + '\n';
    await fm.writeFile(logPath, logContent + newLogLine);
    
    console.log(`Logged session event: ${eventType}`, description);
  } catch (error) {
    console.error('Error logging session event:', error);
    throw error;
  }
}

// ============================================================================
// DIFF GENERATION
// ============================================================================

/**
 * Generates a diff between two graph states.
 * 
 * @param oldGraph - The previous graph state
 * @param newGraph - The new graph state
 * @returns Object containing the differences
 */
export function generateDiff(oldGraph: Graph, newGraph: Graph): any {
 try {
    // Compare nodes
    const addedNodes = newGraph.nodes.filter(
      newNode => !oldGraph.nodes.some(oldNode => oldNode.id === newNode.id)
    );
    
    const removedNodes = oldGraph.nodes.filter(
      oldNode => !newGraph.nodes.some(newNode => newNode.id === oldNode.id)
    );
    
    // Compare tokens
    const tokensChanged = JSON.stringify(oldGraph.tokens) !== JSON.stringify(newGraph.tokens);
    
    // Compare metadata
    const metaChanged = JSON.stringify(oldGraph.meta) !== JSON.stringify(newGraph.meta);
    
    // Create a detailed diff object
    const diff = {
      timestamp: new Date().toISOString(),
      changes: {
        nodes: {
          added: addedNodes,
          removed: removedNodes,
          updated: [] as any[], // We could implement a more detailed comparison here
        },
        tokens: tokensChanged ? { from: oldGraph.tokens, to: newGraph.tokens } : null,
        meta: metaChanged ? { from: oldGraph.meta, to: newGraph.meta } : null,
      },
      summary: {
        nodeCount: {
          old: oldGraph.nodes.length,
          new: newGraph.nodes.length,
          change: newGraph.nodes.length - oldGraph.nodes.length,
        },
        tokensChanged,
        metaChanged,
      }
    };
    
    return diff;
  } catch (error) {
    console.error('Error generating diff:', error);
    return { 
      changes: [], 
      additions: [], 
      deletions: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Saves a diff as an artifact.
 * 
 * @param oldGraph - The previous graph state
 * @param newGraph - The new graph state
 * @param description - Description of the diff
 * @param relatedTo - IDs of related artifacts or components
 * @returns Promise that resolves to the artifact metadata
 */
export async function saveDiffArtifact(
  oldGraph: Graph, 
  newGraph: Graph, 
  description?: string,
  relatedTo?: string[]
): Promise<ArtifactMetadata> {
  try {
    const diff = generateDiff(oldGraph, newGraph);
    const timestamp = new Date().toISOString();
    const id = generateArtifactId('diff');
    
    const artifact: Artifact = {
      metadata: {
        id,
        type: 'diff',
        timestamp,
        name: `diff-${timestamp}`,
        description: description || 'Graph state difference',
        size: JSON.stringify(diff).length,
        path: `/artifacts/diffs/${id}.json`,
        relatedTo,
      },
      content: diff
    };
    
    // Save the artifact
    const fm = getFileManager();
    const uniquePath = await createUniqueFileName(artifact.metadata.path, fm);
    artifact.metadata.path = uniquePath;
    
    await fm.writeFile(uniquePath, JSON.stringify(diff, null, 2));
    
    return artifact.metadata;
  } catch (error) {
    console.error('Error saving diff artifact:', error);
    throw error;
  }
}

// ============================================================================
// ARTIFACT MANAGEMENT
// ============================================================================

/**
 * Saves an arbitrary artifact.
 * 
 * @param data - The data to save as an artifact
 * @param path - Path where the artifact should be saved
 * @param type - Type of artifact
 * @param name - Name for the artifact
 * @param description - Description of the artifact
 * @param tags - Optional tags for the artifact
 * @returns Promise that resolves to the artifact metadata
 */
export async function saveArtifact(
  data: any, 
  path: string, 
  type: ArtifactType = 'export',
  name?: string,
  description?: string,
  tags?: string[]
): Promise<ArtifactMetadata> {
  try {
    const timestamp = new Date().toISOString();
    const id = generateArtifactId(type);
    
    // Create a more specific path based on the artifact type
    const basePath = path.startsWith('/') ? path : '/' + path;
    const artifactPath = basePath.includes('.') 
      ? basePath 
      : `${basePath}/${id}.${getArtifactExtension(type)}`;
    
    const artifact: Artifact = {
      metadata: {
        id,
        type,
        timestamp,
        name: name || `${type}-${timestamp}`,
        description,
        size: typeof data === 'string' ? data.length : JSON.stringify(data).length,
        path: artifactPath,
        tags,
      },
      content: data
    };
    
    // Save the artifact
    const fm = getFileManager();
    const uniquePath = await createUniqueFileName(artifact.metadata.path, fm);
    artifact.metadata.path = uniquePath;
    
    // Serialize content if it's an object
    const contentToSave = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    await fm.writeFile(uniquePath, contentToSave);
    
    // Save metadata as well
    const metadataPath = uniquePath.replace(/\.[^/.]+$/, '.json');
    await fm.writeFile(metadataPath, JSON.stringify(artifact.metadata, null, 2));
    
    return artifact.metadata;
  } catch (error) {
    console.error(`Error saving artifact to ${path}:`, error);
    throw error;
 }
}

/**
 * Loads an artifact by its ID or path.
 * 
 * @param idOrPath - The ID or path of the artifact to load
 * @returns Promise that resolves to the artifact
 */
export async function loadArtifact(idOrPath: string): Promise<Artifact | null> {
  try {
    const fm = getFileManager();
    
    // If idOrPath is a path, use it directly
    // If it's an ID, we need to find the corresponding path
    let path = idOrPath;
    if (!idOrPath.includes('/')) {
      // Assume it's an ID, look for the metadata file
      // In a real implementation, we might have an index of artifacts by ID
      // For now, we'll try to find it in the most common locations
      const possiblePaths = [
        `/artifacts/screenshots/${idOrPath}.png`,
        `/artifacts/diffs/${idOrPath}.json`,
        `/artifacts/checkpoints/${idOrPath}.json`,
        `/artifacts/exports/${idOrPath}.tsx`,
        `/artifacts/logs/${idOrPath}.json`,
      ];
      
      let found = false;
      for (const possiblePath of possiblePaths) {
        if (await fm.exists(possiblePath)) {
          path = possiblePath;
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.error(`Artifact with ID ${idOrPath} not found`);
        return null;
      }
    }
    
    // Load the artifact content
    const content = await fm.readFile(path);
    
    // Try to load the associated metadata file
    let metadata: ArtifactMetadata | null = null;
    const metadataPath = path.replace(/\.[^/.]+$/, '.json');
    if (await fm.exists(metadataPath)) {
      const metadataContent = await fm.readFile(metadataPath);
      try {
        metadata = JSON.parse(metadataContent);
      } catch (e) {
        console.warn(`Could not parse metadata for artifact ${path}:`, e);
      }
    }
    
    // If we couldn't load metadata from file, create a basic one
    if (!metadata) {
      const basicMetadata: ArtifactMetadata = {
        id: idOrPath,
        type: 'unknown',
        timestamp: new Date().toISOString(),
        name: path.split('/').pop() || 'unknown',
        path,
      };
      return {
        metadata: basicMetadata,
        content
      };
    }
    
    return {
      metadata,
      content
    };
  } catch (error) {
    console.error(`Error loading artifact ${idOrPath}:`, error);
    return null;
 }
}

/**
 * Lists artifacts of a specific type or all artifacts.
 * 
 * @param type - Optional type to filter by
 * @param tags - Optional tags to filter by
 * @returns Promise that resolves to an array of artifact metadata
 */
export async function listArtifacts(type?: ArtifactType, tags?: string[]): Promise<ArtifactMetadata[]> {
  try {
    const fm = getFileManager();
    const artifacts: ArtifactMetadata[] = [];
    
    // This is a simplified implementation
    // In a real system, we would have an index of all artifacts
    
    // Look in common artifact directories
    const artifactDirs = [
      '/artifacts/screenshots',
      '/artifacts/diffs', 
      '/artifacts/checkpoints',
      '/artifacts/exports',
      '/artifacts/logs',
    ];
    
    for (const dir of artifactDirs) {
      try {
        const files = await fm.readdir(dir);
        for (const file of files) {
          if (file.type === 'file' && file.name.endsWith('.json')) {
            // Skip metadata files for now
            continue;
          }
          
          // Try to load metadata file for this artifact
          const metadataPath = file.path.replace(/\.[^/.]+$/, '.json');
          if (await fm.exists(metadataPath)) {
            const metadataContent = await fm.readFile(metadataPath);
            try {
              const metadata: ArtifactMetadata = JSON.parse(metadataContent);
              
              // Apply filters
              if (type && metadata.type !== type) continue;
              if (tags && tags.length > 0 && metadata.tags && 
                  !tags.some(tag => metadata.tags?.includes(tag))) {
                continue;
              }
              
              artifacts.push(metadata);
            } catch (e) {
              console.warn(`Could not parse metadata for artifact ${file.path}:`, e);
            }
          } else {
            // Create basic metadata if no metadata file exists
            const basicMetadata: ArtifactMetadata = {
              id: file.name.replace(/\.[^/.]+$/, ''),
              type: getArtifactTypeFromPath(file.path),
              timestamp: file.modified.toISOString(),
              name: file.name,
              path: file.path,
            };
            
            // Apply filters
            if (type && basicMetadata.type !== type) continue;
            if (tags && tags.length > 0 && basicMetadata.tags && 
                !tags.some(tag => basicMetadata.tags?.includes(tag))) {
              continue;
            }
            
            artifacts.push(basicMetadata);
          }
        }
      } catch (e) {
        // Directory might not exist, continue to the next
        continue;
      }
    }
    
    return artifacts;
  } catch (error) {
    console.error('Error listing artifacts:', error);
    return [];
  }
}

/**
 * Deletes an artifact by its ID or path.
 * 
 * @param idOrPath - The ID or path of the artifact to delete
 * @returns Promise that resolves when the artifact is deleted
 */
export async function deleteArtifact(idOrPath: string): Promise<void> {
  try {
    const fm = getFileManager();
    
    // If idOrPath is a path, use it directly
    // If it's an ID, we need to find the corresponding path
    let path = idOrPath;
    if (!idOrPath.includes('/')) {
      // Assume it's an ID, look for the metadata file to get the path
      const possiblePaths = [
        `/artifacts/screenshots/${idOrPath}.png`,
        `/artifacts/diffs/${idOrPath}.json`,
        `/artifacts/checkpoints/${idOrPath}.json`,
        `/artifacts/exports/${idOrPath}.tsx`,
        `/artifacts/logs/${idOrPath}.json`,
      ];
      
      let found = false;
      for (const possiblePath of possiblePaths) {
        if (await fm.exists(possiblePath)) {
          path = possiblePath;
          found = true;
          break;
        }
      }
      
      if (!found) {
        throw new Error(`Artifact with ID ${idOrPath} not found`);
      }
    }
    
    // Delete the main artifact file
    await fm.delete(path);
    
    // Also delete the associated metadata file if it exists
    const metadataPath = path.replace(/\.[^/.]+$/, '.json');
    if (await fm.exists(metadataPath)) {
      await fm.delete(metadataPath);
    }
    
    console.log(`Deleted artifact: ${path}`);
  } catch (error) {
    console.error(`Error deleting artifact ${idOrPath}:`, error);
    throw error;
 }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a unique ID for an artifact.
 * 
 * @param type - Type of artifact
 * @returns A unique artifact ID
 */
function generateArtifactId(type: ArtifactType): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${type}-${timestamp}-${random}`;
}

/**
 * Gets the appropriate file extension for an artifact type.
 * 
 * @param type - The artifact type
 * @returns The file extension
 */
function getArtifactExtension(type: ArtifactType): string {
  switch (type) {
    case 'screenshot':
      return 'png';
    case 'log':
    case 'diff':
    case 'checkpoint':
    case 'session':
    case 'turn-data':
    case 'validation-report':
    case 'unknown':
      return 'json';
    case 'export':
    default:
      return 'json';
  }
}

/**
 * Gets the artifact type from a file path.
 * 
 * @param path - The file path
 * @returns The inferred artifact type
 */
function getArtifactTypeFromPath(path: string): ArtifactType {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  
  switch (ext) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'screenshot';
    case 'json':
      // More specific determination would be needed in a real system
      // For now, default to 'log' for JSON files
      return 'log';
    case 'tsx':
    case 'jsx':
    case 'js':
    case 'ts':
      return 'export';
    default:
      return 'unknown';
  }
}

/**
 * Cleans up old artifacts based on retention policy.
 * 
 * @param maxAgeDays - Maximum age of artifacts to keep (in days)
 * @param type - Optional type to clean up
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupOldArtifacts(maxAgeDays: number, type?: ArtifactType): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    
    const artifacts = await listArtifacts(type);
    const artifactsToDelete = artifacts.filter(artifact => {
      const artifactDate = new Date(artifact.timestamp);
      return artifactDate < cutoffDate;
    });
    
    for (const artifact of artifactsToDelete) {
      await deleteArtifact(artifact.id);
    }
    
    console.log(`Cleaned up ${artifactsToDelete.length} artifacts older than ${maxAgeDays} days`);
  } catch (error) {
    console.error('Error cleaning up old artifacts:', error);
    throw error;
  }
}