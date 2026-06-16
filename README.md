# INFO4235_Project

A student marketplace web application built with Meteor, React, and MongoDB.

## Project layout (reorganized)

- client/  — React entry and components (`App.jsx`, `main.jsx`, pages)
- server/  — server code and Meteor methods
- private/  - Holds the MongoDB PlayGround file

## Prerequisites

- Node.js (recommended v16+)
- Meteor (install from https://www.meteor.com/install)
- npm (comes with Node.js)
- A MongoDB instance (local or Atlas) if you want to use persistent data

## Install

Install dependencies using Meteor's bundled npm to ensure compatible versions:

```bash
meteor npm install
```

## Run the app (Meteor - full stack)

This runs the Meteor server and client together (default development mode):

```bash
meteor run
```

To connect to a specific MongoDB instance (for example an Atlas cluster), set `MONGO_URL` before starting:

```powershell
$env:MONGO_URL = 'mongodb+srv://admin:5151nNzhbGq5OEhi@info4235.lytzr4v.mongodb.net/INFO4235Project?retryWrites=true&w=majority'

meteor run
```

## Useful commands

- Install deps (Meteor-aware): `meteor npm install`
- Install deps (npm-only): `npm install`
- Run Meteor app: `meteor run`
- Run frontend dev server: `npm run dev`

## Notes & Troubleshooting

- If you see module or version errors, ensure Meteor and Node versions match the project's expectations.
- If Meteor can't find MongoDB, verify `MONGO_URL` or run a local `mongod` instance.
- The client entry files are in `client/` and the server methods are in `server/`.

If you'd like, I can also add step-by-step build and deploy instructions.
