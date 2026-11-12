import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalog: Record<string, { title: string; author: string; isbn: string; year: number }[]> = {
  Fiction: [
    { title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9780385474542', year: 1958 },
    { title: 'Petals of Blood', author: 'Ngũgĩ wa Thiong’o', isbn: '9780141186887', year: 1977 },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', isbn: '9781400095209', year: 2006 },
    { title: 'Weep Not, Child', author: 'Ngũgĩ wa Thiong’o', isbn: '9780435908300', year: 1964 },
  ],
  Science: [
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', year: 1988 },
    { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '9780198788607', year: 1976 },
    { title: 'Cosmos', author: 'Carl Sagan', isbn: '9780345539434', year: 1980 },
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316110', year: 2011 },
  ],
  Technology: [
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', year: 2008 },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', isbn: '9780135957059', year: 1999 },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781449373320', year: 2017 },
    { title: 'Automate the Boring Stuff with Python', author: 'Al Sweigart', isbn: '9781593279929', year: 2015 },
  ],
  History: [
    { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393317558', year: 1997 },
    { title: 'Facing Mount Kenya', author: 'Jomo Kenyatta', isbn: '9780436233036', year: 1938 },
    { title: 'The Wretched of the Earth', author: 'Frantz Fanon', isbn: '9780802141323', year: 1961 },
    { title: 'Africa: A Biography of the Continent', author: 'John Reader', isbn: '9780679738695', year: 1997 },
  ],
};

async function main() {
  for (const [genreName, books] of Object.entries(catalog)) {
    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });

    for (const b of books) {
      await prisma.book.upsert({
        where: { isbn: b.isbn },
        update: {},
        create: {
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          publishedYear: b.year,
          copiesAvailable: 3,
          genreId: genre.id,
        },
      });
    }
  }

  const [g, b] = await Promise.all([prisma.genre.count(), prisma.book.count()]);
  console.log(`Seeded: ${g} genres, ${b} books`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());