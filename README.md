# mangosphere.uk

Static site for Mangosphere and its games. No build step: every file here is
what gets served.

```
index.html              Studio home page
css/studio.css          Studio styles
js/studio.js            Studio interactions (mascot, reveal, card tilt)
img/mango.svg           Logo + favicon
games/scraphead/        SCRAPHEAD game page (its own styles, script and art)
CNAME                   Custom domain for GitHub Pages
```

## Before launch

- **Steam link**: set `STEAM_URL` at the top of `games/scraphead/scraphead.js`.
  Until then every "Wishlist" button shows a "Steam page coming soon" toast.
- **Email**: the contact button uses `hello@mangosphere.uk` (`index.html`).
  The domain has no MX records yet, so set up email forwarding for that
  address (GoDaddy, ImprovMX, etc.) or change it to an inbox you already have.

## Put it live on mangosphere.uk

### Option A: GitHub Pages (free)

1. Push the contents of this folder to a GitHub repo (the files at the repo root).
2. Repo **Settings > Pages**: deploy from the `main` branch, root folder.
   The included `CNAME` file sets the custom domain to `mangosphere.uk`.
3. In GoDaddy DNS for mangosphere.uk:
   - Delete the `A @ Parked` record.
   - Add four `A` records for `@`: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`.
   - Change the `www` CNAME to `<your-github-username>.github.io`.
4. Back in **Settings > Pages**, tick **Enforce HTTPS** once the certificate is issued.

### Option B: Netlify (drag and drop)

1. Drag this folder onto <https://app.netlify.com/drop>.
2. **Domain settings > Add a domain**: `mangosphere.uk`.
3. In GoDaddy DNS: replace the `A @ Parked` record with `A @ 75.2.60.5`, and
   point the `www` CNAME at your `<site-name>.netlify.app` address.

DNS changes usually show up within an hour.

## Adding another game

Copy `games/scraphead/` to `games/<new-game>/`, swap the art and copy, and add a
card for it in the **Games** section of `index.html` (there's a comment there).

## Art and fonts

SCRAPHEAD art is rendered straight from the game's own drawing code (robots,
hats, weapons, trinkets, aliens) or cropped from in-game captures. Fonts come
from Google Fonts (Lilita One, Balsamiq Sans, Fredoka, DM Sans; all OFL).

## Making-of page

`games/scraphead/making-of/` tells the story of how SCRAPHEAD was made. The
"sketches" in `games/scraphead/img/making-of/` are pencil-style outlines generated
from the finished game art. Swap in scans of real sketchbook pages any time: keep
the same file names, or update the `src` paths in the page.
