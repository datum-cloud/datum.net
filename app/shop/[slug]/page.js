import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function ShopDetailPage({ params }) {
  const param = await params;
  const response = await getProductByHandle(param);
  if (response.status !== 200 || response.body.errors ) notFound();
  
  const product = response.body.data.product;

  return (
    <main className={"grid justify-center"}>
      <h2 className={"text-center text-xl font-extrabold"}>{ product.title }</h2>
      
      <div className={"flex mt-6"}>
        <div className={"flex"}>
          {product.images.edges.map((image, index) => (
            <Image key={`image-${index}`} className={"p-8 rounded-t-lg"} src={image.node.url} alt={product.title} width={280} height={300} priority={false} />
          ))}
        </div>
        
        <div className={"flex flex-col justify-center"}>
          <p>Description: { product.description }</p>
          <p>Available: { product.variants.edges[0].node.quantityAvailable }</p>
          <p>Price: { product.variants.edges[0].node.price.currencyCode } { new Intl.NumberFormat('en-US').format(product.variants.edges[0].node.price.amount) }</p>
        </div>
      </div>
    </main>
  )
}

export async function shopifyFetch({ query, variables }) {
  const endpoint = process.env.SHOPIFY_STORE_DOMAIN;
  const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION;

  try {
    const result = await fetch(`https://${endpoint}/api/${version}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': key
      },
      body: { query, variables } && JSON.stringify({ query, variables })
    });

    return {
      status: result.status,
      body: await result.json()
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 500,
      error: 'Error receiving data'
    };
  }
}

export async function getProductByHandle({ slug }) {
  return shopifyFetch({
    query: `{
      product(handle: "${slug}") {
        id
        title
        description
        images (first: 5) {
          edges {
            node {
              id
              url
              width
              height
            }
          }
        }
        variants(first: 1) {
          edges {
            cursor
            node {
              id
              title
              quantityAvailable
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }`   
  });
}