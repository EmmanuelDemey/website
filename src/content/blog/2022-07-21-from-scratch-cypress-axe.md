---
title: "From Scratch - Cypress Axe"
description: "Voici le premier article d'une série que nous allons nommer “From Scratch”. Le but de ces articles est de prendre un projet open-source, d’en lire le code et essayer d’en expliquer le fonctionnement."
pubDate: "08/22/2022"
---

Quel en est l’intérêt ? Tout simplement de comprendre un produit que nous utilisons peut être tous les jours, découvrir certaines manières de développer ou encore apprendre certaines pratiques.

Comme premier projet open source, nous allons étudier le plugin cypress-axe . Ce plugin permet d'ajouter le support de axe (outil permettant de faire des audits d'accessibilité) dans des tests d'interface graphique conçus avec Cypress .

Avant de rentrer dans les entrailles de ce plugin, voici tout d'abord, en un coup d'oeil, comment il s'utilise dans un test Cypress assez simple.

```javascript
beforeEach(() = {
   cy.visit('http://localhost:9000');
   cy.injectAxe();
   cy.configureAxe({ ... });
   cy.checkA11y();
})
```

Une fois cette introduction terminée, nous allons commencer à regarder le code source. Afin de gérer les éventuelles montées de version de cypress-axe , le code source que nous allons décortiquer correspond à celui-ci

La première chose que nous allons définir correspond aux trois nouvelles commandes Cypress vues précédemment. Pour cela nous allons utiliser la méthode Cypress **Commands.add** .

````javascript
const injectAxe = () = { }
const configureAxe = () = { }
const injeccheckA11ytAxe = () = { }

Cypress.Commands.add('injectAxe', injectAxe);

Cypress.Commands.add('configureAxe', configureAxe);

Cypress.Commands.add('checkA11y', checkA11y);


## injectAxe

Comme indiqué précédemment, cette méthode permet d’inclure la librairie Axe dans la page testée. Pour cela, il faut tout d’abord que axe-core soit localement installé.

```shell
npm install -D axe-core
````

Le fonctionnement de ce code est assez simple. Nous allons tout d’abord récupérer le contenu de la librairie axe-core , disponible localement dans le répertoire node_modules . Nous allons ensuite l’évaluer, grâce à la méthode JavaScript eval , dans le context de la page testée.

Pour des raisons de compatibilité avec le compilateur TypeScript, nous devons tout d’abord vérifier que la méthode require.resolve est bien une fonction. Elle nous permettra de récupérer le chemin vers le fichier axe.min.js .

Nous allons ensuite utiliser deux fonctions du framework Cypress :

- cy.readFile permet de lire le contenu d’un fichier
- cy.window permet d’entrer dans le context de la page testée.

Vous trouverez ci-dessous le code complet de cette fonction. La librairie Axe est à présent chargée dans la page que nous sommes en train de tester.

```javascript
export const injectAxe = () = {
    const fileName =
        typeof require?.resolve === 'function'
            ? require.resolve('axe-core/axe.min.js')
            : 'node_modules/axe-core/axe.min.js';

        cy.readFile(fileName).then((source) =
            cy.window({ log: false }).then((window) = {
            window.eval(source);
        })
    );
};
```

La plupart des méthodes de Cypress accept une option log , qui permet d’indiquer si l’exécution de cette commande doit s’afficher dans les logs générés par le framework.

##

configureAxe
La deuxième méthode que nous allons aborder est la méthode configureAxe . C’est la plus simple des trois méthodes. Car en effet, elle fait juste office de passe plat vers l’API de configuration de axe.

Comme précédemment, nous devons tout d’abord entrer dans le context de la page testée, pour ensuite appeler la méthode configure de l’objet axe précédemment importé (via la méthode injectAxe).

```javascript
export const configureAxe = (configurationOptions = {}) = {
    cy.window({ log: false }).then((win) = {
        return win.axe.configure(configurationOptions);
    });
};
```

## checkA11y

Nous allons à présenter lancer l’audit à proprement parlé. Pour cela, nous allons implémenter la méthode checkA11y .

Nous allons tout d’abord définir une interface TypeScript correspondant aux options acceptés par cette méthode. Cette interface correspondra à celle définie par axe axe.RunOptions, en y ajoutant une propriété includedImpacts , correspondant à un tableau de chaines de caractères.

Cette propriété nous permettra ultérieurement de filter les violations détectées.

```javascript
export interface Options extends axe.RunOptions {
  includedImpacts?: string[];
}
```

La méthode checkA11y va accepter 4 paramètres :

- context : indique le context de l’analyse (par exemple la partie du DOM testé)
- options : les paramètres définis par l’interface ci-dessus
- violationCallback : un fonction qui sera appelée avec les violations détectées
- skipFailures : permet d’ignorer les erreurs .

```javascript
const checkA11y = (
context?: axe.ElementContext,
options?: Options,
violationCallback?: (violations: axe.Result[]) = void,
skipFailures = false
) = {
...
}
```

Dans l’implémentation de cette fonction, nous allons, comme vu précédement, tout d’abord se placer dans le contexte de la page testée. Une fois cela réalisé, nous allons s’assurer que les paramètres sont bien valorisés (et les mettre à undefined si ce n’est pas le cas). Pour cela nous allons utiliser une nouvelle fonction utilitaire isEmptObjectorNull .

```javascript
function isEmptyObjectorNull(value: any) {
  if (value == null) {
    return true;
  }
  return Object.entries(value).length === 0 && value.constructor === Object;
}
```

Une fois cela réalisé, nous allons pouvoir appeler la méthode axe.run permettant d’auditer notre page. Cette méthode retourne une Promise, qui quand elle est résolue, retourne un tableau de violations.

Si nous avons défini le paramètre includedImpacts (et si c’est un tableau), nous allons filtrer les violations retournées. Si nous ne l’avons pas défini, nous allons retourner le tableau complet.

```javascript
cy.window({ log: false })
    .then((win) = {
        if (isEmptyObjectorNull(context)) {
            context = undefined;
        }
        if (isEmptyObjectorNull(options)) {
            options = undefined;
        }
        if (isEmptyObjectorNull(violationCallback)) {
            violationCallback = undefined;
        }
        const { includedImpacts, ...axeOptions } = options || {};
        return win.axe
            .run(context || win.document, axeOptions)
    .then(({ violations }) = {
return includedImpacts &&
Array.isArray(includedImpacts) &&
Boolean(includedImpacts.length)
? violations.filter(
(v) = v.impact && includedImpacts.includes(v.impact)
)
: violations;
});
})
```

Une fois ce code exécuté, nous allons récupérer un tableau de violations. Si ce tableau n’est pas vide, nous allons faire plusieurs choses :

Appeler le paramètre violationCallback si il est défini.
Appeler la méthode Cypress.log pour logger les violations. Une violation sera affichée une et une seule fois, meme si elle a été détectée sur plusieurs noeuds HTML.

```javascript
if (violations.length) {
if (violationCallback) {
violationCallback(violations);
}
violations.forEach((v) = {
const selectors = v.nodes
.reduce((acc, node) = acc.concat(node.target), [])
.join(', ');

        Cypress.log({
            $el: Cypress.$(selectors),
            name: 'a11y error!',
            consoleProps: () = v,
            message: `${v.id} on ${v.nodes.length} Node${
                v.nodes.length === 1 ? '' : 's'
            }`,
        });
    });

}

