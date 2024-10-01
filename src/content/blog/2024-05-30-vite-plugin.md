---
title: "Écrire un Plugin pour Vite Introduction à I18NMerge"
description: "Écrire un Plugin pour Vite : Introduction à I18NMerge"
pubDate: "05/30/2024"
---

Dans le monde du développement web moderne, Vite est devenu un outil incontournable pour construire des applications front-end rapides et efficaces. Vite est apprécié pour sa simplicité, sa rapidité et ses nombreuses fonctionnalités qui facilitent le développement. L'une des fonctionnalités intéressantes de Vite est la possibilité de créer des plugins personnalisés pour étendre ses capacités. Aujourd'hui, nous allons explorer comment créer un plugin Vite pour gérer les fichiers de traduction en utilisant un exemple concret : I18NMerge.

Lorsque vous développez une application multilingue, il est courant d'avoir des fichiers de traduction séparés pour chaque langue. La gestion et la fusion de ces fichiers peuvent devenir fastidieuses, surtout lorsque les traductions sont réparties sur plusieurs modules ou composants. C'est ici que mon plugin I18NMerge intervient, en automatisant la fusion des fichiers de traduction.

Commençons par examiner le code du plugin I18NMerge. Ce plugin se charge de chercher, fusionner et servir les fichiers de traduction pour votre application.

Un plugin Vite est essentiellement une fonction qui retourne un objet avec des hooks spécifiques. Voici comment commence notre plugin :

```typescript
import { defineConfig, type Plugin } from 'vite';
import { glob } from 'glob';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

const I18NMerge = (): Plugin = {
// Fonctions utilitaires ici...
return {
name: 'i18n-merge',
// Hooks du plugin ici...
};
};
```

Nous utilisons la bibliothèque glob pour rechercher tous les fichiers de traduction JSON dans le projet. La fonction getFiles retourne la liste des fichiers correspondants à une langue donnée.

```typescript
const getFiles = (lang: string) = {
  return glob(`**/locales/${lang}.json`, {
    ignore: ['node_modules/**'],
  });
};
```

La fonction computeTranslationsFiles lit et fusionne les fichiers de traduction pour une langue donnée.

```typescript
const computeTranslationsFiles = async (lang: string): Promise = {
const files = await getFiles(lang);

    return files.reduce((acc: Record, file: string) = {
        const content = JSON.parse(readFileSync(`${file}`).toString());
        return {
        ...acc,
        ...content,
        };
    }, {});

};
```

Le plugin doit gérer deux contextes : le build et le serveur de développement.

Build : Fusionner et écrire les fichiers de traduction dans le répertoire de sortie.
Serveur : Servir les fichiers de traduction dynamiquement pendant le développement.

```typescript
import { defineConfig, type Plugin } from 'vite';
import { glob } from 'glob';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

const I18NMerge = (): Plugin = {
    // Fonctions utilitaires ici...
    return {
        name: 'i18n-merge',
        configResolved(config) {
          outDir = config.build.outDir;
          isBuild = config.mode !== 'development';
        },
        async buildEnd() {
          if (!isBuild) {
            return;
          }
          const localesOutDir = join(__dirname, outDir, 'locales');
          if (existsSync(localesOutDir)) {
            rmSync(localesOutDir, { recursive: true });
          }

          const allFiles = await getFiles('*');
          const result: Record = {};
          allFiles.forEach((file) = {
            const content = JSON.parse(readFileSync(`${file}`).toString());
            result[getLangFromFilePath(file)] = {
              ...(result[getLangFromFilePath(file)] ?? {}),
              ...content,
            };
          });

          try {
            mkdirSync(localesOutDir);
            Object.entries(result).forEach(([lang, dictionnary]) = {
              const file = join(localesOutDir, `${lang}.json`);
              writeFileSync(file, JSON.stringify(dictionnary, null, 2));
            });
          } catch (e) {
            console.error(e);
          }
        },
        configureServer(server) {
          server.middlewares.use(async (req, res, next) = {
            if (req.originalUrl.includes('locales/') && req.originalUrl.endsWith('.json')) {
              const lang = getLangFromFilePath(req.originalUrl);

              if (!translations[lang]) {
                translations[lang] = await computeTranslationsFiles(lang);
              }
              return res
                .setHeader('Content-Type', 'application/json')
                .end(JSON.stringify(translations[lang]));
            }
            next();
          });
        },
      };
};
```

Pour utiliser notre plugin I18NMerge, nous l'ajoutons simplement à la liste des plugins dans notre fichier de configuration Vite :

```typescript
export default defineConfig({
  // Autres configurations...
  plugins: [
    I18NMerge(),
    // Autres plugins...
  ],
  // Autres configurations...
});
```

Créer un plugin pour Vite peut sembler intimidant au début, mais avec une approche méthodique et une compréhension claire des besoins, cela devient un processus très réalisable. Le plugin I18NMerge illustre comment on peut automatiser la gestion des fichiers de traduction dans une application multilingue, rendant ainsi le processus de développement plus fluide et efficace.

N'hésitez pas à expérimenter et à adapter ce plugin à vos propres besoins. Le monde des plugins Vite est vaste et plein de p ossibilités pour améliorer vos flux de travail de développement.
