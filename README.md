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
│   ├── login.js        checks the department password, starts a session
│   ├── _session.js     signs and verifies the session cookie
│   ├── _rooms.js       the rooms, and their starting data from the DDH deck
│   ├── stocks.js       reads and saves the stock records
│   └── photos.js       stores and removes room photographs
├── package.json
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
| Department Stocks | Planning and records | built into this portal |

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

### Environment variables

Two, both under **Settings → Environment Variables** in Vercel:

| Name | What it is |
|---|---|
| `PORTAL_PASSWORD` | the department password |
| `DATABASE_URL` | the Neon connection string the Stocks page saves into |
| `BLOB_READ_WRITE_TOKEN` | added automatically when you create a Blob store, for room photographs |

To change the password, edit that value, then go to **Deployments**, open the
**⋯** menu on the newest one and choose **Redeploy** — it only takes effect
after that redeploy. Changing it also signs everyone out, because the session
cookie is signed with it.

### Setting up the database, once

The Stocks page is the only part that stores anything. It needs a Neon database.

1. At <https://neon.tech> create a project. The free tier is ample — the whole
   dataset is a few kilobytes. Pick the region nearest Guntur.
2. Copy the **pooled** connection string: it starts `postgresql://` and has
   `-pooler` in the host name. The pooled one is the right choice for Vercel.
3. In Vercel add it as `DATABASE_URL`, then redeploy.
4. Open the Stocks tab. The table is created and filled from `api/_rooms.js`
   on first use, so there is nothing to run by hand.

Until `DATABASE_URL` is set, every other tab works as before and the Stocks tab
says the records could not be loaded.

### Setting up photograph storage, once

Room photographs need a Vercel Blob store. Same shape as the database:

1. Vercel, this project, **Storage**, **Create Database**, choose **Blob**
2. Name it anything, create it, and connect it to this project
3. Vercel adds `BLOB_READ_WRITE_TOKEN` by itself, so there is no prefix box
   to get wrong this time
4. Redeploy

Everything else keeps working without it; only the Photographs tab needs it.

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

## Department Stocks

The one tab built inside the portal rather than shown in a frame, so it has no
embedding header to fight and no separate login. It opens from the navigation
band or from its tile under Planning and records.

**Overview** is a row per room: systems, chairs, seven dots for the seven
registers, and when the room was last verified and last saved. It is the view to
put in front of a DDH or NBA reviewer.

**Each room** has six tabs across the top: Registers, Systems, Furniture,
Photographs, Proof links and Verification. The number beside a tab tells you
what is in it without opening it. Anything typed on one tab stays put while you
look at another. *Registers* — whether each of the seven exists,
when it was last written in, and remarks. *Computer systems* — one line per kind
of machine. *Furniture and fittings* — per item, what the stock register says,
what is physically present, how many work and how many are damaged, with the
difference worked out for you. *Physical verification* — when the room was last
counted, and by whom.

*Photographs* — pictures of the room. Choose them or drag them in; on a phone
this offers the camera. Each one is shrunk to 1600px in the browser before it
is sent, so a 4MB phone picture arrives as a few hundred kilobytes, uploads in
a second and the gallery stays quick. Click a thumbnail to see it full size.
A photograph saves the room as soon as it uploads, so it cannot be lost by
forgetting to press Save, and removing one deletes it from storage too.

*Proof links* — Google Drive links to the scanned registers and reports, each
with a label and a note, and an Open button beside it. Set the Drive file to
**Share, General access, Anyone with the link** first, or the committee sees a
permission error instead of your file.

Anything typed is kept while you move between rooms, and a dot stays on a room
button until you save it. The name in the save bar is recorded against the entry
and remembered on that computer.

### Where the starting data came from

`api/_rooms.js` holds what the DDH deck of 14 October 2026 recorded for the five
labs. That file only seeds an **empty** database the first time. After that the
database is the record, and editing the file changes nothing you can see.

Three things the deck did not contain, left blank to be filled in:

- **AFTF-04** is not in the deck at all. It is set up here as the staff room,
  with no registers recorded.
- **No furniture anywhere.** The deck counts computer systems only, so every
  chair, table and fitting starts empty.
- **No in-charge, seating capacity or verification dates** for any room.

### Adding a room later

Add it to `SEED` and to `ORDER` in `api/_rooms.js`, then push. A room with no
row in the database yet is seeded on the next load, so rooms already there are
never overwritten.

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
