// ============================================================================
// FILE MANAGEMENT UTILITIES
// ============================================================================

/**
 * Options for file operations.
 */
export interface FileOperationOptions {
  encoding?: BufferEncoding;
  recursive?: boolean; // For directory operations
  overwrite?: boolean; // Whether to overwrite existing files
}

/**
 * Represents file metadata.
 */
export interface FileMetadata {
  name: string;
 path: string;
  size: number;
  modified: Date;
  type: 'file' | 'directory';
}

/**
 * Interface for file system operations that abstracts browser vs Node environments.
 */
export interface FileManager {
  /**
   * Reads a file and returns its content.
   * @param path - Path to the file
   * @param options - Operation options
   * @returns Promise that resolves to the file content
   */
  readFile(path: string, options?: FileOperationOptions): Promise<string>;

  /**
   * Writes content to a file.
   * @param path - Path to the file
   * @param content - Content to write
   * @param options - Operation options
   * @returns Promise that resolves when the file is written
   */
  writeFile(path: string, content: string, options?: FileOperationOptions): Promise<void>;

  /**
   * Checks if a file or directory exists.
   * @param path - Path to check
   * @returns Promise that resolves to true if the path exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Deletes a file or directory.
   * @param path - Path to delete
   * @returns Promise that resolves when the deletion is complete
   */
  delete(path: string): Promise<void>;

  /**
   * Creates a directory.
   * @param path - Path of the directory to create
   * @param options - Operation options
   * @returns Promise that resolves when the directory is created
   */
  mkdir(path: string, options?: FileOperationOptions): Promise<void>;

  /**
   * Lists files in a directory.
   * @param path - Path of the directory to list
   * @returns Promise that resolves to an array of file metadata
   */
  readdir(path: string): Promise<FileMetadata[]>;

  /**
   * Copies a file or directory.
   * @param src - Source path
   * @param dest - Destination path
   * @returns Promise that resolves when the copy is complete
   */
  copy(src: string, dest: string): Promise<void>;

  /**
   * Moves a file or directory.
   * @param src - Source path
   * @param dest - Destination path
   * @returns Promise that resolves when the move is complete
   */
  move(src: string, dest: string): Promise<void>;
}

// ============================================================================
// BROWSER FILE MANAGER IMPLEMENTATION
// ============================================================================

/**
 * Implementation of FileManager for browser environments.
 * Uses localStorage and the File System Access API where available.
 */
export class BrowserFileManager implements FileManager {
  /**
   * Reads a file from browser storage.
   * @param path - Path to the file
   * @param options - Operation options
   * @returns Promise that resolves to the file content
   */
  async readFile(path: string, _options?: FileOperationOptions): Promise<string> {
    void _options;
    // In browser, we'll use localStorage to simulate file system
    const key = this.getPathKey(path);
    const content = localStorage.getItem(key);
    
    if (content === null) {
      throw new Error(`File not found: ${path}`);
    }
    
    return content;
  }

 /**
   * Writes content to a file in browser storage.
   * @param path - Path to the file
   * @param content - Content to write
   * @param options - Operation options
   * @returns Promise that resolves when the file is written
   */
  async writeFile(path: string, content: string, options?: FileOperationOptions): Promise<void> {
    const key = this.getPathKey(path);
    
    // Check if file exists and overwrite option
    if (!options?.overwrite && localStorage.getItem(key) !== null) {
      throw new Error(`File already exists: ${path}. Use overwrite option to replace.`);
    }
    
    localStorage.setItem(key, content);
  }

  /**
   * Checks if a file or directory exists in browser storage.
   * @param path - Path to check
   * @returns Promise that resolves to true if the path exists
   */
  async exists(path: string): Promise<boolean> {
    const key = this.getPathKey(path);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Deletes a file from browser storage.
   * @param path - Path to delete
   * @returns Promise that resolves when the deletion is complete
   */
  async delete(path: string): Promise<void> {
    const key = this.getPathKey(path);
    localStorage.removeItem(key);
  }

  /**
   * Creates a directory in browser storage (simulated).
   * @param path - Path of the directory to create
   * @param options - Operation options
   * @returns Promise that resolves when the directory is created
   */
  async mkdir(path: string, _options?: FileOperationOptions): Promise<void> {
    void _options;
    // In browser storage, we simulate directories by creating a marker
    const dirKey = this.getPathKey(path) + '/__dir_marker__';
    localStorage.setItem(dirKey, 'directory');
  }

  /**
   * Lists files in a simulated directory.
   * @param path - Path of the directory to list
   * @returns Promise that resolves to an array of file metadata
   */
  async readdir(path: string): Promise<FileMetadata[]> {
    const pathPrefix = this.getPathKey(path) + '/';
    const files: FileMetadata[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(pathPrefix)) {
        // Skip directory markers
        if (key.endsWith('/__dir_marker__')) continue;
        
        const relativePath = key.substring(pathPrefix.length);
        const isDir = localStorage.getItem(key + '/__dir_marker__') !== null;
        
        // Only get the first level (not recursive for now)
        const pathParts = relativePath.split('/');
        if (pathParts.length > 1) continue; // Skip nested items
        
        files.push({
          name: relativePath,
          path: key,
          size: localStorage.getItem(key)?.length || 0,
          modified: new Date(), // Browser doesn't track file modification time
          type: isDir ? 'directory' : 'file'
        });
      }
    }
    
    return files;
  }

  /**
   * Copies a file in browser storage.
   * @param src - Source path
   * @param dest - Destination path
   * @returns Promise that resolves when the copy is complete
   */
  async copy(src: string, dest: string): Promise<void> {
    const srcKey = this.getPathKey(src);
    const content = localStorage.getItem(srcKey);
    
    if (content === null) {
      throw new Error(`Source file not found: ${src}`);
    }
    
    await this.writeFile(dest, content);
  }

  /**
   * Moves a file in browser storage.
   * @param src - Source path
   * @param dest - Destination path
   * @returns Promise that resolves when the move is complete
   */
  async move(src: string, dest: string): Promise<void> {
    await this.copy(src, dest);
    await this.delete(src);
  }

  /**
   * Converts a file path to a localStorage key.
   * @param path - The file path
   * @returns The localStorage key
   */
  private getPathKey(path: string): string {
    // Normalize path to use forward slashes and remove leading slash
    return path.replace(/\\/g, '/').replace(/^\//, '');
  }
}

// ============================================================================
// NODE FILE MANAGER IMPLEMENTATION (Simulated for browser)
// ============================================================================

/**
 * A simulated Node FileManager for browser environments.
 * This provides the same interface as a Node.js file system but uses browser APIs.
 */
export class SimulatedNodeFileManager implements FileManager {
  private fileStorage: Map<string, string> = new Map();
 private dirStorage: Set<string> = new Set();

  constructor() {
    // Initialize with some default directories
    this.dirStorage.add('/');
    this.dirStorage.add('/projects');
    this.dirStorage.add('/exports');
    this.dirStorage.add('/checkpoints');
    this.dirStorage.add('/logs');
    this.dirStorage.add('/artifacts');
  }

  async readFile(path: string, _options?: FileOperationOptions): Promise<string> {
    void _options;
    const normalizedPath = this.normalizePath(path);
    
    if (!this.fileStorage.has(normalizedPath)) {
      throw new Error(`File not found: ${path}`);
    }
    
    return this.fileStorage.get(normalizedPath) || '';
  }

 async writeFile(path: string, content: string, options?: FileOperationOptions): Promise<void> {
    const normalizedPath = this.normalizePath(path);
    
    // Check if file exists and overwrite option
    if (!options?.overwrite && this.fileStorage.has(normalizedPath)) {
      throw new Error(`File already exists: ${path}. Use overwrite option to replace.`);
    }
    
    // Create parent directories if they don't exist
    const pathParts = normalizedPath.split('/').filter(part => part !== '');
    let currentPath = '';
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath += '/' + pathParts[i];
      this.dirStorage.add(currentPath);
    }
    
    this.fileStorage.set(normalizedPath, content);
  }

  async exists(path: string): Promise<boolean> {
    const normalizedPath = this.normalizePath(path);
    return this.fileStorage.has(normalizedPath) || this.dirStorage.has(normalizedPath);
  }

  async delete(path: string): Promise<void> {
    const normalizedPath = this.normalizePath(path);
    
    if (this.fileStorage.has(normalizedPath)) {
      this.fileStorage.delete(normalizedPath);
    } else if (this.dirStorage.has(normalizedPath)) {
      // Delete directory and all its contents
      this.dirStorage.delete(normalizedPath);
      const filesToDelete: string[] = [];
      
      for (const file of this.fileStorage.keys()) {
        if (file.startsWith(normalizedPath + '/')) {
          filesToDelete.push(file);
        }
      }
      
      for (const file of filesToDelete) {
        this.fileStorage.delete(file);
      }
    } else {
      throw new Error(`Path not found: ${path}`);
    }
  }

  async mkdir(path: string, options?: FileOperationOptions): Promise<void> {
    const normalizedPath = this.normalizePath(path);
    
    if (this.dirStorage.has(normalizedPath)) {
      if (!options?.recursive) {
        throw new Error(`Directory already exists: ${path}`);
      }
      return;
    }
    
    if (options?.recursive) {
      // Create parent directories if needed
      const pathParts = normalizedPath.split('/').filter(part => part !== '');
      let currentPath = '';
      
      for (const part of pathParts) {
        currentPath += '/' + part;
        this.dirStorage.add(currentPath);
      }
    } else {
      // Just create this directory
      this.dirStorage.add(normalizedPath);
    }
  }

