import Link from 'next/link';
import Image from 'next/image'
import { notFound } from 'next/navigation';

export default async function ShopPage() {
  const response = await getAllProducts();
  
  if (response.status !== 200) notFound();

  const products = response.body.data.products.edges;

  return (
    <div>
      <h1 className={'font-bold mb-2'}>Shop</h1>
      
      <div className="flex flex-wrap gap-4 mx-auto px-4 py-8 justify-center">
        {products.map((product, index) => (
        <div key={index} className={"w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"}>
            <div className={"flex justify-center"}>
            <Link href={`/shop/${product.node.handle}`}>
                <Image className={"p-8 rounded-t-lg"} src={product.node.images.edges[0].node.url} alt={product.node.title} width={280} height={300} priority={false} />
            </Link>
            </div>
            <div className={"px-5 pb-5"}>
                <a href="#">
                    <h5 className={"text-xl font-semibold tracking-tight text-gray-900 dark:text-white"}>{ product.node.title }</h5>
                </a>
                <div className={"flex items-center mt-2.5 mb-5"}>
                    <p className={"text-white"}>{ product.node.description }</p>
                </div>
                <div className={"flex items-center justify-between"}>
                    <span className={"text-3xl font-bold text-gray-900 dark:text-white"}>{ product.node.variants.edges[0].node.price.currencyCode } { product.node.variants.edges[0].node.price.amount }</span>
                    <Link href="#" className={"text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}>Add to cart</Link>
                </div>
            </div>
        </div>
        ))}
      </div>
    </div>
  );
} 

export const metadata = {
  title: 'Datum - Shop',
  description: '',
  keywords: [],
  openGraph: {
    title: 'Datum - Shop',
    description: 'Shop description',
    site_name: 'Datum',
    url: 'https://datum.net',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg', // Must be an absolute URL
        width: 800,
        height: 600,
      },
    ],
    type: 'website',
  },
  twitter: {
    title: 'Datum - Shop',
    description: 'Shop description',
    card: 'summary_large_image',
    images: ['https://cdn.prod.website-files.com/66dab18c1311fe77f4eb9370/66fcee96f9f4b328f7454f5a_Datum%20Opengraph.jpg'],
  },
}


async function shopifyFetch({ query, variables }) {
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

async function getAllProducts() {
  return shopifyFetch({
    query: `{
        products(sortKey: TITLE, first: 10) {
          edges {
            node {
              id
              title
              description
              handle
              images (first: 2) {
                edges {
                  node {
                    id
                    url
                    width
                    height
                  }
                }
              }
              variants(first: 3) {
                edges {
                  node {
                    id
                    title
                    quantityAvailable
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      id
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }`
  });
}