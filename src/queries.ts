import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@prisma/client';
import * as process from 'node:process';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()
  .$extends(withAccelerate());

async function main() {
  // Add your queries here
  await prisma.users.create({
    data: {
      name: process.env.ADMIN || 'admin',
      password:  bcrypt.hashSync(process.env.PASSWORD || 'admin', 12),
    }
  })
  await prisma.sections.create({
    data: {
      title: 'Accueil'
    }
  })
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });