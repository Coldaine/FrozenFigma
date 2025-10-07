/**
 * Token-Aware Skeleton Generation
 * 
 * This module provides functionality for generating UI skeletons that are
 * aware of the current theme tokens, ensuring consistent styling with
 * the active theme.
 */

import { TokenSet } from '../../schema';
import { getThemeManager } from '../../app/theme/themeManager';
import { tokensToCSSVariables } from '../../app/theme/themeUtils';

// ============================================================================
// TOKEN-AWARE SKELETON GENERATION
// ============================================================================

/**
 * Options for skeleton generation
 */
export interface SkeletonGenerationOptions {
  /** Number of skeleton items to generate */
  count?: number;
  /** Type of skeleton to generate */
  type?: 'card' | 'list' | 'table' | 'form' | 'image' | 'text';
  /** Additional CSS classes */
  className?: string;
  /** Whether to use theme tokens for styling */
  useTokens?: boolean;
  /** Custom token set to use (overrides current theme) */
  customTokens?: TokenSet;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Animation delay between items */
  animationDelay?: number;
}

/**
 * Generated skeleton item
 */
export interface SkeletonItem {
  /** Unique ID for the skeleton item */
  id: string;
  /** HTML element type */
  elementType: string;
  /** CSS classes for the element */
  className: string;
  /** Inline styles for the element */
  style?: Record<string, string | number>;
  /** Child skeleton items */
  children?: SkeletonItem[];
}

/**
 * Generates token-aware skeleton elements
 * 
 * @param options - Skeleton generation options
 * @returns Array of skeleton items
 */
export function generateTokenAwareSkeleton(options?: SkeletonGenerationOptions): SkeletonItem[] {
  const opts: Required<SkeletonGenerationOptions> = {
    count: options?.count || 3,
    type: options?.type || 'card',
    className: options?.className || '',
    useTokens: options?.useTokens !== false,
    customTokens: options?.customTokens,
    animationDuration: options?.animationDuration || 1000,
    animationDelay: options?.animationDelay || 200,
  };
  
  // Get tokens to use
  let tokens: TokenSet | null = null;
  
  if (opts.customTokens) {
    tokens = opts.customTokens;
  } else if (opts.useTokens) {
    tokens = getThemeManager().getCurrentTokens();
  }
  
  // Generate skeleton items based on type
  const items: SkeletonItem[] = [];
  
  for (let i = 0; i < opts.count; i++) {
    const itemId = `skeleton-${Date.now()}-${i}`;
    
    switch (opts.type) {
      case 'card':
        items.push(generateCardSkeleton(itemId, i, opts, tokens));
        break;
      case 'list':
        items.push(generateListSkeleton(itemId, i, opts, tokens));
        break;
      case 'table':
        items.push(generateTableSkeleton(itemId, i, opts, tokens));
        break;
      case 'form':
        items.push(generateFormSkeleton(itemId, i, opts, tokens));
        break;
      case 'image':
        items.push(generateImageSkeleton(itemId, i, opts, tokens));
        break;
      case 'text':
        items.push(generateTextSkeleton(itemId, i, opts, tokens));
        break;
      default:
        items.push(generateCardSkeleton(itemId, i, opts, tokens));
        break;
    }
  }
  
  return items;
}

/**
 * Generates a card skeleton
 * 
 * @param id - Item ID
 * @param index - Item index
 * @param options - Generation options
 * @param tokens - Token set to use
 * @returns Card skeleton item
 */
