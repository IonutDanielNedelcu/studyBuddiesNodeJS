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



## Functionalities

StudyBuddies platform uses RBAC (Role-Based Access Control), with 3 designed application roles: Admins, Managers, and Employees. Each of the roles has specific CRUD (Create, Read, Update, Delete) operations available, listed below.

An admin is created with a seeder script. Upon registration, a user gets the Employee role.

# Admins
Seeing data:
    - Users: all users, a specific user (identified by username), own user
    - Roles: all roles, a specific role (identified by name)
    - Positions: all positions, positions with a specific name, positions with a specific seniority
    - Teams: all teams, a specific team (identified by name)

Managing data:
    - Users: remove a specific user (identified by username)
    - Roles: add a role to a user, remove a role from a user
    - Positions: create a new positions, add a position to a user, remove a position from a user
    - Teams: 

# Managers
Seeing data:
    - Users: all users, a specific user (identified by username), own user
    - Roles: none
    - Positions: all positions, positions with a specific name, positions with a specific seniority
    - Teams: all teams, a specific team (identified by name)

Managing data:
    - Users: none
    - Roles: none
    - Positions: add a position to a user, remove a position from a user
    - Teams: 

# Users
Seeing data:
    - Users: a specific user (identified by username), own user
    - Roles: none
    - Positions: none
    - Teams: a specific team (identified by name)

Managing data:
    - Users: none
    - Roles: none
    - Positions: none
    - Teams: 