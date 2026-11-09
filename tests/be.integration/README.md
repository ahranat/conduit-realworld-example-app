# Backend integration tests

## Run locally

Run commands from the project root. Prerequisites: Node.js 22.12+ and a running
local PostgreSQL server.

1. Select Node and install dependencies:

   ```bash
   nvm use 22
   npm ci
   ```

2. If `backend/.env` does not exist, copy `backend/.env.example` to it. Set
   `DEV_DB_DIALECT=postgres`, `DEV_DB_HOSTNAME=127.0.0.1`, and the database name,
   username, and password for your local PostgreSQL installation. Set `JWT_KEY`
   to a local secret and keep `PORT=3001`. Do not overwrite an existing `.env`.

3. Start PostgreSQL if needed. On the current local setup, it starts at login;
   check it with:

   ```bash
   pg_isready -h 127.0.0.1
   ```

   Open a new terminal if the installed PostgreSQL tools are not yet on `PATH`.
   On other machines, use the service command for your PostgreSQL installation.

4. Create the configured database if it does not already exist:

   ```bash
   npm run sqlz -- db:create
   ```

   The backend creates its tables on startup through Sequelize synchronization.

5. Run backend integration tests:

   ```bash
   npm run test:integration
   ```

   These tests send HTTP requests to `http://localhost:3001/api`; they do not
   launch a browser. The shared Playwright configuration currently starts both
   the backend on port 3001 and frontend on port 3100, or reuses running servers
   locally. Ensure any reused backend points to the intended local database.
   Tests currently use the development database configuration.

To run a single test file or inspect the report:

```bash
npm run test:integration -- tests/be.integration/tags.spec.mjs
npx playwright show-report
```

## Pipeline runs

TODO: Document pipeline setup and commands when the pipeline is implemented.

## Endpoint checklist

A checkbox means the endpoint has the planned success and failure coverage,
not just a smoke test.

- [ ] `POST /users` — registration
- [ ] `POST /users/login` — login
- [ ] `GET /user` — current user
- [ ] `PUT /user` — update current user
- [ ] `GET /profiles/:username` — get profile
- [ ] `POST /profiles/:username/follow` — follow user
- [ ] `DELETE /profiles/:username/follow` — unfollow user
- [ ] `GET /articles` — list and filter articles
- [ ] `POST /articles` — create article
- [ ] `GET /articles/feed` — followed users' articles
- [ ] `GET /articles/:slug` — get article
- [ ] `PUT /articles/:slug` — update article
- [ ] `DELETE /articles/:slug` — delete article
- [ ] `POST /articles/:slug/favorite` — favorite article
- [ ] `DELETE /articles/:slug/favorite` — unfavorite article
- [ ] `GET /articles/:slug/comments` — list comments
- [ ] `POST /articles/:slug/comments` — add comment
- [ ] `DELETE /articles/:slug/comments/:commentId` — delete comment
- [ ] `GET /tags` — list tags

## Coverage expectations

- Assert status codes, response field names and types, and persisted database effects.
- Check required fields, invalid input by length/characters, and duplicate data.
- Check unauthenticated requests, invalid tokens, and ownership permissions.
- Check missing users, profiles, articles, and comments where applicable.
- Cover filters (`author`, `tag`, `favorited`) and pagination (`limit`, `offset`).
- Create isolated test data and clean it up; avoid depending on existing local data.
- Validate request and response contracts against an agreed API schema.

## Test design TODOs

- Refine the coverage logic: define scenarios and expected behavior per endpoint,
  including which validation and authorization cases apply. The endpoint list
  and coverage expectations above are planning checklists, not implemented coverage.
- Design data isolation for parallel workers and simultaneous test runs before
  adding tests that write data. Decide the database/schema isolation boundary,
  fixture ownership, unique data naming, and cleanup after failures or retries.
  Account for list, filter, and pagination assertions seeing other tests' data.
- Decide how tests select a dedicated test database and avoid reusing a backend
  connected to a different database. This is not implemented yet; the current
  configuration uses the development database and enables parallel execution.
