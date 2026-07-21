import { PrismaClient } from '@prisma/client';
import * as process from 'node:process';
import bcrypt from 'bcryptjs';
import { join } from "node:path";
import * as fs from "node:fs";

const prisma = new PrismaClient()

async function main() {
    const adminName = process.env.ADMIN || 'admin';
    const adminPassword = process.env.PASSWORD || 'admin';

    // 1) Créer user si non existant
    let user = await prisma.users.findUnique({
        where: { name: adminName }
    });

    if (!user) {
        user = await prisma.users.create({
            data: {
                name: adminName,
                password: bcrypt.hashSync(adminPassword, 12),
            }
        });
        console.log(`[Seed] Utilisateur ${adminName} créé.`);
    } else {
        console.log(`[Seed] Utilisateur ${adminName} existe déjà.`);
    }

    // 2) Créer section si non existante
    let section = await prisma.sections.findFirst({
        where: { title: 'Accueil' }
    });

    if (!section) {
        section = await prisma.sections.create({
            data: { title: 'Accueil' }
        });
        console.log(`[Seed] Section 'Accueil' créée.`);
    } else {
        console.log(`[Seed] Section 'Accueil' existe déjà.`);
    }

    // 3) Charger les fichiers s'il y en a
    const uploadDir = join(__dirname, '..', 'uploads');
    if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir).filter(f => fs.lstatSync(join(uploadDir, f)).isFile());
        let index = await prisma.sectionImages.count({ where: { sectionId: section.id } });

        for (const file of files) {
            const url = '/uploads/' + file;
            const existingImage = await prisma.image.findFirst({ where: { url } });

            if (!existingImage) {
                await prisma.image.create({
                    data: {
                        url,
                        sections: {
                            create: {
                                section: { connect: { id: section.id } },
                                order: 1000 + index * 1000
                            }
                        }
                    }
                });
                index++;
                console.log(`[Seed] Image ${file} ajoutée.`);
            }
        }
    }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
  });