function generateCardSkeleton(
  id: string,
  index: number,
  options: Required<SkeletonGenerationOptions>,
  tokens: TokenSet | null
): SkeletonItem {
  // Calculate animation delay
  const delay = index * options.animationDelay;
  
  // Create base card element
  const card: SkeletonItem = {
    id: `${id}-card`,
    elementType: 'div',
    className: `skeleton-card ${options.className}`,
    style: {
      animationDuration: `${options.animationDuration}ms`,
      animationDelay: `${delay}ms`,
      borderRadius: tokens?.radius?.md ? `${tokens.radius.md}px` : '6px',
      backgroundColor: tokens?.colors?.['bg-surface'] || '#f8fafc',
      border: tokens?.colors?.['border-base'] ? `1px solid ${tokens.colors['border-base']}` : '1px solid #e2e8f0',
    },
    children: [
      // Image placeholder
      {
        id: `${id}-image`,
        elementType: 'div',
        className: 'skeleton-image',
        style: {
          height: '150px',
          backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
          borderRadius: tokens?.radius?.md ? `${tokens.radius.md}px` : '6px',
          marginBottom: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
        },
      },
      // Content container
      {
        id: `${id}-content`,
        elementType: 'div',
        className: 'skeleton-content',
        style: {
          padding: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
        },
        children: [
          // Title placeholder
          {
            id: `${id}-title`,
            elementType: 'div',
            className: 'skeleton-title',
            style: {
              height: '24px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              marginBottom: tokens?.spacing?.sm ? `${tokens.spacing.sm}px` : '12px',
              width: '70%',
            },
          },
          // Description placeholder
          {
            id: `${id}-description`,
            elementType: 'div',
            className: 'skeleton-description',
            style: {
              height: '16px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              marginBottom: tokens?.spacing?.xs ? `${tokens.spacing.xs}px` : '8px',
              width: '90%',
            },
          },
          {
            id: `${id}-description-2`,
            elementType: 'div',
            className: 'skeleton-description',
            style: {
              height: '16px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              width: '60%',
            },
          },
        ],
      },
    ],
  };
  
  return card;
}

/**
 * Generates a list skeleton
 * 
 * @param id - Item ID
 * @param index - Item index
 * @param options - Generation options
 * @param tokens - Token set to use
 * @returns List skeleton item
 */
function generateListSkeleton(
  id: string,
  index: number,
  options: Required<SkeletonGenerationOptions>,
  tokens: TokenSet | null
): SkeletonItem {
  // Calculate animation delay
  const delay = index * options.animationDelay;
  
  // Create list container
  const list: SkeletonItem = {
    id: `${id}-list`,
    elementType: 'div',
    className: `skeleton-list ${options.className}`,
    style: {
      animationDuration: `${options.animationDuration}ms`,
      animationDelay: `${delay}ms`,
    },
    children: [],
  };
  
  // Add list items
  for (let i = 0; i < 5; i++) {
    list.children?.push({
      id: `${id}-item-${i}`,
      elementType: 'div',
      className: 'skeleton-list-item',
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
        borderBottom: tokens?.colors?.['border-base'] ? `1px solid ${tokens.colors['border-base']}` : '1px solid #e2e8f0',
      },
      children: [
        // Avatar placeholder
        {
          id: `${id}-avatar-${i}`,
          elementType: 'div',
          className: 'skeleton-avatar',
          style: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
            marginRight: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
          },
        },
        // Text container
        {
          id: `${id}-text-${i}`,
          elementType: 'div',
          className: 'skeleton-text-container',
          style: {
            flex: 1,
          },
          children: [
            {
              id: `${id}-text-${i}-title`,
              elementType: 'div',
              className: 'skeleton-text-title',
              style: {
                height: '16px',
                backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
                borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
                marginBottom: tokens?.spacing?.xs ? `${tokens.spacing.xs}px` : '8px',
                width: `${70 + Math.random() * 20}%`,
              },
            },
            {
              id: `${id}-text-${i}-subtitle`,
              elementType: 'div',
              className: 'skeleton-text-subtitle',
              style: {
                height: '14px',
                backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
                borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
                width: `${50 + Math.random() * 30}%`,
              },
            },
          ],
        },
      ],
    });
  }
  
  return list;
}

/**
 * Generates a table skeleton
 * 
 * @param id - Item ID
 * @param index - Item index
 * @param options - Generation options
 * @param tokens - Token set to use
 * @returns Table skeleton item
 */
