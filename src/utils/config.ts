import { configSchema } from "./schemas";

const defineConfig = {
  shopifyShop: import.meta.env.SHOPIFY_STORE_DOMAIN,
  publicShopifyAccessToken: import.meta.env.SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN,
  privateShopifyAccessToken: import.meta.env.SHOPIFY_PRIVATE_STOREFRONT_ACCESS_TOKEN? import.meta.env.SHOPIFY_PRIVATE_STOREFRONT_ACCESS_TOKEN: "",
  apiVersion: import.meta.env.SHOPIFY_API_VERSION,
};

export const config = configSchema.parse(defineConfig);