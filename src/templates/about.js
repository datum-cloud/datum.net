import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layouts/light"
import { GatsbySeo } from 'gatsby-plugin-next-seo'

const AboutTemplate = ({ data: { mdx }, children }) => {
  return (
    <Layout>
      
      <GatsbySeo title={mdx.frontmatter.title} description={mdx.frontmatter.description} />
      
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