import { Resvg } from "@resvg/resvg-js";
import type { AstroIntegration } from "astro";
import { parse } from "node-html-parser";
import { readFile, writeFile } from "node:fs/promises";
import satori from "satori";
import { html } from "satori-html";

interface OgImageTemplateProps {
  title?: string;
  summary: string;
}

function OgImageTemplate({ title, summary }: OgImageTemplateProps) {
  return html`
    <style>
      .container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding: 3rem;
        align-items: center;
        text-align: center;
        justify-content: center;
        color: black;
        background-color: #e8ebec;
      }

      .title {
        display: flex;
        font-weight: bold;
        font-size: 4rem;
        margin-bottom: 2rem;
      }

      .description {
        display: flex;
        font-size: 2rem;
        margin-bottom: 3rem;
      }
    </style>
    <div class="container">
      <div class="title">${title}</div>
      <div class="description">${summary}</div>
    </div>
  `;
}

interface GenerateOgImageProps {
  route: { pathname: string };
}

async function generateOgImage({ route }: GenerateOgImageProps) {
  const html = await readFile(`./dist/${route.pathname}/index.html`, {
    encoding: "utf-8",
  });
  const root = parse(html.toString());
  const title = root
    .querySelector("title")
    ?.innerText?.replace("| Blog | Vaduo", "");
  const summaryElement =
    root.querySelector('[itemprop="abstract"]') ??
    root.querySelector('meta[name="description"]');

  const summary = summaryElement ? summaryElement.textContent : "";
  const template = OgImageTemplate({
    title,
    summary,
  });

  try {
    const svg = await satori(template, {
      width: 1200,
      height: 600,
      fonts: [
        {
          name: "Subjectivity",
          data: await readFile("./public/fonts/quicksand-light-webfont.woff"),
          style: "normal",
        },
      ],
    });

    const writePath = `${route.pathname}/index-og.png`;

    const resvg = new Resvg(svg, {});
    const png = resvg.render();
    const pngBuffer = png.asPng();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await writeFile(`./dist/${writePath}`, pngBuffer as any);
  } catch (e) {
    console.error("Could not generate og:image for route", route.pathname, e);
  }
}

export function satoriPlugin(): AstroIntegration {
  return {
    name: "satori-plugin",
    hooks: {
      "astro:build:done": async ({ pages }) => {
        console.log("Build done, generate og:image for each route");

        const images = pages.map((route) =>
          generateOgImage({
            route,
          }),
        );

        await Promise.all(images);
      },
    },
  };
}
