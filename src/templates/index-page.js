/*
import React from "react";
import { graphql } from "gatsby";
import PropTypes from "prop-types";
// import { getImage } from "gatsby-plugin-image";
import Layout from "../components/layouts/Light";
import Featured from "./components/Featured";

const IndexPage = ({ data }) => {
    const { frontmatter } = data.markdownRemark;
    return (
        <Layout>
            
            <Featured 
                image={frontmatter.image}
                title={frontmatter.title}
                description={frontmatter.description}
                childs={frontmatter.childs}
            />
            
        </Layout>
    );
};

IndexPage.propTypes = {
    data: PropTypes.shape({
      markdownRemark: PropTypes.shape({
        frontmatter: PropTypes.object,
      }),
    }),
  };

export default IndexPage;

export const pageQuery = graphql`
  query IndexPageTemplate {
    markdownRemark(frontmatter: { templateKey: { eq: "index-page" } }) {
      frontmatter {
        image
        title
        description
        childs {
          blogs {
            title
            path
            description
          }
        }
      }
    }
  }
`;
*/