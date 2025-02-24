import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layouts/light"

const PageTemplate = ({ data: { mdx }, children }) => {
  return (
    <Layout title={mdx.frontmatter.title} description={mdx.frontmatter.description}>
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
      body
      frontmatter {
        image
        title
        description
        keywords
      }
    }
  }
`

export default PageTemplate