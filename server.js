require('dotenv').config();
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
import { PrismaClient } from "@prisma/client";
const sharp = require('sharp');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json()); // pour parser JSON
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    console.log(`Requête ${req.method} sur ${req.url}`);
    next();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'images';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// POST /login
app.post('/login', (req, res) => {
    console.log('POST /login called');
    const { email, password } = req.body;
    if (
        email === process.env.USER_EMAIL &&
        password === process.env.USER_PASSWORD
    ) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

// POST /upload protégé

app.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file.mimetype.startsWith('image/')) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Fichier non-image détecté' });
        }

        const inputPath = req.file.path;
        const baseName = path.parse(req.file.filename).name;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const outputFilename = `${baseName}-${uniqueSuffix}.webp`;
        const outputPath = path.join('images', outputFilename);

        // Vérification que sharp peut lire l’image
        try {
            await sharp(inputPath).metadata();
        } catch (err) {
            fs.unlinkSync(inputPath);
            return res.status(400).json({ message: 'Fichier image corrompu ou format non supporté' });
        }

        // Redimensionnement + conversion en webp
        await sharp(inputPath)
            .resize({
                width: 1920,
                height: 1080,
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

        fs.unlinkSync(inputPath);

        // Mise à jour du JSON des images
        const jsonPath = path.join(__dirname, 'images.json');
        let imageList = [];

        if (fs.existsSync(jsonPath)) {
            const raw = fs.readFileSync(jsonPath, 'utf8');
            try {
                imageList = JSON.parse(raw);
            } catch {
                console.error('JSON malformé, réinitialisé.');
            }
        }

        imageList.push(outputFilename);
        fs.writeFileSync(jsonPath, JSON.stringify(imageList, null, 2));

        const fileUrl = process.env.API_URL +`/images/${outputFilename}`;
        res.json({ url: fileUrl });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la conversion de l’image' });
    }
});
app.get('/list-images', (req, res) => {
    const imagesDir = path.join(__dirname, 'images');
    let images = [];

    try {
        const filenames = JSON.parse(fs.readFileSync('images.json', 'utf8'));
        images = filenames.map(name => process.env.API_URL+`/images/${name}`);
    } catch {
        const files = fs.readdirSync(imagesDir);
        images = files.map(name => process.env.API_URL+`/images/${name}`);
    }

    res.json({ images });
});
app.delete('/delete/:filename', verifyToken, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'images', filename);
    const jsonPath = path.join(__dirname, 'images.json');

    // Supprimer le fichier du disque
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Erreur suppression fichier:', err);
            return res.status(500).json({ message: 'Échec suppression fichier' });
        }

        // Ensuite, mise à jour du JSON
        try {
            if (fs.existsSync(jsonPath)) {
                const data = fs.readFileSync(jsonPath, 'utf8');
                let imageList = JSON.parse(data);
                imageList = imageList.filter(name => name !== filename);
                fs.writeFileSync(jsonPath, JSON.stringify(imageList, null, 2));
            }
        } catch (err) {
            console.error('Erreur mise à jour JSON:', err);
            // Ne bloque pas la réponse si JSON échoue
        }

        res.json({ message: 'Image supprimée' });
    });
});
app.post('/reorder', verifyToken, (req, res) => {
    const { filenames } = req.body;
    if (!Array.isArray(filenames)) {
        return res.status(400).json({ message: 'Format invalide' });
    }

    fs.writeFileSync('images.json', JSON.stringify(filenames, null, 2));
    res.json({ message: 'Ordre mis à jour' });
});
app.listen(3001, () => console.log('Backend running on http://localhost:3001'));
