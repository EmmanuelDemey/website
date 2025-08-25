---
title: "Speaker Notes in Sli.dev Full Screen"
description: "How can we display Sli.dev speaker notes in full screen?"
keywords: "slidev, conference"
pubDate: "05/21/2024"
---

A short article to revive this blog :D. Recently, I needed to display the presenter notes in full screen for a presentation built with Sli.dev. However, after going through the Sli.dev documentation, I couldn’t find a built-in solution. Fortunately, this isn’t really a problem, since Sli.dev presentations are just web pages — we only need to tweak a bit of CSS.

Sli.dev’s layout relies on **CSS Grid**. If we want to change the layout, we simply redefine the grid based on the desired result. For example, if we want the presenter notes area to span two rows and two columns across the entire grid, we can adjust the CSS like this:

```css
.slidev-presenter .grid-container {
  grid-template-areas:
    "top top top"
    "note note main"
    "note note next"
    "bottom bottom bottom" !important;
}
```

This small change makes it easy to customize the display to better fit your presentation needs. Feel free to experiment with different grid configurations to find the one that works best for you.
