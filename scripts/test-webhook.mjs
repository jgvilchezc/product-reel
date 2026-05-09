// Run: node scripts/test-webhook.mjs
// Simulates a Shopify "Product creation" webhook against a locally-running dev server.
// HMAC validation is skipped because SHOPIFY_WEBHOOK_SECRET is empty in dev.

const URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhook';

const payload = {
  id: 123456,
  title: 'Air Jordan 1 Retro High OG',
  body_html:
    '<p>The iconic sneaker that changed basketball forever. Premium leather upper with classic colorblocking.</p>',
  vendor: 'Test Store',
  variants: [{ price: '180.00' }],
  images: [
    { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1280' },
    { src: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1280' },
    { src: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1280' },
  ],
};

const res = await fetch(URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

console.log(`status: ${res.status}`);
console.log('body:', await res.text());