 async readdir(path: string): Promise<FileMetadata[]> {
    const normalizedPath = this.normalizePath(path);
    const files: FileMetadata[] = [];
    
    // Find all files and directories that are direct children of the path
    for (const file of this.fileStorage.keys()) {
      if (file.startsWith(normalizedPath + '/') && !file.substring(normalizedPath.length + 1).includes('/')) {
        files.push({
          name: file.substring(normalizedPath.length + 1),
          path: file,
          size: this.fileStorage.get(file)?.length || 0,
          modified: new Date(),
          type: 'file'
        });
      }
    }
    
    for (const dir of this.dirStorage) {
      if (dir.startsWith(normalizedPath + '/') && !dir.substring(normalizedPath.length + 1).includes('/')) {
        files.push({
          name: dir.substring(normalizedPath.length + 1),
          path: dir,
          size: 0,
          modified: new Date(),
          type: 'directory'
        });
      }
    }
    
    return files;
  }

 async copy(src: string, dest: string): Promise<void> {
    const srcPath = this.normalizePath(src);
    const destPath = this.normalizePath(dest);
    
    if (!this.fileStorage.has(srcPath)) {
      throw new Error(`Source file not found: ${src}`);
    }
    
    const content = this.fileStorage.get(srcPath);
    if (content !== undefined) {
      await this.writeFile(destPath, content);
    }
  }

  async move(src: string, dest: string): Promise<void> {
    await this.copy(src, dest);
    await this.delete(src);
  }

  private normalizePath(path: string): string {
    // Remove leading slash and normalize to forward slashes
    return path.replace(/\\/g, '/').replace(/^\//, '');
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the appropriate file manager based on the environment.
 * @returns A FileManager instance
 */
export function getFileManager(): FileManager {
  // In a browser environment, return the browser file manager
  if (typeof window !== 'undefined') {
    return new SimulatedNodeFileManager();
  }
  
  // In a Node.js environment, we would return a Node.js file manager
  // For now, return the simulated one
  return new SimulatedNodeFileManager();
}

/**
 * Creates a project directory structure.
 * @param projectName - Name of the project
 * @returns Promise that resolves when the project structure is created
 */
export async function createProjectStructure(projectName: string): Promise<void> {
  const fm = getFileManager();
  
  // Create the main project directory
  await fm.mkdir(`/projects/${projectName}`);
  
  // Create subdirectories
  await fm.mkdir(`/projects/${projectName}/ui`, { recursive: true });
  await fm.mkdir(`/projects/${projectName}/exports`, { recursive: true });
  await fm.mkdir(`/projects/${projectName}/checkpoints`, { recursive: true });
  await fm.mkdir(`/projects/${projectName}/logs`, { recursive: true });
  await fm.mkdir(`/projects/${projectName}/artifacts`, { recursive: true });
}

/**
 * Saves a file with error handling.
 * @param path - Path to save the file
 * @param content - Content to save
 * @param options - Operation options
 * @returns Promise that resolves to true if successful
 */
export async function safeSaveFile(path: string, content: string, options?: FileOperationOptions): Promise<boolean> {
  try {
    const fm = getFileManager();
    await fm.writeFile(path, content, options);
    return true;
  } catch (error) {
    console.error(`Failed to save file ${path}:`, error);
    return false;
  }
}

/**
 * Loads a file with error handling.
 * @param path - Path to load the file from
 * @param defaultValue - Default value to return if file doesn't exist
 * @returns Promise that resolves to the file content or default value
 */
export async function safeLoadFile(path: string, defaultValue: string = ''): Promise<string> {
  try {
    const fm = getFileManager();
    return await fm.readFile(path);
  } catch (error) {
    console.error(`Failed to load file ${path}:`, error);
    return defaultValue;
  }
}

/**
 * Gets file extension from a path.
 * @param path - File path
 * @returns The file extension or empty string
 */
export function getFileExtension(path: string): string {
  const lastDotIndex = path.lastIndexOf('.');
  return lastDotIndex > 0 ? path.substring(lastDotIndex + 1).toLowerCase() : '';
}

/**
 * Gets file name from a path.
 * @param path - File path
 * @returns The file name without path
 */
export function getFileName(path: string): string {
  const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;
}

/**
 * Validates a file path for security.
 * @param path - Path to validate
 * @returns True if path is valid, false otherwise
 */
export function isValidPath(path: string): boolean {
  // Check for path traversal attempts
  if (path.includes('../') || path.includes('..\\') || path.startsWith('..')) {
    return false;
  }
  
  // Check for null bytes
  if (path.includes('\0')) {
    return false;
  }
  
  return true;
}

/**
 * Creates a unique file name by appending a number if the file already exists.
 * @param basePath - Base path to check
 * @param fm - FileManager instance
 * @returns A unique file path
 */
export async function createUniqueFileName(basePath: string, fm: FileManager): Promise<string> {
  if (!(await fm.exists(basePath))) {
    return basePath;
  }
  
 const pathParts = basePath.split('.');
  const extension = pathParts.length > 1 ? '.' + pathParts.pop() : '';
  const baseName = pathParts.join('.');
  
  let counter = 1;
  let uniquePath = `${baseName}_${counter}${extension}`;
  
  while (await fm.exists(uniquePath)) {
    counter++;
    uniquePath = `${baseName}_${counter}${extension}`;
  }
  
  return uniquePath;
}