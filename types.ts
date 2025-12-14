export interface ReferenceImage {
  file: File;
  previewUrl: string;
  type: 'character' | 'structure';
}

export interface GeneratedResult {
  imageUrl?: string;
  text?: string;
}

// Augment window for the specialized AI Studio API key flow
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}