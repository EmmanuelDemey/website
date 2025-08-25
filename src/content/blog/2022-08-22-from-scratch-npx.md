---
title: "From Scratch - NPX"
description: "In this new article of the 'From Scratch' series, we will dissect the NPX tool."
keywords: "NPX, tool, from scratch"
pubDate: "08/22/2022"
---

The NPX tool is a command-line utility automatically installed when we install Node.js and NPM on our machine. It allows us to easily run NPM modules without having to install them manually. Below is an example that initializes a new Angular project using the `@angular/cli` module:

```

npx @angular/cli new App

```

But if we take a closer look at its source code, this tool is essentially a simple **rewriting utility**. In fact, its only purpose is to regenerate an `npm exec` command corresponding to the action we want to perform. In this article, we’ll try to understand how it works.

In Node.js, to access the arguments passed to the command line, we work with the `argv` array. This array contains, as its first element, the executable used (in our case Node.js), and as its second element, the actual command: here, `npx`.

As mentioned earlier, `npx` is simply a rewriting tool. To achieve this, we just need to modify the `argv` array so that it matches what the `npm exec` command expects. We will:

- Replace the second element of `argv` to point to the NPM CLI script
- Insert the string `exec` as the third argument

```javascript
#!/usr/bin/env node

process.argv[1] = require.resolve("./npm-cli.js");
process.argv.splice(2, 0, "exec");
```

If we look at the documentation for the `npm exec` command, here’s how it should be used to execute the same `@angular/cli` module:

```shell
npx exec -- @angular/cli new App
```

Not a huge difference, apart from the `--`. So, we’ll add that to our `argv` array:

```javascript
#!/usr/bin/env node

process.argv[1] = require.resolve("./npm-cli.js");
process.argv.splice(2, 0, "exec");
process.argv.splice(i, 0, "--");
```

And that’s it. We now just need to pass this modified `process` object to the NPM CLI script so it can be executed:

```javascript
#!/usr/bin/env node

const cli = require("../lib/cli.js");

process.argv[1] = require.resolve("./npm-cli.js");
process.argv.splice(2, 0, "exec");
process.argv.splice(i, 0, "--");

cli(process);
```

You might be thinking: _is that really all?_
Well, yes. The script also includes some logic to transform the options so they match what NPM expects. But in my day-to-day usage, the few lines above are already sufficient to understand how NPX works internally.

You can find the complete source code of this tool in the [NPM GitHub repository](https://github.com/npm/cli), which includes the part responsible for “translating” the command-line options.
