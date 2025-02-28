import { graphql, useStaticQuery } from 'gatsby'

const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query SITE_METADATA_QUERY {
        site {
          siteMetadata {
            title
            url
            description
          }
        }
      }
    `
  )
  return site.siteMetadata
}

export default useSiteMetadata
