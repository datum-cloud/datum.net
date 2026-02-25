// server.mjs
import { createServer } from 'http';
import { handler } from './dist/server/entry.mjs';
import sirv from 'sirv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createReadStream, existsSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 4321;
const HOST = process.env.HOST || '0.0.0.0';
const CLIENT_DIR = join(__dirname, 'dist', 'client');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
  '.pf_fragment': 'application/octet-stream',
  '.pf_index': 'application/octet-stream',
  '.pf_meta': 'application/octet-stream',
  '.pagefind': 'application/octet-stream',
};

const COMPRESSIBLE_EXTENSIONS = /\.(html|css|js|mjs|json|xml|svg|txt|map)$/;

// Redirect configuration with Cache-Control: no-cache
const REDIRECTS = {
  '/product': { destination: '/features/', status: 302 },
  '/feature/': { destination: '/features/', status: 302 },
  '/product/overview/overview': { destination: '/features/', status: 302 },
  '/team': { destination: '/about/', status: 302 },
  '/jobs/': { destination: '/careers/', status: 302 },
  '/community-huddle/': { destination: '/events/', status: 302 },
  '/docs/overview/': { destination: '/docs/', status: 302 },
  '/docs/roadmap': { destination: '/resources/roadmap/', status: 302 },
  '/docs/tutorials/gateway': { destination: '/docs/tutorials/httpproxy/', status: 302 },
  '/docs/get-started/datum-concepts/': {
    destination: '/docs/quickstart/datum-concepts/',
    status: 302,
  },
  '/docs/tasks/create-project/': { destination: '/docs/platform/projects/', status: 302 },
  '/docs/tasks/developer-guide': { destination: '/docs/developer-guide/', status: 302 },
  '/docs/task/tools/': { destination: '/docs/', status: 302 },
  '/docs/tutorials/grafana/': { destination: '/docs/metrics/grafana-cloud/', status: 302 },
  '/docs/tutorials/httpproxy/': { destination: '/docs/runtime/proxy/', status: 302 },
  '/docs/get-started/': { destination: '/docs/quickstart/', status: 302 },
  '/docs/quickstart/datumctl': { destination: '/docs/datumctl/', status: 302 },
  '/docs/quickstart/datumctl/': { destination: '/docs/datumctl/', status: 302 },
  '/docs/contribution-guidelines/': { destination: '/docs/', status: 302 },
  '/docs/guides/using-byoc/': { destination: '/docs/', status: 302 },
  '/docs/workflows/': { destination: '/docs/', status: 302 },
  '/docs/workflows/1-click-waf/': { destination: '/docs/runtime/proxy/', status: 302 },
  '/handbook/engineering/rfc/': { destination: '/handbook/build/', status: 302 },
  '/handbook/company/what-we-believe/': { destination: '/handbook/about/purpose/', status: 302 },
  '/handbook/culture/anti-harassment-and-discrimination-policy/': {
    destination: '/handbook/policy/anti-harassment/',
    status: 302,
  },
  '/handbook/company/who-are-we-building-for/': {
    destination: '/handbook/product/customers/',
    status: 302,
  },
  '/handbook/people/travel-policy/': { destination: '/handbook/operate/traveling/', status: 302 },
  '/handbook/company/where-are-we-now/': { destination: '/handbook/about/strategy/', status: 302 },
  '/handbook/go-to-market/keep-momentum/': {
    destination: '/handbook/about/strategy/',
    status: 302,
  },
  '/handbook/go-to-market/approach-gtm/': { destination: '/handbook/about/model/', status: 302 },
  '/netzero/overview/overview': { destination: '/', status: 302 },
  '/api-reference/invite/deletes-a-invite-by-id': {
    destination: '/docs/api/reference/',
    status: 302,
  },
  '/blog/internet-superpowers-for-every-builder/)_/': {
    destination: '/blog/internet-superpowers-for-every-builder/',
    status: 302,
  },
  '/legal/': { destination: '/legal/terms/', status: 302 },
  '/privacy-policy/': { destination: '/legal/privacy/', status: 302 },
  '/privacy/': { destination: '/legal/privacy/', status: 302 },
  '/terms-of-service/': { destination: '/legal/terms/', status: 302 },
  '/index.asp': { destination: '/', status: 302 },
  '/logon.html': { destination: 'https://auth.datum.net/ui/v2/login/loginname', status: 302 },
  '/public-slack/': { destination: 'https://link.datum.net/discord', status: 302 },
  '/handbook/company/': { destination: '/handbook/about/', status: 302 },
  '/handbook/engineering/': { destination: '/handbook/build/', status: 302 },
  '/handbook/go-to-market/': { destination: '/handbook/about/', status: 302 },

  // No-trailing-slash variants
  '/docs/get-started': { destination: '/docs/quickstart/', status: 302 },
  '/docs/get-started/datum-concepts': { destination: '/docs/quickstart/datum-concepts/', status: 302 },
  '/docs/tasks/create-project': { destination: '/docs/platform/projects/', status: 302 },
  '/docs/tutorials/gateway/': { destination: '/docs/tutorials/httpproxy/', status: 302 },
  '/docs/tutorials/httpproxy': { destination: '/docs/runtime/proxy/', status: 302 },
  '/docs/tutorials/grafana': { destination: '/docs/metrics/grafana-cloud/', status: 302 },
  '/docs/contribution-guidelines': { destination: '/docs/', status: 302 },
  '/docs/guides/using-byoc': { destination: '/docs/', status: 302 },

  // Additional docs redirects
  '/docs/developer-guide': { destination: '/docs/datumctl/developer/overview/', status: 302 },
  '/docs/developer-guide/': { destination: '/docs/datumctl/developer/overview/', status: 302 },
  '/docs/tasks/tools': { destination: '/docs/datumctl/', status: 302 },
  '/docs/tasks/tools/': { destination: '/docs/datumctl/', status: 302 },
  '/docs/tutorials/domains': { destination: '/docs/assets/domains/', status: 302 },
  '/docs/tutorials/domains/': { destination: '/docs/assets/domains/', status: 302 },
  '/docs/guides/contribution-guidelines.mdx': { destination: '/docs/guides/', status: 302 },
  '/docs/workflows/grafana-cloud': { destination: '/docs/metrics/grafana-cloud/', status: 302 },
  '/docs/workflows/grafana-cloud/': { destination: '/docs/metrics/grafana-cloud/', status: 302 },
  '/docs/changelog': { destination: '/resources/changelog/', status: 302 },
  '/docs/changelog/': { destination: '/resources/changelog/', status: 302 },

  // Site page aliases
  '/about-us': { destination: '/about/', status: 302 },
  '/about-us/': { destination: '/about/', status: 302 },
  '/team/': { destination: '/about/', status: 302 },
  '/leadership': { destination: '/about/', status: 302 },
  '/leadership/': { destination: '/about/', status: 302 },
  '/jobs': { destination: '/careers/', status: 302 },
  '/feature': { destination: '/features/', status: 302 },
  '/products': { destination: '/features/', status: 302 },
  '/products/': { destination: '/features/', status: 302 },
  '/product/vpc': { destination: '/features/', status: 302 },
  '/design': { destination: '/brand/', status: 302 },
  '/design/': { destination: '/brand/', status: 302 },
  '/support': { destination: '/contact/', status: 302 },
  '/support/': { destination: '/contact/', status: 302 },
  '/overview/datum': { destination: '/docs/overview/why-datum/', status: 302 },
  '/overview/datum/': { destination: '/docs/overview/why-datum/', status: 302 },

  // Legal aliases and typos
  '/privacy-policy': { destination: '/legal/privacy/', status: 302 },
  '/privacy': { destination: '/legal/privacy/', status: 302 },
  '/terms-of-service': { destination: '/legal/terms/', status: 302 },
  '/legal/privacy-policy': { destination: '/legal/privacy/', status: 302 },
  '/legal/privacy-policy/': { destination: '/legal/privacy/', status: 302 },
  '/legal/pricavy': { destination: '/legal/privacy/', status: 302 },
  '/legal/pricavy/': { destination: '/legal/privacy/', status: 302 },
  '/legal/term': { destination: '/legal/terms/', status: 302 },
  '/legal/term/': { destination: '/legal/terms/', status: 302 },
  '/legal/trust': { destination: '/legal/privacy/', status: 302 },
  '/legal/trust/': { destination: '/legal/privacy/', status: 302 },
  '/legal/security': { destination: '/docs/overview/support/', status: 302 },
  '/legal/security/': { destination: '/docs/overview/support/', status: 302 },
};

// Prefix-based redirects: source prefix → destination prefix (preserves the rest of the path)
const PREFIX_REDIRECTS = [
  { from: '/handbook/technical/', to: '/handbook/build/', status: 302 },
  { from: '/handbook/culture/', to: '/handbook/operate/', status: 302 },
];

// File extensions that should trigger download instead of display
const DOWNLOAD_EXTENSIONS = /\.(docx?|xlsx?|pptx?|zip)$/i;

// Static file server for pre-rendered pages and assets
const staticServer = sirv(CLIENT_DIR, {
  maxAge: 31536000,
  immutable: true,
  gzip: true,
  brotli: true,
  etag: true,
  dotfiles: false,
  extensions: ['html'], // Auto-append .html for clean URLs
  single: false, // Don't serve index.html for all routes (SPA mode)
  setHeaders: (res, pathname) => {
    if (pathname.includes('/_astro/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (pathname.match(/\.(html)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    // Force download for Office documents and archives
    if (DOWNLOAD_EXTENSIONS.test(pathname)) {
      const filename = pathname.split('/').pop();
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
  },
});

function getContentType(url) {
  const ext = url.match(/\.[^.]+$/)?.[0]?.toLowerCase() || '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

function isCompressible(url) {
  return COMPRESSIBLE_EXTENSIONS.test(url);
}

// Serve pre-compressed files (.gz, .br) for text-based content
function serveCompressed(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  let url = req.url.split('?')[0];

  if (url.endsWith('/')) {
    url += 'index.html';
  }

  if (!isCompressible(url)) {
    return next();
  }

  const acceptEncoding = req.headers['accept-encoding'] || '';
  const filePath = join(CLIENT_DIR, url);

  // Try brotli first (better compression ratio)
  if (acceptEncoding.includes('br')) {
    const brPath = filePath + '.br';
    if (existsSync(brPath)) {
      const stat = statSync(brPath);
      res.writeHead(200, {
        'Content-Type': getContentType(url),
        'Content-Encoding': 'br',
        'Content-Length': stat.size,
        Vary: 'Accept-Encoding',
        'Cache-Control': url.includes('/_astro/')
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=0, must-revalidate',
      });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        createReadStream(brPath).pipe(res);
      }
      return;
    }
  }

  // Fallback to gzip (widely supported)
  if (acceptEncoding.includes('gzip')) {
    const gzPath = filePath + '.gz';
    if (existsSync(gzPath)) {
      const stat = statSync(gzPath);
      res.writeHead(200, {
        'Content-Type': getContentType(url),
        'Content-Encoding': 'gzip',
        'Content-Length': stat.size,
        Vary: 'Accept-Encoding',
        'Cache-Control': url.includes('/_astro/')
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=0, must-revalidate',
      });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        createReadStream(gzPath).pipe(res);
      }
      return;
    }
  }

  next();
}

const server = createServer((req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }

  const url = req.url.split('?')[0];

  // Health check endpoints for Kubernetes probes
  if (url === '/healthz' || url === '/livez' || url === '/readyz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Handle exact redirects with Cache-Control: no-cache
  const redirect = REDIRECTS[url];
  if (redirect) {
    res.writeHead(redirect.status, {
      Location: redirect.destination,
      'Cache-Control': 'no-cache',
    });
    res.end();
    return;
  }

  // Handle prefix-based redirects (wildcard)
  for (const prefixRedirect of PREFIX_REDIRECTS) {
    if (url.startsWith(prefixRedirect.from)) {
      const newPath = prefixRedirect.to + url.slice(prefixRedirect.from.length);
      res.writeHead(prefixRedirect.status, {
        Location: newPath,
        'Cache-Control': 'no-cache',
      });
      res.end();
      return;
    }
  }

  // Middleware order: compressed files → static files → Astro handler
  serveCompressed(req, res, () => {
    staticServer(req, res, () => {
      handler(req, res);
    });
  });
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Server running at http://${HOST}:${PORT}/
║
║  ✅ Pre-compressed files (.gz, .br) enabled
║  ✅ Static file server (images, fonts, etc.) enabled
║  ✅ Astro SSR handler enabled
║
║  Compression: HTML, CSS, JS, JSON, SVG, XML, TXT
║  Static: WebP, PNG, JPG, WOFF2, WOFF, PDF, ZIP, etc.
╚════════════════════════════════════════════════════════════╝
  `);
});
