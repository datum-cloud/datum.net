import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layouts/light"

const AboutTemplate = ({ data: { mdx }, children, location }) => {
  
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
      <div className="prose mx-auto">
        <h1>{mdx.frontmatter.title}</h1>
        <div  className="py-4">
        {children}
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
        description
        keywords
      }
    }
  }
`
export default AboutTemplate;