import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layouts/light"
import Aside from "../components/aside"

const GuideDetailTemplate = ({ data, location, children }) => {
  const { mdx } = data

  const title = `Guide | ${mdx.frontmatter.title}`

  const seoProps = {
    title: title,
    description: mdx.frontmatter.description,
    openGraph: {
      title: title,
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row">
          <main className="w-full lg:w-3/4 pr-0 lg:pr-8">
            <article className="prose max-w-none">
              <h1>{mdx.frontmatter.title}</h1>

              {mdx.frontmatter.description && (
                <p className="text-lg text-gray-600 mt-2 mb-8">{mdx.frontmatter.description}</p>
              )}

              {mdx.frontmatter.date && (
                <div className="text-sm text-gray-500 mb-8">
                  Published: {new Date(mdx.frontmatter.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}

              <div className="my-8">
                {children}
              </div>
            </article>
          </main>

          <aside className="w-full lg:w-1/4 mt-8 lg:mt-0">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">On This Page</h3>
              <Aside tableOfContents={mdx.tableOfContents} />
            </div>
          </aside>
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
      tableOfContents(maxDepth: 3)
      fields {
        slug
      }
      frontmatter {
        title
        description
        date
        keywords
      }
    }
  }
`

export default GuideDetailTemplate