function generateTableSkeleton(
  id: string,
  index: number,
  options: Required<SkeletonGenerationOptions>,
  tokens: TokenSet | null
): SkeletonItem {
  // Calculate animation delay
  const delay = index * options.animationDelay;
  
  // Create table container
  const table: SkeletonItem = {
    id: `${id}-table`,
    elementType: 'div',
    className: `skeleton-table ${options.className}`,
    style: {
      animationDuration: `${options.animationDuration}ms`,
      animationDelay: `${delay}ms`,
      border: tokens?.colors?.['border-base'] ? `1px solid ${tokens.colors['border-base']}` : '1px solid #e2e8f0',
      borderRadius: tokens?.radius?.md ? `${tokens.radius.md}px` : '6px',
      overflow: 'hidden',
    },
    children: [
      // Table header
      {
        id: `${id}-header`,
        elementType: 'div',
        className: 'skeleton-table-header',
        style: {
          display: 'flex',
          backgroundColor: tokens?.colors?.['bg-surface'] || '#f8fafc',
          padding: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
          borderBottom: tokens?.colors?.['border-base'] ? `1px solid ${tokens.colors['border-base']}` : '1px solid #e2e8f0',
        },
        children: [
          {
            id: `${id}-header-cell-1`,
            elementType: 'div',
            className: 'skeleton-header-cell',
            style: {
              flex: 1,
              height: '20px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              width: '25%',
            },
          },
          {
            id: `${id}-header-cell-2`,
            elementType: 'div',
            className: 'skeleton-header-cell',
            style: {
              flex: 1,
              height: '20px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              width: '35%',
              marginLeft: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
            },
          },
          {
            id: `${id}-header-cell-3`,
            elementType: 'div',
            className: 'skeleton-header-cell',
            style: {
              flex: 1,
              height: '20px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              width: '20%',
              marginLeft: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
            },
          },
          {
            id: `${id}-header-cell-4`,
            elementType: 'div',
            className: 'skeleton-header-cell',
            style: {
              flex: 1,
              height: '20px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              width: '20%',
              marginLeft: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
            },
          },
        ],
      },
      // Table body
      {
        id: `${id}-body`,
        elementType: 'div',
        className: 'skeleton-table-body',
        children: [],
      },
    ],
  };
  
  // Add table rows
  const body = table.children?.[1];
  if (body) {
    for (let i = 0; i < 5; i++) {
      body.children?.push({
        id: `${id}-row-${i}`,
        elementType: 'div',
        className: 'skeleton-table-row',
        style: {
          display: 'flex',
          padding: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
          borderBottom: tokens?.colors?.['border-base'] ? `1px solid ${tokens.colors['border-base']}` : '1px solid #e2e8f0',
        },
        children: [
          {
            id: `${id}-cell-${i}-1`,
            elementType: 'div',
            className: 'skeleton-cell',
            style: {
              flex: 1,
              height: '16px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              width: '25%',
            },
          },
          {
            id: `${id}-cell-${i}-2`,
            elementType: 'div',
            className: 'skeleton-cell',
            style: {
              flex: 1,
              height: '16px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              width: '35%',
              marginLeft: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
            },
          },
          {
            id: `${id}-cell-${i}-3`,
            elementType: 'div',
            className: 'skeleton-cell',
            style: {
              flex: 1,
              height: '16px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              width: '20%',
              marginLeft: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
            },
          },
          {
            id: `${id}-cell-${i}-4`,
            elementType: 'div',
            className: 'skeleton-cell',
            style: {
              flex: 1,
              height: '16px',
              backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
              borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
              width: '20%',
              marginLeft: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
            },
          },
        ],
      });
    }
  }
  
  return table;
}

/**
 * Generates a form skeleton
 * 
 * @param id - Item ID
 * @param index - Item index
 * @param options - Generation options
 * @param tokens - Token set to use
 * @returns Form skeleton item
 */
