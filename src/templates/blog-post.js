import React from "react"
import Layout from "../components/layouts/light"

import { graphql } from "gatsby"
import { Link } from "gatsby"
import { GatsbySeo } from 'gatsby-plugin-next-seo'
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import Aside from "../components/aside"

const shortcodes = { Link }

const BlogPost = ({ data: { mdx }, children, location }) => {
  if (!mdx) return (
    <Layout>
      <GatsbySeo title="Blog Post Not Found" description="The requested blog post was not found or is not authorized." />
      <div>Post not found or not authorized.</div>
    </Layout>
  )

  const featuredImage = mdx.frontmatter.featuredImage?.childImageSharp?.gatsbyImageData ? getImage(mdx.frontmatter.featuredImage.childImageSharp.gatsbyImageData) : null
  
  const seoProps = {
    title: mdx.frontmatter.title,
    description: mdx.frontmatter.description,
    openGraph: {
      title: mdx.frontmatter.title,
      description: mdx.frontmatter.description,
      type: 'article',
      article: {
        publishedTime: mdx.frontmatter.date,
      },
    },
    twitter: {
      cardType: 'summary_large_image',
    },
    path: location.pathname
  }

  return (
    <Layout {...seoProps}>
      <div className="flex flex-col lg:flex-row container mx-auto px-4 py-8">
        <div className="w-full lg:w-1/4 pr-6 "> 
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-8">
          <Aside tableOfContents={mdx.tableOfContents} />
          </div>
        </div>

        <main className="w-full lg:w-3/4 prose">
          {featuredImage && (
            <GatsbyImage image={featuredImage} alt={`${mdx.frontmatter.title} featured image`} className="mb-6" />
          )}
          <h1>{mdx.frontmatter.title}</h1>
          <p>{mdx.frontmatter.date}</p>
          {children} {/* Blog post body rendered here */}
        </main>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($id: String) {
    mdx(id: { eq: $id }, frontmatter: { status: { eq: "publish" } }) {
      id
      body
      tableOfContents(maxDepth: 3)
      frontmatter {
        title
        date(formatString: "MMMM D, YYYY")
        description
        keywords
        slug
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 800, height: 600, layout: CONSTRAINED)
          }
          publicURL
        }
      }
    }
  }
`

export default BlogPost