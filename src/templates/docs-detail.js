import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layouts/light"
import DocsSidebar from "../components/docs/sidebar"
import Aside from "../components/aside"

const DocsDetailPage = ({ data, location, children }) => {
  const { mdx, allMdx } = data
  
  // Find prev and next documents
  const edges = allMdx.edges
  const currentIndex = edges.findIndex(edge => edge.node.id === mdx.id)
  const prev = currentIndex > 0 ? edges[currentIndex - 1].node : null
  const next = currentIndex < edges.length - 1 ? edges[currentIndex + 1].node : null
  const title = `Documentation | ${mdx.frontmatter.title}`
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
      
      <div className="flex flex-col lg:flex-row container mx-auto px-4 py-8">
        <DocsSidebar currentPath={location.pathname} />
        
        <main className="w-full lg:w-2/4 px-0 lg:px-8">
          <article className="prose max-w-none">
            <h1>{mdx.frontmatter.title}</h1>
            {mdx.frontmatter.description && (
              <p className="text-lg text-gray-600 mt-2 mb-8">{mdx.frontmatter.description}</p>
            )}
            
            <div className="my-8">
              {children}
            </div>
          </article>
          
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-between">
              {prev && (
                <Link 
                  to={prev.fields.slug} 
                  className="group flex items-center mb-4 md:mb-0"
                >
                  <div className="mr-4 text-blue-500 transition-transform group-hover:-translate-x-1">←</div>
                  <div>
                    <div className="text-sm text-gray-500">Previous</div>
                    <div className="font-medium">{prev.frontmatter.title}</div>
                  </div>
                </Link>
              )}
              
              {next && (
                <Link 
                  to={next.fields.slug} 
                  className="group flex items-center ml-auto text-right"
                >
                  <div>
                    <div className="text-sm text-gray-500">Next</div>
                    <div className="font-medium">{next.frontmatter.title}</div>
                  </div>
                  <div className="ml-4 text-blue-500 transition-transform group-hover:translate-x-1">→</div>
                </Link>
              )}
            </div>
          </div>
        </main>
        
        <aside className="w-full lg:w-1/4 lg:pl-8 mb-8 lg:mb-0 mt-8 lg:mt-0">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-8">
            <h3 className="text-lg font-semibold mb-4">On This Page</h3>
            <Aside tableOfContents={mdx.tableOfContents} />
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Still Need Help?</h3>
              <p className="text-gray-600 text-sm">
                Can't find what you're looking for? <Link to="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
              </p>
            </div>
          </div>
        </aside>
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
        keywords
      }
    }
    allMdx(
      sort: {fields: {slug: ASC}}
      filter: {
        internal: {contentFilePath: {regex: "/docs/"}}
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
          }
        }
      }
    }
  }
`

export default DocsDetailPage