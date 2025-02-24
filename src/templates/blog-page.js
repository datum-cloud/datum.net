import React from "react"
import { graphql } from "gatsby"
import Light from "../components/layouts/light"
import Blog from "./components/blog"

const BlogsPage = ({ data: { mdx }, children }) => {
  
  return (
    <Light>
      <Blog
        title={mdx.frontmatter.title}
        description={mdx.frontmatter.description}
        image={mdx.frontmatter.image}
      />
    </Light>
  );
};

export default BlogsPage;

export const blogsPageQuery = graphql`
  query BlogsPage($id: String!) {
    mdx(id: { eq: $id }) {
      body
      frontmatter {
        title
        description
        image
      }
    }
  }
`;