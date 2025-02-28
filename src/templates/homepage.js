import React from "react"
import Layout from "../components/layouts/light"
import { graphql } from "gatsby"

const HomepageTemplate = ({ data: { mdx }, children }) => {
  const seoProps = {
    title: mdx.frontmatter.title,
    description: mdx.frontmatter.description,
    openGraph: {
      title: mdx.frontmatter.title,
      description: mdx.frontmatter.description,
      url: process.env.GATSBY_SITE_URL,
      type: 'article',
      article: {
        publishedTime: mdx.frontmatter.date,
      },
    },
    twitter: {
      cardType: 'summary_large_image',
    }
  }

  return (
    <Layout {...seoProps}>
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