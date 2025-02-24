/**
 * @type {import('gatsby').GatsbyConfig}
 */
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

const siteUrl = 'https://datum.net'
const siteUrlDev = 'http://localhost:8000'

module.exports = {
  siteMetadata: {
    title: `Gatsby Decap`,
    siteUrl: process.env.NODE_ENV === 'development' ? siteUrlDev : siteUrl,
  },
  plugins: [
    "gatsby-plugin-postcss",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        "icon": "src/img/icon.png"
      }
    },
    {
      resolve: `gatsby-plugin-decap-cms`,
      options: {
        modulePath: `${__dirname}/src/cms/cms.js`,
        publicPath: `admin`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "uploads",
        path: `${__dirname}/static/img`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: "images",
        path: `${__dirname}/src/img/`,
      },
      __key: "images"
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/content`,
      }
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
              quality: 90,
            },
          },
        ],
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blogImages`,
        path: `${__dirname}/content/images/blog`, // Ensure this is correct
      },
    },
    {
      resolve: `gatsby-plugin-next-seo`,
      options: {
        openGraph: {
          type: 'website',
          locale: 'en_US',
          url: process.env.NODE_ENV === 'development' ? siteUrlDev : siteUrl,
          site_name: 'Your Blog Site',
        },
        twitter: {
          handle: '@yourhandle',
          site: '@yourhandle',
          cardType: 'summary_large_image',
        },
      },
    },
    "gatsby-plugin-netlify", // make sure to keep it last in the array
  ]
};