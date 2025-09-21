import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@prisma/client';
import * as process from 'node:process';
import bcrypt from 'bcryptjs';
import { join } from "node:path";
import * as fs from "node:fs";

const prisma = new PrismaClient()
  .$extends(withAccelerate());

async function main() {
    // Ajoutez vos requêtes ici dans une transaction
    await prisma.$transaction(async (tx) => {
        await tx.users.create({
            data: {
                name: process.env.ADMIN || 'admin',
                password: bcrypt.hashSync(process.env.PASSWORD || 'admin', 12),
            }
        });
        await tx.sections.create({
            data: {
                title: 'Accueil'
            }
        });

        // Lecture du dossier upload pour ajouter les images à la section accueil
        const uploadDir = join(__dirname, '..', 'uploads');
        const files = fs.readdirSync(uploadDir);
        const section = await tx.sections.findFirst({
            where: {
                title: 'Accueil'
            }
        });
        if (section) {
            for (const file of files) {
                const filePath = join(uploadDir, file);
                if (fs.lstatSync(filePath).isFile()) {
                    await tx.image.create({
                        data: {
                            url: '/uploads/' + file,
                            sections: {
                                create: {
                                    section: {
                                        connect: { id: section.id }
                                    }
                                    , order: 1000+await tx.sectionImages.count({
                                        where: { sectionId: section.id}
                                    }) *1000

                                    }
                            }
                        }
                    });
                }
            }
        }
    });
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