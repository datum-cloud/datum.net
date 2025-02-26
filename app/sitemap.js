import { getBlogs } from "@/libs/contents"

export default function sitemap() {
  const blogs = getBlogs();

  var sitemaps = [
      {
        url: 'http://localhost:3000/',
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 1,
      },
      {
        url: 'http://localhost:3000/about',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: 'http://localhost:3000/blog',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      {
        url: 'http://localhost:3000/changelog',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
    ]

  blogs.forEach((blog) => {
    sitemaps.push({
      url: 'http://localhost:3000/blog/' + blog.slug,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    });
  });

  return sitemaps
}