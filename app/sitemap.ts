import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://danirayo3d.es';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly', // O 'weekly' si actualizas proyectos a menudo
      priority: 1,
    },
    // Si tuvieras páginas individuales para proyectos en el futuro,
    // aquí podrías añadir lógica para generarlas dinámicamente.
  ];
}