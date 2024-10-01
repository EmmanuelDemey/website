---
title: "Communication entre composants"
description: "Angular propose de multiples syntaxes pour partager de l'informations entre des composants.Mais connaissez-vous celle-ci ?"
pubDate: "03/24/2021"
---

Nous avons l'habitude d'utiliser l'injection de dépendances avec Angular afin de pouvoir notamment partager de l'information. Mais saviez-vous qu'il était également possible de récupérer directement le composant parent directement dans la classe TypeScript d'un autre composant ?

## Cas d'utilisation

Lorsque nous devons faire transiter de l'informations entre deux composants indirects, nous pensons immédiatement à deux solutions :

- Mettre en place un service
- Installer et configurer l'artillerie lourde comme par exemple NgRX

Je n'ai absolument rien contre ces deux solutions, mais pour certains cas, cela n'est pas nécessaire. Si deux composants sont par exemple toujours utilisés ensemble, pour une même fonctionnalité (le découpage en composants a été réalisé juste pour faciliter la lecture et la maintenabilité de notre code), nous pouvons, à tout moment, injecter depuis un composant enfant une instance de l'un de ces composants parent (direct ou indirect).

## Mise en place

Pour cela, nous allons utiliser la même syntaxe que pour l'injection de service : en définissant un nouveau paramètre dans le constructeur du composant. Si vous êtes familier avec le fonctionnement d'Angular, vous savez déjà qu'Angular se base sur le type du paramètre afin de déterminer quel objet doit être injecté. Dans la cas présenté dans cet article, le type sera tout simplement celui du ou des composants à injecter.

Si nous avons par exemple un composant TabComponent dans lequel nous souhaitons injecter le composant parent TabsComponent , il suffit d'écrire le code suivant :

```typescript
@Component({ ...}}
export class TabComponent {
    constructor(private list: TabsComponent) {}
}
```

Une fois cette injection réalisée, nous pouvons utiliser les méthodes et variables de l'instance du composant TabsComponent . Cette pratique est notamment utilisée dans le composant Accordion de la librairie ng-bootstrap . En effet, dans la directive NgPanelToggle (en charge d'ouvrir et de fermer le contenu affiché), le composant Accordion lui-même est injecté afin de pouvoir appeler sa méthode toggle quand l'utilisateur clique sur le bouton.

```typescript
@Directive({
  selector: "button[ngbPanelToggle]",
  host: {
    type: "button",
    "[disabled]": "panel.disabled",
    "[class.collapsed]": "!panel.isOpen",
    "[attr.aria-expanded]": "panel.isOpen",
    "[attr.aria-controls]": "panel.id",
    "(click)": "accordion.toggle(panel.id)",
  },
})
export class NgbPanelToggle {
  static ngAcceptInputType_ngbPanelToggle: NgbPanel | "";

  @Input()
  set ngbPanelToggle(panel: NgbPanel) {
    if (panel) {
      this.panel = panel;
    }
  }

  constructor(
    public accordion: NgbAccordion,
    @Optional() @Host() public panel: NgbPanel
  ) {}
}
```

Ceci est mon premier article sur Angular (en fait le tout premier article de ce blog). D'autres articles sont prévus. Donc n'hésitez pas à revenir les lire.
