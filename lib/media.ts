// lib/media.ts
// Detección del tipo de medio a partir de la URL pública de Supabase Storage.
// No guardamos el tipo en base de datos: la extensión del fichero subido es
// suficiente y así las filas de galería ya existentes siguen funcionando sin migración.

export type MediaKind = 'image' | 'video';

export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogv', 'm4v', 'mov'] as const;

// Lista explícita para el atributo accept: algunos navegadores no reportan
// bien el MIME de .mov/.m4v, así que aceptamos también por extensión.
export const VIDEO_ACCEPT = '.mp4,.webm,.ogv,.m4v,.mov,video/mp4,video/webm,video/ogg,video/quicktime';

// Límite por defecto de un bucket de Supabase Storage. Validamos en cliente
// para dar un error legible en vez de un fallo genérico de red al subir.
export const MAX_VIDEO_SIZE_MB = 50;

const getExtension = (name: string): string => {
  // Supabase añade query params (?t=...) a algunas URLs públicas
  const path = name.split(/[?#]/)[0];
  const lastSegment = path.split('/').pop() || '';
  const dotIndex = lastSegment.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return lastSegment.slice(dotIndex + 1).toLowerCase();
};

export const isVideoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return (VIDEO_EXTENSIONS as readonly string[]).includes(getExtension(url));
};

export const getMediaKind = (url: string | null | undefined): MediaKind =>
  isVideoUrl(url) ? 'video' : 'image';

export const isVideoFile = (file: File): boolean =>
  file.type.startsWith('video/') ||
  (VIDEO_EXTENSIONS as readonly string[]).includes(getExtension(file.name));

// El fragmento temporal fuerza a los navegadores a pintar el primer fotograma
// como previsualización aunque el vídeo no se haya reproducido todavía.
export const getVideoPreviewSrc = (url: string): string =>
  url.includes('#') ? url : `${url}#t=0.1`;
