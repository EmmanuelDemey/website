---
title: "Inclure des règles custom dans Sonar"
description: "Dans cet article, je vais expliquer comment nous pouvons inclure des règles custom Sonar depuis notre CI."
keywords: "soanr, plugin, rule, règle, qualité"
pubDate: "03/28/2023"
---

Il y a quelques semaines, j'ai créé un module NPm permettant d'estimer l'impact environnemental d'un service numérique, en se basant sur les calculs réalisés par le site EcoIndex.fr ou encore le plugin GreenIT Analysis. Voici le repository Github de mon petit projet 😁

Une question était toujours en attente pour l'un de mes clients qui utilisait mon module. Comment intégrer ces résultats dans Sonar ?

Le but de petit article est de vous annoncer que c'est tout à fait possible avec Sonar d'inclure des règles custom. La seule chose à respecter est de créer un fichier JSON respectant cette structure.

```json
{
  "issues": [
    {
      "engineId": "name-of-your-plugin",
      "ruleId": "name-of-the-rule",
      "severity": "MAJOR",
      "type": "CODE_SMELL",
      "primaryLocation": {
        "message": "Error message ...",
        "filePath": "src/employee.js"
      },
      "effortMinutes": 20
    }
  ]
}
```

Ceci est un exemple basique de fichier. Des paramètres supplémentaires peuvent y être ajoutés: comme par exemple les numéros de lignes ou l'erreur est detectée. La seule information importante est la propriété filePath qui doit pointer vers un fichier connu par Sonar. Si ce n'est pas le cas, Sonar n'affichera pas votre règle custom.

Une fois ce fichier généré par vos soins, il suffit de l'inclure dans le fihier de configuration Sonar, et le tour est joué...

```
sonar.projectKey=training:external-issues
sonar.projectName=Training: External issues import

sonar.externalIssuesReportPaths=issues.json
```
