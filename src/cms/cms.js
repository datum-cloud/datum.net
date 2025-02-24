import CMS from 'decap-cms-app'

console.log('process.env.CMS_LOCAL_BACKEND', process.env.CMS_LOCAL_BACKEND)

const baseConfig = {
  	local_backend: Boolean(process.env.CMS_LOCAL_BACKEND).valueOf() || false,
    backend: {
      name: process.env.CMS_BACKEND_NAME || 'git-gateway', // Default to git-gateway
    },
    media_folder: process.env.CMS_MEDIA_FOLDER || 'static/assets',
    public_folder: process.env.CMS_PUBLIC_FOLDER || '/assets',
    collections: [
      
      {
        name: 'pages',
        label: 'Pages',
        files: [
          {
            label: 'Homepage',
            name: 'index',
            file: 'content/pages/homepage.md',
            fields: [
              { label: 'Title', name: 'title', widget: 'string' },
              { label: 'Body', name: 'body', widget: 'markdown' },
              { label: 'Slug', name: 'slug', widget: 'string', default: '/' },
              { label: 'Description', name: 'description', widget: 'string' },
              { label: 'Keywords', name: 'keywords', widget: 'list', default: [] }
            ]
          },
          {
            label: 'About Page',
            name: 'about',
            file: 'content/pages/about.md',
            fields: [
              { label: 'Title', name: 'title', widget: 'string' },
              { label: 'Body', name: 'body', widget: 'markdown' },
              { label: 'Slug', name: 'slug', widget: 'string' },
              { label: 'Description', name: 'description', widget: 'string' },
              { label: 'Keywords', name: 'keywords', widget: 'list', default: [] }
            ]
          },
          {
            label: 'Contact Page',
            name: 'contact',
            file: 'content/pages/contact.md',
            fields: [
              { label: 'Title', name: 'title', widget: 'string' },
              { label: 'Body', name: 'body', widget: 'markdown' },
              { label: 'Slug', name: 'slug', widget: 'string' },
              { label: 'Description', name: 'description', widget: 'string' },
              { label: 'Keywords', name: 'keywords', widget: 'list', default: [] }
            ]
          }
        ]
      },
      {
        name: 'blog',
        label: 'Blog',
        folder: 'content/blog',
        create: true,
        fields: [
          { name: 'title', label: 'Title', widget: 'string' },
          { name: 'date', label: 'Date', widget: 'datetime' },
          { name: 'body', label: 'Body', widget: 'markdown' },
          { name: 'slug', label: 'Slug', widget: 'string' },
          { name: 'description', label: 'Description', widget: 'string' },
          { name: 'keywords', label: 'Keywords', widget: 'list', default: [] },
          {
            name: 'status',
            label: 'Status',
            widget: 'select',
            options: ['draft', 'publish'],
            default: 'draft'
          },
          { name: 'thumbnail', label: 'Thumbnail', widget: 'image', required: false, media_library: { folder: 'content/images/blog/' } },
          { name: 'featuredImage', label: 'Featured Image', widget: 'image', required: false, media_library: { folder: 'content/images/blog/' } },
        ],
      },
      {
        name: 'changelog',
        label: 'Changelog',
        folder: 'content/changelog',
        create: true,
        fields: [
          { name: 'title', label: 'Title', widget: 'string' },
          { name: 'date', label: 'Date', widget: 'date', format: 'YYYY-MM-DD' },
          { name: 'slug', label: 'Slug', widget: 'string' },
          { name: 'description', label: 'Description', widget: 'string' },
          { name: 'body', label: 'Body', widget: 'markdown' },
        ],
      },

    ],
  }


const environmentConfig = {
  local: {
    ...baseConfig,
    backend: {
      name: process.env.CMS_BACKEND_NAME || 'git-gateway',
    },
    media_folder: process.env.CMS_MEDIA_FOLDER || 'static/assets/local',
    public_folder: process.env.CMS_PUBLIC_FOLDER || '/assets/local',
  },
  development: {
    ...baseConfig,
    backend: {
      name: process.env.CMS_BACKEND_NAME || 'git-gateway',
    },
    media_folder: process.env.CMS_MEDIA_FOLDER || 'static/assets/dev',
    public_folder: process.env.CMS_PUBLIC_FOLDER || '/assets/dev',
  },
  production: {
    ...baseConfig,
    backend: {
      name: process.env.CMS_BACKEND_NAME || 'git-gateway',
    },
    media_folder: process.env.CMS_MEDIA_FOLDER || 'static/assets/prod',
    public_folder: process.env.CMS_PUBLIC_FOLDER || '/assets/prod',
  },
}

const config = environmentConfig[process.env.NODE_ENV] || baseConfig

CMS.init({ config })