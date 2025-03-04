import { client } from '@/sanity/lib/client'

import { getBlogs, getChangelogs, getPages } from "@/libs/contents"
import { docsSource, guidesSource } from '@/libs/source';

async function getEvents () {
  const events = await client.fetch('*[_type == "event"]')
  return events
}
export default async function sitemap() {
  const blogs = getBlogs()
  const changelogs = getChangelogs()
  const pages = getPages()
  const docs = docsSource.getPages()
  const guides = guidesSource.getPages()
  const events = await getEvents()

  var sitemaps = []

  // Docs
  sitemaps.push({
    url: process.env.APP_URL + '/doc',
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 1,
  });
  docs.forEach((doc) => {
    sitemaps.push({
      url: process.env.APP_URL + doc.url,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    });
  });

  // Guides
  sitemaps.push({
    url: process.env.APP_URL + '/guide',
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 1,
  });
  guides.forEach((guide) => {
    sitemaps.push({
      url: process.env.APP_URL + guide.url,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    });
  });

  // Events
  sitemaps.push({
    url: process.env.APP_URL + '/events',
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 1,
  });
  events.forEach((event) => {
    sitemaps.push({
      url: process.env.APP_URL + `/events/` + event.slug.current,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    });
  });

  // Static pages
  Object.keys(pages).forEach((page) => {
    if (page !== 'home') {
      sitemaps.push({
        url: 'http://localhost:3000/' + page,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      });
    }
  })

  // Blogs
  blogs.forEach((blog) => {
    sitemaps.push({
      url: 'http://localhost:3000/blog/' + blog.slug,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    });
  });

  // Changelog
  changelogs.forEach((log) => {
    sitemaps.push({
      url: 'http://localhost:3000/changelog/' + log.slug,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    });
  });

  return sitemaps
}