---
title: "Speaker notes sur Sli.dev en full screen"
description: "Comment pouvons-nous afficher les speaker notes de Sli.dev en full Screen ?"
pubDate: "05/21/2024"
---

Petit article pour relancer ce blog :D. Récemment, j'ai eu besoin d'afficher les notes du présentateur en plein écran pour une présentation utilisant Sli.dev. Cependant, après avoir consulté la documentation de Sli.dev, je n'ai pas trouvé de solution disponible par défaut. Heureusement, ce n'est pas un problème majeur, car Sli.dev étant une présentation au format web, il suffit de modifier un peu le CSS.

En effet, le design de Sli.dev repose sur des grilles CSS (CSS Grid). Si nous souhaitons modifier la disposition, il suffit de redéfinir la grid en fonction du résultat souhaité. Par exemple, pour que la zone des notes du présentateur occupe deux lignes et deux colonnes sur l'ensemble de la grille, nous pouvons ajuster le CSS comme suit :

```css
.slidev-presenter .grid-container {
  grid-template-areas:
    "top top top"
    "note note main"
    "note note next"
    "bottom bottom bottom" !important;
}
```

Cette simple modification permet de personnaliser l'affichage pour mieux répondre à vos besoins lors de la présentation. N'hésitez pas à expérimenter avec différentes configurations de la grille pour trouver celle qui vous convient le mieux.
