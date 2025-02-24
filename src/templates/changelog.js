import React from 'react'
import { graphql, Link } from 'gatsby'
import { GatsbySeo } from 'gatsby-plugin-next-seo'
import Markdown from 'react-markdown'
import Layout from "../components/layouts/light"

const ChangelogPage = ({ data, pageContext, children }) => {
  const entries = data.allMdx.edges
  const { currentPage, numPages } = pageContext

  return (
    <Layout>
      <GatsbySeo
        title={`Changelog - Page ${currentPage} of ${numPages}`}
        description="Latest updates and changes to our project."
        openGraph={{
          title: `Changelog - Page ${currentPage} of ${numPages}`,
          description: 'Latest updates and changes to our project.',
          url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://your-site-url.com'}/changelog/${currentPage === 1 ? '' : currentPage}`,
          type: 'website',
        }}
        twitter={{ cardType: 'summary_large_image' }}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Changelog</h1>
        <p className="text-gray-600 mb-8">
          Stay updated with the latest changes, features, and fixes in our project.
        </p>
        {entries.map(({ node }) => (
          <div key={node.id} className="mb-12 border-b pb-6">
            <h2 className="text-2xl font-semibold">{node.frontmatter.title}</h2>
            <p className="text-gray-500 text-sm mb-2">{node.frontmatter.date}</p>
            <p className="text-gray-700 mb-4">{node.frontmatter.description}</p>
            <div className="prose text-left">
              <Markdown>{node.body}</Markdown>
            </div>
          </div>
        ))}
        <nav className="flex justify-between mt-8">
          <div>
            {currentPage > 1 && (
              <Link to={currentPage === 2 ? '/changelog' : `/changelog/${currentPage - 1}`} className="text-blue-600 hover:underline">
                ← Previous Page
              </Link>
            )}
          </div>
          <div>
            {currentPage < numPages && (
              <Link to={`/changelog/${currentPage + 1}`} className="text-blue-600 hover:underline">
                Next Page →
              </Link>
            )}
          </div>
        </nav>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query ChangelogQuery($skip: Int!, $limit: Int!) {
    allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: {
        internal: {contentFilePath: {regex: "/changelog/"  } }
      }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          id
          body
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            slug
            description
          }
        }
      }
    }
  }
`

export default ChangelogPage