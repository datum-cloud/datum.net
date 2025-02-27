import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layouts/light"
import { GatsbySeo } from 'gatsby-plugin-next-seo'
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { formatPrice } from "../utils/formatPrice"
import ProductCard from "../components/product/card"

const ProductsPage = ({ data }) => {
  const products = data.allShopifyProduct.edges

  return (
    <Layout>
      <GatsbySeo
        title="Products"
        description="Explore our products available on Datum Inc."
        openGraph={{
          title: "Products",
          description: "Explore our products available on Datum Inc.",
          url: "https://your-site-url.com/products",
          type: 'website',
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shop</h1>
        <div class="grid grid-cols-3 gap-4">
        {products.map(({ node }) => (
            <ProductCard key={node.id} product={node} />
        ))}
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query {
    allShopifyProduct(sort: {createdAt: DESC}) {
      edges {
        node {
          id
          title
          handle
          createdAt
          description
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            gatsbyImageData(width: 400, height: 300)
          }
          variants {
            id
            title
            price
            availableForSale
            shopifyId
          }
        }
      }
    }
  }`

export default ProductsPage