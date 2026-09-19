# Computer Applications — Department Portal

One entrance for the department's systems. The department banner runs across the
top, the systems appear as a grid of tiles, and clicking a tile opens that system
inside the page. The systems themselves are untouched and keep running where they
already are.

```
ca-portal/
├── public/
│   ├── index.html      the whole portal (tile list is near the bottom)
│   └── banner.png      the department banner
├── api/
│   └── login.js        checks the department password
├── vercel.json
└── README.md
```

---

## The tiles and their addresses

Open `public/index.html`, scroll to the bottom, and find the block that starts
`const APPS = [`. Two addresses are guesses, marked `← CHECK THIS URL`:

| Tile | Address in the file |
|---|---|
| Activity Calendar | `https://ca-activity-calendar.vercel.app` |
| Academic Audit | `https://raghava-183.github.io/mca-academic-audit/` |
| HoD Scorecard | `https://vfstr-hod-scorecard.vercel.app` |
| Achievements Portal | `https://ca-achievements-portal-df3e.vercel.app` |
| Augmented Learning | `https://tallamvyshnavi.github.io/augmented-learning/` |

All five are set. Attendance, Placements, NBA, Newsletters and Magazines are
planned tiles with no address yet.

---

## Step 1 — Put it on GitHub

Create an empty repository at <https://github.com/new>, name it
`ca-department-portal`, **Private**, and do **not** tick "Add a README".

Then in PowerShell, from inside the `ca-portal` folder:

```powershell
git init
git add .
git commit -m "Department portal"
git branch -M main
git remote add origin https://github.com/Raghava-183/ca-department-portal.git
git push -u origin main
```

## Step 2 — Deploy on Vercel

1. <https://vercel.com/new> → **Import** the `ca-department-portal` repository
2. Leave every build setting alone
3. Before clicking Deploy, open **Environment Variables** and add one:

   | Name | Value |
   |---|---|
   | `PORTAL_PASSWORD` | the password faculty will use |

4. Click **Deploy**

You get a URL like `https://ca-department-portal.vercel.app`. That's the one link
you circulate.

## Step 3 — Try it

Sign in, then click each tile. Use **All systems** in the toolbar (or press Esc,
or click the banner) to come back to the grid.

---

## Adding a tile

At the bottom of `public/index.html`, find `const APPS = [`, copy one block, and
change these fields:

| Field | What it does |
|---|---|
| `id` | short unique name, no spaces |
| `name` | the tile heading |
| `group` | the heading it sits under — tiles sharing a group sit together |
| `desc` | the sentence on the tile |
| `url` | the live address |
| `icon` | `calendar` `audit` `chart` `award` `students` `schedule` `report` `folder` `book` `globe` `news` `seal` `briefcase` |
| `planned` | `planned:true` marks it "Being built"; leave the line out for a live system |

## Systems not built yet

Attendance, Placements, NBA, Newsletters and Magazines are in the grid as
planned tiles. They show a **Being built** chip and, when opened, say so plainly
instead of showing an error.

When one goes live: paste its address into that tile's `url` and delete its
`planned:true` line. Nothing else changes.

Groups appear in the order the tiles are listed, so keep tiles of the same group
next to each other. There's a switched-off example at the end of the list showing
the exact shape. Then:

```powershell
git add public/index.html
git commit -m "Add new tile"
git push
```

Vercel rebuilds on its own in about a minute.

## Changing the password later

Vercel → project → **Settings** → **Environment Variables** → edit
`PORTAL_PASSWORD` → then **Deployments** → latest → **⋯** → **Redeploy**.
The change only takes effect after that redeploy.

## Replacing the banner

Drop a new image in as `public/banner.png`, keeping the same wide-and-short shape,
then commit and push. On phones the banner crops to its centre so the Vignan logo
stays readable.

## How loading works

Each system gets its own frame, created once and then kept. Going back to
something you already opened is instant, and its login survives. Once the grid
appears, the portal quietly loads the rest in the background, a couple of seconds
apart, so most tiles are ready before anyone clicks them. Hovering a tile starts
that one immediately.

Nothing is ever thrown away while it is still loading. A slow system changes the
wording after fifteen seconds and offers a **Reload** after forty, but it keeps
loading behind that message — if it eventually arrives, it simply appears.

## Getting a system to run inside the portal

Two headers decide this, and both belong to the system being embedded, never to
the portal. A system needs `Content-Security-Policy: frame-ancestors 'self'
https://ca-department-portal.vercel.app` and must not send `X-Frame-Options`.
If it also has a login, its session cookie needs `SameSite=None; Secure`, because
browsers withhold `SameSite=Lax` cookies inside a cross-site frame.

After changing a cookie's rules, sign out and in again inside the portal — an
existing cookie keeps its old attributes and will not fix itself.

GitHub Pages sites need nothing.

## If a tile opens to a blank or broken page

Everything opens inside the portal. When something goes wrong you get a panel with
the address printed on it and a **Try again** button, so you can see exactly what
was attempted. Two different causes:

**The address is wrong.** Click **Check the address** — it opens that exact address
on its own tab. If it fails there too, the address is the problem; fix it in the
tile and push again.

**The site refuses to be embedded.** It loads fine on its own tab but stays blank
inside the portal. That's a header the site sends, and it has to be fixed on that
site, not here. For a Flask app add this:

```python
@app.after_request
def allow_embedding(resp):
    resp.headers["Content-Security-Policy"] = \
        "frame-ancestors 'self' https://ca-department-portal.vercel.app"
    resp.headers.pop("X-Frame-Options", None)
    return resp
```

For a site on Vercel, add this to that project's `vercel.json` instead:

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "frame-ancestors 'self' https://ca-department-portal.vercel.app"
    }]
  }]
}
```

GitHub Pages sites embed without any change.

---

## What this portal is and isn't

It is a shared entrance. The password keeps casual visitors out and gives the
department one address to circulate.

It is not a security boundary, and it doesn't merge any data. Each system still
holds its own records and still asks for its own login where it has one. Anyone
who knows a system's direct address can still reach it without passing through
here. That's acceptable at this stage — and it's the reason to do the real merge
later, where one login and one database sit behind everything.
