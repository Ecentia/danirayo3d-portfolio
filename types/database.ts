// types/database.ts
export interface Project {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  thumbnail_url: string;
  display_order: number;
}

export interface GalleryImage {
  id: string;
  project_id: string;
  image_url: string;
  display_order: number;
}

// Tipo compuesto para la vista detallada
export interface FullProjectData extends Project {
  gallery: GalleryImage[];
}