import React from "react"
import Layout from "../components/layouts/light"

import { graphql } from "gatsby"
import { Link } from "gatsby"
import { GatsbySeo } from 'gatsby-plugin-next-seo'
import { GatsbyImage, getImage } from "gatsby-plugin-image"

const shortcodes = { Link }

const BlogPost = ({ data: { mdx }, children }) => {
  if (!mdx) return (
    <Layout>
      <GatsbySeo title="Blog Post Not Found" description="The requested blog post was not found or is not authorized." />
      <div>Post not found or not authorized.</div>
    </Layout>
  )

  const featuredImage = mdx.frontmatter.featuredImage?.childImageSharp?.gatsbyImageData ? getImage(mdx.frontmatter.featuredImage.childImageSharp.gatsbyImageData) : null

  return (
    <Layout>
      <GatsbySeo
        title={mdx.frontmatter.title}
        description={mdx.frontmatter.description}
        openGraph={{
          title: mdx.frontmatter.title,
          description: mdx.frontmatter.description,
          url: `https://your-site-url.com/blog/${mdx.frontmatter.slug}`,
          type: 'article',
          article: {
            publishedTime: mdx.frontmatter.date,
          },
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
      
      <div className="prose mx-auto">
        <h1>{mdx.frontmatter.title}</h1>
        <p>{mdx.frontmatter.date}</p>
        
        {featuredImage ? (
          <GatsbyImage image={featuredImage} alt={`${mdx.frontmatter.title} featured image`} className="mb-6" />
        ) : mdx.frontmatter.featuredImage ? (
          <img src={mdx.frontmatter.featuredImage} alt={`${mdx.frontmatter.title} featured image`} className="mb-6" />
        ) : null}
        

        {children}
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($id: String) {
    mdx(id: { eq: $id }, frontmatter: { status: { eq: "publish" } }) {
      id
      body
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