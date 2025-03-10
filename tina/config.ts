// 1. First, let's create a tina folder at the root of your project
// tina/config.ts

import { defineConfig } from "tinacms";

const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
const clientId = process.env.TINA_CLIENT_ID!;
const token = process.env.TINA_TOKEN!;

// Your content schema
const schema = {
  collections: [
    {
      name: "post",
      label: "Blog Posts",
      path: "src/content/blog",
      format: "md",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Title",
          isTitle: true,
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          required: true,
        },
        {
          type: "datetime",
          name: "date",
          label: "Date",
          required: true,
        },
        {
          type: "string",
          name: "slug",
          label: "Slug",
          required: true,
        },
        {
          type: "string",
          name: "author",
          label: "Author",
        },
        {
          type: "image",
          name: "thumbnail",
          label: "Thumbnail Image",
        },
        {
          type: "image",
          name: "featuredImage",
          label: "Featured Image",
        },
        {
          type: "boolean",
          name: "draft",
          label: "Draft",
        },
        {
          type: "rich-text",
          name: "body",
          label: "Body",
          isBody: true,
        },
      ],
    },
    {
      name: "changelog",
      label: "Changelog Entries",
      path: "src/content/changelog",
      format: "mdx",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Title",
          isTitle: true,
          required: true,
        },
        {
          type: "datetime",
          name: "date",
          label: "Date",
          required: true,
        },
        {
          type: "string",
          name: "version",
          label: "Version",
        },
        {
          type: "string",
          name: "summary",
          label: "Summary",
          required: true,
          ui: {
            component: "textarea",
          },
        },
        {
          type: "rich-text",
          name: "body",
          label: "Body",
          isBody: true,
        },
      ],
    },
    {
      name: "page",
      label: "Pages",
      path: "src/content/pages",
      format: "mdx",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Title",
          isTitle: true,
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
        },
        {
          type: "image",
          name: "featuredImage",
          label: "Featured Image",
        },
        {
          type: "boolean",
          name: "isHomePage",
          label: "Is Home Page",
        },
        {
          type: "string",
          name: "slug",
          label: "Slug",
        },
        {
          type: "number",
          name: "order",
          label: "Order",
        },
        {
          type: "rich-text",
          name: "body",
          label: "Body",
          isBody: true,
        },
      ],
    },
  ],
};

export default defineConfig({
  branch,
  clientId,
  token,
  localContentAPI: {
    // Ensure we're telling Tina to save content directly to the repo
    // This is important for self-hosted setups
    database: {
      adapter: "local", // Use flat file storage
      directory: ".tina/__generated__", // Where to store the flat-file database
    },
  },
  schema,
  admin: {
    // Set this to false for a self-hosted configuration without Tina Cloud
    auth: {
      useLocalAuth: true,
      basicAuth: {
        users: [
          {
            username: process.env.TINA_USERNAME!,
            password: process.env.TINA_PASSWORD!,
          },
        ],
      },
    },
  },
  build: {
    publicFolder: "public", // The public asset folder for your framework
    outputFolder: "admin", // The folder to output the admin panel
  },
  media: {
    tina: {
      mediaRoot: "src/assets/images",
      publicFolder: "public",
    },
  },
});