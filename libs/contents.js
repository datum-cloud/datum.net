import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import markdownit from 'markdown-it';
  
const contentsDir = path.join(process.cwd(), 'content');

export function getPages() {
  const pageDir = contentsDir + '/pages';
  const fileNames = fs.readdirSync(pageDir);
  const md = markdownit();

  var pages = {};

  fileNames.forEach((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const filePath = path.join(pageDir, fileName);

    if (!fs.lstatSync(filePath).isDirectory()) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      pages[slug] = {
        ...data,
        content: md.render(content),
      }
    }
  })

  return pages;
}

export function getBlogs() {
  const blogDir = contentsDir + '/blog';
  const fileNames = fs.readdirSync(blogDir);

  return fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const filePath = path.join(blogDir, fileName);

    if (!fs.lstatSync(filePath).isDirectory()) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
    
      return {
        slug,
        ...data,
        content,
      };
    }
  });
}