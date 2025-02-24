import React from "react"
import Layout from "../components/layouts/light"

import { graphql } from "gatsby"
import { GatsbySeo } from 'gatsby-plugin-next-seo'

const HomepageTemplate = ({ data: { mdx }, children }) => {
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
        
        {children}

      </div>
    </Layout>
  )
}

export const query = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      body
      frontmatter {
        title
        description
        keywords
        slug
      }
    }
  }
`
export default HomepageTemplate;