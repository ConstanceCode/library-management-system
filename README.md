# Library Management System

Data layer for a library book catalog, built with NestJS, Prisma and PostgreSQL (hosted on Neon).

## Setup

```bash
cd api
pnpm install
cp .env.example .env      # then paste your own Neon connection string
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
```

`DATABASE_URL` must point to a PostgreSQL database. No credentials are committed.

## Schema Decisions

**Why Book references Genre instead of embedding it.**
Each Book stores a `genreId` foreign key pointing to a row in the `Genre` table,
rather than carrying a copy of the genre inside the book record.

- **Single source of truth:** a genre's name lives in one row. Renaming
  "Science" to "Science & Nature" is one update, not thousands of edited books.
- **Integrity:** the foreign key means a book can't point to a genre that
  doesn't exist, and the database enforces it.
- **Genres are shared and queried on their own:** many books belong to one
  genre, and we need to list genres, filter books by genre, and count books
  per genre. That is a classic one-to-many relationship.
- **No duplication or drift:** embedding would repeat "Fiction" across every
  fiction book, and variants like "Fiction" vs "fiction" would split the data.

**Other decisions**
- `Role` is an enum (`PATRON`, `LIBRARIAN`) so invalid roles are rejected by
  the database. It defaults to `PATRON` (least privilege).
- `isbn` and `email` are `@unique` to prevent duplicate books and accounts.
- `Review` has `@@unique([bookId, userId])` so a user reviews a book once.

## Prisma vs a document database

Before saving any data with Prisma, I first had to define the Book and Genre
models and their relationship in `schema.prisma`, then run a migration. With a
document database, I could have simply saved a book with its genre inside the
same document. Setting Prisma up took more time initially, but the foreign key
constraint gave me better data integrity: the database rejects any book that
references a genre that doesn't exist. This caught errors early and kept the
data consistent.