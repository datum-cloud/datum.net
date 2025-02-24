const _ = require('lodash')
const path = require(`path`)

const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPostTemplate = path.resolve(`./src/templates/blog-post.js`)
  const blogListTemplate = path.resolve(`./src/templates/blog.js`)
  const aboutTemplate = path.resolve(`./src/templates/about.js`)
  const contactTemplate = path.resolve(`./src/templates/contact.js`)
  const changelogListTemplate = path.resolve(`./src/templates/changelog.js`)
  const homepageTemplate = path.resolve(`./src/templates/homepage.js`)
  const pageTemplate = path.resolve(`./src/templates/page.js`)
  // const previewTemplate = path.resolve(`./src/pages/preview.js`)

  const result = await graphql(`
    query {
      allMdx(
        sort: { frontmatter: { date: ASC } }
        filter: { 
          frontmatter: { title: { ne: "" } }
        }
      ) {
        edges {
          node {
            id
            frontmatter {
              slug
              status
            }
            internal {
              contentFilePath
            }
          }
        }
      }
      blog: allMdx(
        filter: {
          internal: {contentFilePath: {regex: "/blog/"  } }
        }
      ) {
        edges {
          node {
            id
            frontmatter {
              slug
              status
            }
            internal {
              contentFilePath
            }
          }
        }
      }
      pages: allMdx(
        filter: {
          internal: {contentFilePath: {regex: "/pages/"  } }
        }
      ) {
        edges {
          node {
            id
            frontmatter {
              slug
            }
            internal {
              contentFilePath
            }
          }
        }
      }
      changelog: allMdx(
        filter: {
          internal: {contentFilePath: {regex: "/changelog/"  } }
        }
      ) {
        edges {
          node {
            id
            frontmatter {
              slug
              status
            }
            internal {
              contentFilePath
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  // console.log('result.data',result.data);

  const posts = result.data.blog.edges
  const pages = result.data.pages.edges
  const changelogs = result.data.changelog.edges

  console.log('changelogs',changelogs.length)

  // Create changelog landing with pagination
  const changelogPerPage = 3
  const numChangelogPages = Math.ceil(changelogs.length / changelogPerPage)

  Array.from({ length: numChangelogPages }).forEach((_, i) => {
    const pagePath = i === 0 ? `/changelog` : `/changelog/${i + 1}`
    const firstEntry = changelogs[i * changelogPerPage]
    const changelogTemplate = `${changelogListTemplate}?__contentFilePath=${changelogs[i].node.internal.contentFilePath}`
    console.log('\nchangelogTemplate ---> ', changelogs[i].node.internal.contentFilePath)
    createPage({
      path: pagePath,
      // component: `${changelogListTemplate}?__contentFilePath=${firstEntry ? firstEntry.node.internal.contentFilePath : ''}`,
      // component: changelogListTemplate,
      component: `${changelogListTemplate}?__contentFilePath=${changelogs[i].node.internal.contentFilePath}`,
      context: {
        limit: changelogPerPage,
        skip: i * changelogPerPage,
        numPages: numChangelogPages,
        currentPage: i + 1,
      },
    })
  })

  // Create blog posts pages
  posts.forEach(({ node }) => {
    // console.log("contentFilePath: ", node.internal.contentFilePath)
    createPage({
      path: `/blog/${node.frontmatter.slug}`,
      component: `${blogPostTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      // component: blogPostTemplate,
      context: {
        id: node.id,
      },
    })
  })

  // Create blog list pages with pagination
  const postsPerPage = 2 // Number of posts per page
  const publishedPosts = posts.filter(({ node }) => 
    node.frontmatter && node.frontmatter.status === "publish"
  )
  if (publishedPosts.length === 0) {
    console.warn("No published posts found for pagination.")
    return
  }

  const numPages = Math.ceil(publishedPosts.length / postsPerPage)

  Array.from({ length: numPages }).forEach((_, i) => {
    const pagePath = i === 0 ? `/blog` : `/blog/${i + 1}`
  
    createPage({
      path: pagePath,
      component: blogListTemplate,
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1,
      },
    })
  })

  // Create static pages (About, Contact)
  pages.forEach(({ node }) => {
    let template
    
    if (node.internal.contentFilePath.includes('about')) {
      template = aboutTemplate
    } else if (node.internal.contentFilePath.includes('contact')) {
      template = contactTemplate
    } else if (node.internal.contentFilePath.includes('homepage')) {
      template = homepageTemplate
    } else {
      return // Skip other files not in pages or blog
    }
    
    template = template || pageTemplate
    
    createPage({
      path: node.frontmatter.slug,
      component: `${template}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        id: node.id,
      },
    })
  })

}

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark` || node.internal.type === 'Mdx') {
    const value = createFilePath({ node, getNode })
    
    // console.log('node.internal.type', node.internal.type)
    // console.log('value' , value);
    
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}