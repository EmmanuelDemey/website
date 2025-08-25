---
title: "Including Custom Rules in Sonar"
description: "In this article, I will explain how we can include custom Sonar rules directly from our CI."
keywords: "sonar, plugin, rule, quality"
pubDate: "03/28/2023"
---

A few weeks ago, I created an NPM module that estimates the environmental impact of a digital service, based on the calculations from [EcoIndex.fr](https://ecoindex.fr) and the **GreenIT Analysis** plugin. Here’s the GitHub repository of my little project 😁

One question remained open for one of my clients who was using this module: **How can we integrate these results into Sonar?**

The purpose of this short article is to announce that it is indeed possible to include **custom rules** in Sonar. The only requirement is to generate a JSON file that follows this structure:

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

This is a basic example of such a file. Additional parameters can be added, for example the line numbers where the error was detected. The **most important property** is `filePath`, which must point to a file that Sonar recognizes. If it doesn’t, Sonar will simply not display your custom rule.

Once this file is generated, you just need to include it in your Sonar configuration file, and that’s it:

```
sonar.projectKey=training:external-issues
sonar.projectName=Training: External issues import

sonar.externalIssuesReportPaths=issues.json
```
