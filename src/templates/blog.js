import React from "react"
import { graphql, Link } from "gatsby"
import { GatsbySeo } from 'gatsby-plugin-next-seo'
import Layout from "../components/layouts/light"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

const BlogList = ({ data, pageContext }) => {
  const posts = data.allMdx.edges
  const { currentPage, numPages, limit, skip } = pageContext // Destructure limit and skip from pageContext
  
  return (
    <Layout>
      <GatsbySeo
        title={`Blog - Page ${currentPage} of ${numPages}`}
        description="Check out our latest blog posts"
        openGraph={{
          title: `Blog - Page ${currentPage} of ${numPages}`,
          description: "Check out our latest blog posts",
          url: `https://your-site-url.com/blog/${currentPage === 1 ? '' : currentPage}`,
          type: 'website',
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        
        {posts.map(({ node }) => {
          const thumbnailImage = node.frontmatter.thumbnail?.childImageSharp?.gatsbyImageData ? getImage(node.frontmatter.thumbnail.childImageSharp.gatsbyImageData) : null
          return (
            <div key={node.id} className="mb-8 flex items-start">
              {thumbnailImage ? (
                <div className="mr-4">
                  <GatsbyImage image={thumbnailImage} alt={`${node.frontmatter.title} thumbnail`} className="w-64 h-64 object-cover" />
                </div>
              ) : node.frontmatter.thumbnail ? (
                <div className="mr-4">
                  <img src={node.frontmatter.thumbnail} alt={`${node.frontmatter.title} thumbnail`} className="w-64 h-64 object-cover" />
                </div>
              ) : null}
              <div>
                <h2 className="text-xl font-semibold">
                  <Link to={`/blog/${node.frontmatter.slug}`}>
                    {node.frontmatter.title}
                  </Link>
                </h2>
                <p className="text-gray-600 text-sm">{node.frontmatter.date}</p>
                <p>{node.excerpt}</p>
              </div>
            </div>
          )
        })}

        <nav className="flex justify-between mt-8">
          <div>
            {currentPage > 1 && (
              <Link to={currentPage === 2 ? "/blog" : `/blog/${currentPage - 1}`}>
                ← Previous Page
              </Link>
            )}
          </div>
          <div>
            {currentPage < numPages && (
              <Link to={`/blog/${currentPage + 1}`}>Next Page →</Link>
            )}
          </div>
        </nav>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query BlogListQuery($skip: Int, $limit: Int) {
    allMdx(
      sort: {frontmatter: {date: DESC}}
      filter: {
        frontmatter: {status: {eq: "publish"}}
        internal: {contentFilePath: {regex: "/blog/"  } }
      }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          id
          excerpt(pruneLength: 200)
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            slug
            thumbnail {
              childImageSharp {
                gatsbyImageData(width: 250, height: 250, layout: FIXED)
              }
            }
          }
        }
      }
    }
  }
`

export default BlogList