function generateFormSkeleton(
  id: string,
  index: number,
  options: Required<SkeletonGenerationOptions>,
  tokens: TokenSet | null
): SkeletonItem {
  // Calculate animation delay
  const delay = index * options.animationDelay;
  
  // Create form container
  const form: SkeletonItem = {
    id: `${id}-form`,
    elementType: 'div',
    className: `skeleton-form ${options.className}`,
    style: {
      animationDuration: `${options.animationDuration}ms`,
      animationDelay: `${delay}ms`,
      padding: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
    },
    children: [],
  };
  
  // Add form fields
  const fieldTypes = ['text', 'email', 'password', 'textarea'];
  
  for (let i = 0; i < 4; i++) {
    const fieldType = fieldTypes[i % fieldTypes.length];
    
    form.children?.push({
      id: `${id}-field-${i}`,
      elementType: 'div',
      className: 'skeleton-form-field',
      style: {
        marginBottom: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
      },
      children: [
        // Label placeholder
        {
          id: `${id}-label-${i}`,
          elementType: 'div',
          className: 'skeleton-label',
          style: {
            height: '14px',
            backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
            borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
            marginBottom: tokens?.spacing?.xs ? `${tokens.spacing.xs}px` : '8px',
            width: `${40 + Math.random() * 20}%`,
          },
        },
        // Input placeholder
        {
          id: `${id}-input-${i}`,
          elementType: 'div',
          className: 'skeleton-input',
          style: {
            height: fieldType === 'textarea' ? '80px' : '40px',
            backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
            borderRadius: tokens?.radius?.md ? `${tokens.radius.md}px` : '6px',
            border: tokens?.colors?.['border-base'] ? `1px solid ${tokens.colors['border-base']}` : '1px solid #e2e8f0',
          },
        },
      ],
    });
  }
  
  // Add submit button
  form.children?.push({
    id: `${id}-submit`,
    elementType: 'div',
    className: 'skeleton-submit-button',
    style: {
      height: '40px',
      backgroundColor: tokens?.colors?.primary || '#3b82f6',
      borderRadius: tokens?.radius?.md ? `${tokens.radius.md}px` : '6px',
      width: '120px',
      marginTop: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
    },
  });
  
  return form;
}

/**
 * Generates an image skeleton
 * 
 * @param id - Item ID
 * @param index - Item index
 * @param options - Generation options
 * @param tokens - Token set to use
 * @returns Image skeleton item
 */
function generateImageSkeleton(
  id: string,
  index: number,
  options: Required<SkeletonGenerationOptions>,
  tokens: TokenSet | null
): SkeletonItem {
  // Calculate animation delay
  const delay = index * options.animationDelay;
  
  // Create image container
  const image: SkeletonItem = {
    id: `${id}-image`,
    elementType: 'div',
    className: `skeleton-image-container ${options.className}`,
    style: {
      animationDuration: `${options.animationDuration}ms`,
      animationDelay: `${delay}ms`,
      width: '100%',
      height: '200px',
      backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
      borderRadius: tokens?.radius?.md ? `${tokens.radius.md}px` : '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    children: [
      {
        id: `${id}-image-placeholder`,
        elementType: 'div',
        className: 'skeleton-image-placeholder',
        style: {
          width: '60px',
          height: '60px',
          backgroundColor: tokens?.colors?.['bg-surface'] || '#f8fafc',
          borderRadius: '50%',
        },
      },
    ],
  };
  
  return image;
}

/**
 * Generates a text skeleton
 * 
 * @param id - Item ID
 * @param index - Item index
 * @param options - Generation options
 * @param tokens - Token set to use
 * @returns Text skeleton item
 */
function generateTextSkeleton(
  id: string,
  index: number,
  options: Required<SkeletonGenerationOptions>,
  tokens: TokenSet | null
): SkeletonItem {
  // Calculate animation delay
  const delay = index * options.animationDelay;
  
  // Create text container
  const text: SkeletonItem = {
    id: `${id}-text`,
    elementType: 'div',
    className: `skeleton-text-container ${options.className}`,
    style: {
      animationDuration: `${options.animationDuration}ms`,
      animationDelay: `${delay}ms`,
      padding: tokens?.spacing?.md ? `${tokens.spacing.md}px` : '16px',
    },
    children: [],
  };
  
  // Add text lines
  for (let i = 0; i < 5; i++) {
    text.children?.push({
      id: `${id}-line-${i}`,
      elementType: 'div',
      className: 'skeleton-text-line',
      style: {
        height: '16px',
        backgroundColor: tokens?.colors?.['bg-base'] || '#ffffff',
        borderRadius: tokens?.radius?.sm ? `${tokens.radius.sm}px` : '4px',
        marginBottom: tokens?.spacing?.sm ? `${tokens.spacing.sm}px` : '12px',
        width: i === 0 ? '90%' : i === 4 ? '70%' : `${80 + Math.random() * 15}%`,
      },
    });
  }
  
  return text;
}

