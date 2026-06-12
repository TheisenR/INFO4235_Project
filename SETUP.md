# INFO4235 Project Setup

This document explains how to install dependencies, configure the database, and run the app for the INFO4235 student marketplace project.

## Prerequisites

- Node.js installed (Meteor ships its own Node runtime for Meteor commands)
- Meteor CLI installed: https://www.meteor.com/install
- Git installed (optional but recommended)
- MongoDB shell or `mongosh` if you want to inspect the local Meteor database

## Install dependencies

From the project root:

```powershell
cd "C:\Users\16047\Desktop\INFO4235_Project"
meteor npm install
```

This installs the npm dependencies listed in `package.json` and does not modify Meteor packages defined in `.meteor/packages`.

### NPM dependencies used in this project

- `@babel/runtime`
- `meteor-node-stubs`
- `react`
- `react-dom`

### Meteor packages used in this project

The Meteor package list is stored in `.meteor/packages`.
The active packages include:

- `meteor-base`
- `mobile-experience`
- `mongo`
- `reactive-var`
- `tracker`
- `standard-minifier-css`
- `standard-minifier-js`
- `es5-shim`
- `ecmascript`
- `typescript`
- `shell-server`
- `react-fast-refresh`
- `accounts-password`
- `react-meteor-data`
- `static-html`

## Database setup

This app can use either:

1. local Meteor MongoDB (default)
2. an external MongoDB Atlas database via `MONGO_URL`

### Local database

If you do not set `MONGO_URL`, Meteor will start with its default local MongoDB at `mongodb://127.0.0.1:3001/meteor`.

### External Atlas database

If you want to use the project database on Atlas, set `MONGO_URL` before starting Meteor.

Example for PowerShell:

```powershell
$env:MONGO_URL = 'mongodb+srv://admin:5151nNzhbGq5OEhi@info4235.lytzr4v.mongodb.net/INFO4235Project?retryWrites=true&w=majority'
meteor run --port 3000
```

Example for CMD:

```cmd
set MONGO_URL=mongodb+srv://admin:5151nNzhbGq5OEhi@info4235.lytzr4v.mongodb.net/INFO4235Project?retryWrites=true&w=majority
meteor run --port 3000
```

> Make sure the URI includes the database name (`INFO4235Project`) and query options.

## Run the app

From the project root, run:

```powershell
meteor run --port 3000
```

Then open the browser at:

```
http://localhost:3000
```

## Login behavior

The login form uses a custom Meteor method named `customLogin` on the server.

- It looks up users in the `Users` collection.
- It checks either:
  - Meteor-style password data stored in `services.password.bcrypt`, or
  - a plaintext `password` field.

If you are using the Atlas database, it must contain a `Users` collection and valid credentials for the login flow to work.

## Useful commands

- `meteor npm install` — install npm packages
- `meteor run --port 3000` — start the app
- `meteor mongo --url` — print the local MongoDB URL for the Meteor app

## Notes for teammates

- Always run `meteor npm install` once after cloning the repo.
- Start Meteor from the workspace root.
- If you are using Atlas, set `MONGO_URL` in the same terminal session before running `meteor`.
- If `meteor mongo` complains about missing `mongosh`, install MongoDB Shell / MongoDB Database Tools.

## Optional: environment file

If you want, you can keep a local `.env` or script with the `MONGO_URL` value. Meteor does not automatically load `.env` files, so you must either export the variable manually or add a script to your shell.
