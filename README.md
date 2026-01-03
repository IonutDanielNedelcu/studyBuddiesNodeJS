# studyBuddiesNodeJS
Repository for the NodeJS &amp; GraphQL project.

## Quickstart

1. Install dependencies

```bash
npm install
```

2. Run migrations (creates SQLite database and tables)

```bash
npx sequelize-cli db:migrate
```

3. Run seeders (insert roles, teams, positions, users)

```bash
npx sequelize-cli db:seed:all
```

4. Start the server (development)

```bash
npm run dev
```

Server will be available at `http://localhost:3009/graphql`.

Notes
- The project uses SQLite by default (see `config/config.json`).
- If you use `npx nodemon` in `npm run dev`, `nodemon` is included in `devDependencies`.
- To rollback seed data you can run:

```bash
npx sequelize-cli db:seed:undo:all
```

And to undo migrations:

```bash
npx sequelize-cli db:migrate:undo:all
```

If you need a fresh DB:

```bash
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```