/**
 * Converts skeleton items to HTML string
 * 
 * @param items - Skeleton items to convert
 * @returns HTML string representation
 */
export function skeletonItemsToHTML(items: SkeletonItem[]): string {
  let html = '';
  
  for (const item of items) {
    html += skeletonItemToHTML(item);
  }
  
  return html;
}

/**
 * Converts a skeleton item to HTML string
 * 
 * @param item - Skeleton item to convert
 * @returns HTML string representation
 */
function skeletonItemToHTML(item: SkeletonItem): string {
  let styleString = '';
  
  if (item.style) {
    styleString = Object.entries(item.style)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }
  
  let html = `<${item.elementType} id="${item.id}" class="${item.className}"`;
  
  if (styleString) {
    html += ` style="${styleString}"`;
  }
  
  html += '>';
  
  if (item.children) {
    for (const child of item.children) {
      html += skeletonItemToHTML(child);
    }
  }
  
  html += `</${item.elementType}>`;
  
  return html;
}

/**
 * Applies skeleton CSS to the document
 * 
 * @param tokens - Token set to use for styling
 */
export function applySkeletonCSS(tokens: TokenSet | null = null): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  // Get tokens if not provided
  if (!tokens) {
    tokens = getThemeManager().getCurrentTokens();
  }
  
  // Create or update skeleton styles
  let styleElement = document.getElementById('skeleton-styles') as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'skeleton-styles';
    document.head.appendChild(styleElement);
  }
  
  // Generate CSS with tokens
  const css = generateSkeletonCSS(tokens);
  styleElement.textContent = css;
}

/**
 * Generates skeleton CSS with tokens
 * 
 * @param tokens - Token set to use for styling
 * @returns CSS string
 */
function generateSkeletonCSS(tokens: TokenSet | null): string {
  // Default values if no tokens provided
  const bgColor = tokens?.colors?.['bg-base'] || '#ffffff';
  const surfaceColor = tokens?.colors?.['bg-surface'] || '#f8fafc';
  const borderColor = tokens?.colors?.['border-base'] || '#e2e8f0';
  const primaryColor = tokens?.colors?.primary || '#3b82f6';
  const borderRadius = tokens?.radius?.md || 6;
  const animationDuration = tokens?.transitions?.['duration-normal'] || 1000;
  
  return `
    @keyframes skeleton-pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
      100% {
        opacity: 1;
      }
    }
    
    .skeleton-card,
    .skeleton-list,
    .skeleton-table,
    .skeleton-form,
    .skeleton-image-container,
    .skeleton-text-container {
      animation: skeleton-pulse ${animationDuration}ms ease-in-out infinite;
      background-color: ${surfaceColor};
      border-radius: ${borderRadius}px;
    }
    
    .skeleton-card {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid ${borderColor};
    }
    
    .skeleton-image,
    .skeleton-title,
    .skeleton-description,
    .skeleton-avatar,
    .skeleton-text-title,
    .skeleton-text-subtitle,
    .skeleton-header-cell,
    .skeleton-cell,
    .skeleton-label,
    .skeleton-input,
    .skeleton-submit-button,
    .skeleton-image-placeholder,
    .skeleton-text-line {
      background-color: ${bgColor};
      border-radius: ${borderRadius / 2}px;
    }
    
    .skeleton-submit-button {
      background-color: ${primaryColor};
    }
    
    .skeleton-list-item {
      border-bottom: 1px solid ${borderColor};
    }
    
    .skeleton-table-header {
      background-color: ${surfaceColor};
      border-bottom: 1px solid ${borderColor};
    }
    
    .skeleton-table-row {
      border-bottom: 1px solid ${borderColor};
    }
  `;
}

/**
 * Removes skeleton CSS from the document
 */
export function removeSkeletonCSS(): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  const styleElement = document.getElementById('skeleton-styles');
  if (styleElement) {
    styleElement.remove();
  }
}