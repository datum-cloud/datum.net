import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layouts/light"
import Aside from "../components/aside"

const GuidesTemplate = ({ data, location, children }) => {
  const { mdx, allMdx } = data
  const guides = allMdx.edges
  console.log('====guides====',guides);
  const seoProps = {
    title: mdx.frontmatter.title,
    description: mdx.frontmatter.description,
    openGraph: {
      title: mdx.frontmatter.title,
      description: mdx.frontmatter.description,
      type: 'article',
    },
    twitter: {
      cardType: 'summary_large_image',
    },
    path: location.pathname
  }

  // Simple list of guides without category grouping
  const allGuides = guides.map(({ node }) => node)

  return (
    <Layout {...seoProps}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row">
          <main className="w-full lg:w-3/4 pr-0 lg:pr-8">
            <h1 className="text-3xl font-bold mb-6">{mdx.frontmatter.title}</h1>

            <div className="prose max-w-none mb-12">
              {children}
            </div>

            <div className="mt-8">
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Ltest Guides</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {allGuides.map(guide => (
                    <Link
                      to={guide.fields.slug}
                      key={guide.id}
                      className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <h3 className="text-xl font-medium mb-2">{guide.frontmatter.title}</h3>
                      {guide.frontmatter.description && (
                        <p className="text-gray-600">{guide.frontmatter.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </main>

          <aside className="w-full lg:w-1/4 mt-8 lg:mt-0">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">On This Page</h3>
              <Aside tableOfContents={mdx.tableOfContents} />

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                <p className="text-gray-600 text-sm">
                  Can't find what you're looking for? <Link to="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
                </p>
              </div>
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
      body
      tableOfContents(maxDepth: 3)
      frontmatter {
        title
        description
        keywords
      }
    }
    allMdx(
      sort: {frontmatter: {date: DESC}}
      filter: {
        internal: {contentFilePath: {regex: "/guides/"}}
        frontmatter: {status: {eq: "publish"}}
      }
    ) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            description
            date
          }
        }
      }
    }
  }
`

export default GuidesTemplate
