import { PrismaClient } from '@prisma/client';
import * as process from 'node:process';
import bcrypt from 'bcryptjs';
import { join } from "node:path";
import * as fs from "node:fs";

const prisma = new PrismaClient()

async function main() {

    // 1) Créer user et section sans transaction
    const user = await prisma.users.create({
        data: {
            name: process.env.ADMIN || 'admin',
            password: bcrypt.hashSync(process.env.PASSWORD || 'admin', 12),
        }
    });

    const section = await prisma.sections.create({
        data: { title: 'Accueil' }
    });

    // 2) Charger les fichiers
    const uploadDir = join(__dirname, '..', 'uploads');
    const files = fs.readdirSync(uploadDir).filter(f => fs.lstatSync(join(uploadDir, f)).isFile());

    // 3) Récupérer le nombre initial pour le order
    let index = await prisma.sectionImages.count({ where: { sectionId: section.id } });

    // 4) Inserer les images sans transaction interactive
    for (const file of files) {
        await prisma.image.create({
            data: {
                url: '/uploads/' + file,
                sections: {
                    create: {
                        section: { connect: { id: section.id } },
                        order: 1000 + index * 1000
                    }
                }
            }
        });
        index++;
    }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
  });