return cy.wrap(violations, { log: false });
```

La dernière partie de cette fonction est de gérer l’état de nos tests en fonction des violations détectées. Pour cela, si le paramètre skipFailure est falsy, nous allons réaliser une assertion et ainsi vérifier que le nombre de violations est égale à 0.

Si ce n’est pas le cas, nous allons juste appeler la méthode Cypress.log vue précédemment.

```javascript
if (!skipFailures) {
  assert.equal(
    violations.length,
    0,
    `${violations.length} accessibility violation${
      violations.length === 1 ? "" : "s"
    } ${violations.length === 1 ? "was" : "were"} detected`,
  );
} else if (violations.length) {
  Cypress.log({
    name: "a11y violation summary",
    message: `${violations.length} accessibility violation${
      violations.length === 1 ? "" : "s"
    } ${violations.length === 1 ? "was" : "were"} detected`,
  });
}
```

Voici le code complet de cette dernière méthode de la librairie étudiée dans cet article.

```javascript
export interface Options extends axe.RunOptions {
includedImpacts?: string[];
}

const checkA11y = (
context?: axe.ElementContext,
options?: Options,
violationCallback?: (violations: axe.Result[]) = void,
skipFailures = false
) = {
cy.window({ log: false })
.then((win) = {
if (isEmptyObjectorNull(context)) {
context = undefined;
}
if (isEmptyObjectorNull(options)) {
options = undefined;
}
if (isEmptyObjectorNull(violationCallback)) {
violationCallback = undefined;
}
const { includedImpacts, ...axeOptions } = options || {};
return win.axe
.run(context || win.document, axeOptions)
.then(({ violations }) = {
return includedImpacts &&
Array.isArray(includedImpacts) &&
Boolean(includedImpacts.length)
? violations.filter(
(v) = v.impact && includedImpacts.includes(v.impact)
)
: violations;
});
})
.then((violations) = {
if (violations.length) {
if (violationCallback) {
violationCallback(violations);
}
violations.forEach((v) = {
const selectors = v.nodes
.reduce((acc, node) = acc.concat(node.target), [])
.join(', ');

                    Cypress.log({
                        $el: Cypress.$(selectors),
                        name: 'a11y error!',
                        consoleProps: () = v,
                        message: `${v.id} on ${v.nodes.length} Node${
                            v.nodes.length === 1 ? '' : 's'
                        }`,
                    });
                });
            }

            return cy.wrap(violations, { log: false });
        })
        .then((violations) = {
            if (!skipFailures) {
                assert.equal(
                    violations.length,
                    0,
                    `${violations.length} accessibility violation${
                        violations.length === 1 ? '' : 's'
                    } ${violations.length === 1 ? 'was' : 'were'} detected`
                );
            } else if (violations.length) {
                Cypress.log({
                    name: 'a11y violation summary',
                    message: `${violations.length} accessibility violation${
                        violations.length === 1 ? '' : 's'
                    } ${violations.length === 1 ? 'was' : 'were'} detected`,
                });
            }
        });

};
```

Et voilà, la librairie est terminée. Assez simple comme premier article non ? En conclusion, voici les méthodes Cypress que nous avons découvert lors de cet article

```javascript
cy.readFile;
cy.window;
Cypress.log;
cy.wrap;
Cypress.$;
```

J’espère que vous avez trouvé cet article intéressant. Ke vous donne donc rendez-vous pour le prochain. Je vous invite à me donner des idées de librairies à décortiquer dans ces articles. Pour cela, n’hésitez pas à me contacter sur Twitter.
