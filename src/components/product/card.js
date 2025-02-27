import React, { useState } from "react"
import { Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { formatPrice } from "../../utils/formatPrice"

const ProductCard = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false)
  
  const image = getImage(product.featuredImage?.gatsbyImageData)
  const price = product.priceRangeV2.minVariantPrice.amount
  const currencyCode = product.priceRangeV2.minVariantPrice.currencyCode
  
  // Get default variant if available
  const defaultVariant = product.variants && product.variants.length > 0 
    ? product.variants[0] 
    : null
  
  const handleAddToCart = (e) => {
    e.preventDefault() // Prevent navigation to product page
    
    if (defaultVariant && defaultVariant.shopifyId) {
        setIsAdding(true)
    }
  }

  return (
    <div className="flex flex-col border relative mb-6 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div>
        <Link to={`/shop/${product.handle}`}>
          {image && (
            <GatsbyImage
              image={image}
              alt={product.title}
              className="w-full h-64 object-cover"
            />
          )}
        </Link>
      </div>
      <div className="h-full p-4 grid content-between">
        <div>
          <h2 className="text-xl font-semibold"><Link to={`/shop/${product.handle}`}>{product.title}</Link></h2>
          <p className="text-gray-700 mt-2 font-medium">{formatPrice(price, currencyCode)}</p>
        </div>
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !defaultVariant}
            className={`w-full ${
              isAdding ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
            } text-white py-2 px-4 rounded-lg transition-colors duration-300`}
          >
            {isAdding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard