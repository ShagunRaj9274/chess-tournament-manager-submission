import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Static output so the app can be hosted on Netlify, Vercel or GitHub Pages.
    // `fallback` makes it a single page app, which dynamic routes such as
    // /tournaments/[id] need because there is no server to render them.
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: false
    })
  }
};

export default config;
