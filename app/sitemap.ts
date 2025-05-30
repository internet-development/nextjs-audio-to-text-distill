import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://wireframes.internet.dev/offline',
      lastModified: new Date(),
    },
  ];
}
