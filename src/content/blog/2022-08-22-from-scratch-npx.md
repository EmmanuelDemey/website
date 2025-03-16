---
title: "From Scratch - NPX"
description: "Dans ce nouvel article de série “From Scratch”, nous allons décortiquer l'outil NPX."
keywords: "NPX, outil, from scratch"
pubDate: "08/22/2022"
---

L'outil NPX est un outil en ligne de commande installé automatiquement quand nous installons Node.js et NPM sur notre machine. Il permet de facilement exécuter des modules NPM sans avoir besoin de les installer manuellement. Ci-dessous, un exemple permettant d'initier un projet Angular grâce au module @angular/cli .

```
npx @angular/cli new App
```

Mais si nous jetons un coup d'oeil au code source , cet outil est un simple outil de réécriture. En effet, son seul but est de regénérer une commande npx exec correspondant à l'action que nous souhaitons réaliser. Dans cet article, nous allons essayer de comprendre son fonctionnement.

En Node.js, pour récupérer les arguments passés à la ligne de commande, nous devons manipuler le tableau argv . Ce tableau contient comme premier élément l'exécutable utilisé, dans notre cas Node.js, et ensuite en deuxième place, la commande en elle même : pour nous npx.

Comme indiqué précédemment, npx est un simple outil de réécriture. Pour faire ce traitement, nous allons tout simplement modifier ce tableau argv afin d'avoir celui souhaité par la commande npm exec . Nous allons donc :

Remplacer le deuxième élément de argv pour pointer vers le script de la CLI de NPM
Insérer la chaîne de caractères exec en troisième position.

```javascript
#!/usr/bin/env node

process.argv[1] = require.resolve("./npm-cli.js");
process.argv.splice(2, 0, "exec");
```

Si nous regardons la documentation de la commande npm exec , voici comment elle doit etre utilisée pour exécuter le même module @angular/cli.

```shell
npx exec -- @angular/cli new App
```

Pas énormément de différences. A part le '--'. Nous allons donc l'ajouter à notre tableau.

```javascript
#!/usr/bin/env node

process.argv[1] = require.resolve("./npm-cli.js");
process.argv.splice(2, 0, "exec");
process.argv.splice(i, 0, "--");
```

Et voilà le tour est joué. Il suffit maintenant de passer cet objet process au script NPM afin qu'il soit exécuté.

```javascript
#!/usr/bin/env node

const cli = require("../lib/cli.js");

process.argv[1] = require.resolve("./npm-cli.js");
process.argv.splice(2, 0, "exec");
process.argv.splice(i, 0, "--");

cli(process);
```

Vous allez me dire, c'est fini ? En effet, le script fait de la transformation sur les options afin qu'elles correspondent à ce qu'attend NPM. Mais, pour mon cas, dans la vie de tous les jours, les quelques lignes précédentes sont suffisantes.

Vous trouverez le code complet de cet outil sur le repository Github de NPM , avec notamment la partie parmettant de faire la "traduction" des options passées à la ligne de commande.
