---
title: "From Scratch - Cypress Axe"
description: "Here is the first article in a series we will call 'From Scratch'. The purpose of these articles is to take an open-source project, read its code, and try to explain how it works."
keywords: "cypress, test, from scratch"
pubDate: "08/22/2022"
---

What’s the point? Simply to better understand a product we might be using every day, discover new development approaches, or learn useful practices.

As our first open-source project, we’ll study the **cypress-axe** plugin. This plugin adds support for **axe** (a tool used to run accessibility audits) within Cypress end-to-end tests.

Before diving into the internals of the plugin, let’s first take a quick look at how it is used in a simple Cypress test.

```javascript
beforeEach(() => {
   cy.visit('http://localhost:9000');
   cy.injectAxe();
   cy.configureAxe({ ... });
   cy.checkA11y();
})
```

Now that the introduction is done, let’s start looking at the source code.
To ensure we’re not tied to future releases of **cypress-axe**, we’ll analyze the current version’s source code.

The first thing we need to define are the three new Cypress commands we saw above. For that, we’ll use the **Cypress.Commands.add** method.

```javascript
const injectAxe = () => {};
const configureAxe = () => {};
const checkA11y = () => {};

Cypress.Commands.add("injectAxe", injectAxe);
Cypress.Commands.add("configureAxe", configureAxe);
Cypress.Commands.add("checkA11y", checkA11y);
```

### injectAxe

As mentioned earlier, this method loads the Axe library into the tested page. For this to work, **axe-core** must be locally installed.

```shell
npm install -D axe-core
```

The logic here is fairly simple:
We first retrieve the contents of the **axe-core** library (from `node_modules`), then evaluate it with JavaScript’s `eval` inside the context of the tested page.

For TypeScript compatibility, we first check that `require.resolve` is indeed a function. This allows us to retrieve the path to `axe.min.js`.

We then use two Cypress functions:

- `cy.readFile` to read a file’s contents
- `cy.window` to interact with the tested page’s context

Here’s the complete implementation:

```javascript
export const injectAxe = () => {
  const fileName =
    typeof require?.resolve === "function"
      ? require.resolve("axe-core/axe.min.js")
      : "node_modules/axe-core/axe.min.js";

  cy.readFile(fileName).then((source) =>
    cy.window({ log: false }).then((window) => {
      window.eval(source);
    }),
  );
};
```

Most Cypress methods accept a `log` option, which controls whether the command’s execution is displayed in the Cypress logs.

### configureAxe

The second method, `configureAxe`, is the simplest of the three. It’s just a pass-through to Axe’s `configure` API.

As before, we enter the page context with `cy.window`, then call `axe.configure`:

```javascript
export const configureAxe = (configurationOptions = {}) => {
  cy.window({ log: false }).then((win) => {
    return win.axe.configure(configurationOptions);
  });
};
```

### checkA11y

Now let’s actually run the accessibility audit by implementing `checkA11y`.

First, we define a TypeScript interface for the accepted options. It extends `axe.RunOptions` with a new property, `includedImpacts`, which is an array of strings used to filter violations by severity.

```javascript
export interface Options extends axe.RunOptions {
  includedImpacts?: string[];
}
```

The method accepts 4 parameters:

- `context`: the part of the DOM to analyze
- `options`: audit parameters
- `violationCallback`: a callback executed with the detected violations
- `skipFailures`: whether to ignore test failures

```javascript
const checkA11y = (
  context?: axe.ElementContext,
  options?: Options,
  violationCallback?: (violations: axe.Result[]) => void,
  skipFailures = false
) => {
  ...
}
```

We also need a small helper function to validate that our parameters aren’t empty objects:

```javascript
function isEmptyObjectorNull(value: any) {
  if (value == null) {
    return true;
  }
  return Object.entries(value).length === 0 && value.constructor === Object;
}
```

The core of the function calls `axe.run` and returns the list of violations. If `includedImpacts` is defined, we filter the violations accordingly.

```javascript
cy.window({ log: false }).then((win) => {
  if (isEmptyObjectorNull(context)) context = undefined;
  if (isEmptyObjectorNull(options)) options = undefined;
  if (isEmptyObjectorNull(violationCallback)) violationCallback = undefined;

  const { includedImpacts, ...axeOptions } = options || {};

  return win.axe
    .run(context || win.document, axeOptions)
    .then(({ violations }) => {
      return includedImpacts &&
        Array.isArray(includedImpacts) &&
        includedImpacts.length
        ? violations.filter(
            (v) => v.impact && includedImpacts.includes(v.impact),
          )
        : violations;
    });
});
```

Once we have the violations, we:

- call the `violationCallback` if defined
- log each violation with `Cypress.log` (only once per violation, even if multiple nodes are affected)

```javascript
if (violations.length) {
  if (violationCallback) violationCallback(violations);

  violations.forEach((v) => {
    const selectors = v.nodes
      .reduce((acc, node) => acc.concat(node.target), [])
      .join(", ");

    Cypress.log({
      $el: Cypress.$(selectors),
      name: "a11y error!",
      consoleProps: () => v,
      message: `${v.id} on ${v.nodes.length} Node${v.nodes.length === 1 ? "" : "s"}`,
    });
  });
}

return cy.wrap(violations, { log: false });
```

Finally, we determine the test state. If `skipFailures` is false, we assert that there are no violations. Otherwise, we log a summary.

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

Here is the complete code for the `checkA11y` function:

```javascript
export interface Options extends axe.RunOptions {
  includedImpacts?: string[];
}

const checkA11y = (
  context?: axe.ElementContext,
  options?: Options,
  violationCallback?: (violations: axe.Result[]) => void,
  skipFailures = false
) => {
  cy.window({ log: false })
    .then((win) => {
      if (isEmptyObjectorNull(context)) context = undefined;
      if (isEmptyObjectorNull(options)) options = undefined;
      if (isEmptyObjectorNull(violationCallback)) violationCallback = undefined;

      const { includedImpacts, ...axeOptions } = options || {};

      return win.axe
        .run(context || win.document, axeOptions)
        .then(({ violations }) => {
          return includedImpacts && Array.isArray(includedImpacts) && includedImpacts.length
            ? violations.filter((v) => v.impact && includedImpacts.includes(v.impact))
            : violations;
        });
    })
    .then((violations) => {
      if (violations.length) {
        if (violationCallback) violationCallback(violations);

        violations.forEach((v) => {
          const selectors = v.nodes
            .reduce((acc, node) => acc.concat(node.target), [])
            .join(', ');

          Cypress.log({
            $el: Cypress.$(selectors),
            name: 'a11y error!',
            consoleProps: () => v,
            message: `${v.id} on ${v.nodes.length} Node${
              v.nodes.length === 1 ? '' : 's'
            }`,
          });
        });
      }

      return cy.wrap(violations, { log: false });
    })
    .then((violations) => {
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

And that’s it — the library is complete. Pretty simple for a first “From Scratch” article, right?

In conclusion, here are the Cypress methods we discovered in this article:

```javascript
cy.readFile;
cy.window;
Cypress.log;
cy.wrap;
Cypress.$;
```

I hope you found this article interesting. Stay tuned for the next one, and feel free to suggest libraries you’d like me to explore in this series. You can reach out to me on Twitter.
