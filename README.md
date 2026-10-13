# Department Portal — Computer Applications, VFSTR

One entrance for the department's systems, for staff only. The systems themselves
are untouched and keep running where they already are; this portal puts them
behind a single password and opens them in place.

```
ca-portal/
├── public/
│   ├── index.html      the whole portal (tiles and notices near the bottom)
│   ├── banner.png      the department banner
│   └── hero.jpg        the campus photograph behind the hero band
├── api/
│   └── login.js        checks the department password
├── vercel.json
└── README.md
```

---

## The systems

| Tile | Area | Address |
|---|---|---|
| Activity Calendar | Planning and records | `https://ca-activity-calendar.vercel.app` |
| Academic Audit | Planning and records | `https://raghava-183.github.io/mca-academic-audit/` |
| HoD Scorecard | Planning and records | `https://vfstr-hod-scorecard.vercel.app` |
| NBA | Planning and records | being built |
| Achievements Portal | Students | `https://ca-achievements-portal-df3e.vercel.app` |
| Augmented Learning | Students | `https://tallamvyshnavi.github.io/augmented-learning/` |
| Attendance | Students | being built |
| Placements | Students | being built |
| Newsletters | Publications | being built |
| Magazines | Publications | being built |

---

## Deploying

The project is already connected to GitHub and Vercel. To publish a change:

```powershell
git add .
git commit -m "describe the change"
git push
```

Vercel rebuilds on its own in about a minute. Then press **Ctrl + Shift + R** on
the portal so the browser fetches the new version rather than its cached copy.

### The password

It is not in the code. It lives in Vercel under **Settings → Environment
Variables** as `PORTAL_PASSWORD`. To change it, edit that value, then go to
**Deployments**, open the **⋯** menu on the newest one and choose **Redeploy** —
the new password only takes effect after that redeploy.

---

## Editing the portal

Everything you would normally change sits at the bottom of `public/index.html`,
in three marked lists.

### 1. The tiles

| Field | What it does |
|---|---|
| `id` | short unique name, no spaces |
| `name` | the tile heading |
| `group` | the area it sits under; it also becomes a navigation item |
| `desc` | the sentence on the tile |
| `url` | the live address, no trailing slash |
| `icon` | `calendar` `audit` `chart` `award` `students` `schedule` `report` `folder` `book` `globe` `news` `seal` `briefcase` |
| `planned` | `planned:true` marks it "Being built"; delete the line once it is live |

Areas appear in the order the tiles are listed, so keep tiles of the same group
together. When a planned system goes live, paste its address into `url` and
delete its `planned:true` line — nothing else changes, and it drops out of the
"Being built" column in the footer by itself.

### 2. Notices

The sidebar panel. Newest first:

```javascript
const NOTICES = [
  { date:"12 Oct 2026", text:"Academic audit evidence due by Friday." },
];
```

Leave the list empty and the panel says so.

### 3. The academic year

`const YEAR = "2025-26";` — shown in the top strip and on the hero band.

### The photographs

`public/hero.jpg` is the campus photograph behind the hero and the sign-in page.
Replace the file, keep the name, and it changes in both places. A wide landscape
image works best; it is dimmed under a navy wash, so detail in the shadows is
lost by design. `public/banner.png` is the department banner across the top.

---

## How loading works

Each system gets its own frame, created once and then kept. Going back to one you
already opened is instant and its login survives. Once the grid appears the
portal quietly loads the rest in the background, a couple of seconds apart, so
most tiles are ready before anyone clicks. Hovering a tile starts that one
immediately.

Nothing is thrown away while it is still loading. A slow system changes its
wording after fifteen seconds and offers **Reload** after forty, but it keeps
loading behind that message, so one that eventually arrives simply appears.

Press **Esc**, or use **All systems**, to come back to the grid.

---

## Getting a system to run inside the portal

Two headers decide this, and both belong to the system being embedded, never to
this portal.

**To be displayed at all**, a system must send
`Content-Security-Policy: frame-ancestors 'self' https://ca-department-portal.vercel.app`
and must not send `X-Frame-Options` at all. `X-Frame-Options` cannot allow one
specific site and overrides the modern header in Chrome, so it has to go.

On Vercel, that lives in the system's own `vercel.json`:

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

In Flask:

```python
@app.after_request
def allow_portal_embed(resp):
    resp.headers.pop("X-Frame-Options", None)
    resp.headers["Content-Security-Policy"] = (
        "frame-ancestors 'self' https://ca-department-portal.vercel.app"
    )
    return resp
```

**To keep someone signed in**, a system's session cookie needs
`SameSite=None; Secure`. Browsers withhold a `SameSite=Lax` cookie inside a
cross-site frame, so the system sees every request as signed out and shows empty
data. After changing a cookie's rules, sign out and in again inside the portal —
an existing cookie keeps its old attributes and will not fix itself.

GitHub Pages sites need neither change.

### When a tile fails

The portal shows the address it tried, with **Try again** and **Check the
address**. Two different causes:

- **Check the address opens fine on its own tab, but the frame stays blank** —
  the system refuses to be embedded. Fix its headers, above.
- **It fails on its own tab too** — the address in the tile is wrong.

---

## What this portal is, and is not

It is a shared entrance. The password keeps casual visitors out and gives the
department one address to circulate.

It is not a security boundary, and it does not merge any data. Each system still
holds its own records and still asks for its own login. Anyone who knows a
system's direct address still reaches it without passing through here, and every
embedded system can change its own headers and break its tile without warning.
Those limits are inherent to linking separate deployments together; removing them
means merging the systems into one application with one login and one database.
