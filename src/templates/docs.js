import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layouts/light"
import DocsSidebar from "../components/docs/sidebar"
import Aside from "../components/aside"

const DocsLandingPage = ({ data, location, children }) => {
  const { mdx } = data

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
      <div className="flex flex-col lg:flex-row container mx-auto px-4 py-8">
        <DocsSidebar currentPath={location.pathname} />
        
        <main className="w-full lg:w-2/4 px-0 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">{mdx.frontmatter.title}</h1>
          <div className="prose max-w-none">
            {children}
          </div>
        </main>
        
        <aside className="w-full lg:w-1/4 lg:pl-8 mb-8 lg:mb-0 mt-8 lg:mt-0">
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
  }
`

export default DocsLandingPage