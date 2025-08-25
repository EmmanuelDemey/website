---
title: "A Lesser-Known Way to Share Data Between Angular Components"
description: "Angular offers multiple syntaxes to share information between components. But do you know this one?"
keywords: "angular, inject"
pubDate: "03/24/2021"
---

We are used to using dependency injection with Angular in order to share information. But did you know that it is also possible to directly retrieve the parent component inside the TypeScript class of another component?

### Use Case

When we need to transfer information between two **indirect components**, we immediately think of two solutions:

- Setting up a service
- Installing and configuring heavy artillery such as NgRX

I have absolutely nothing against these two solutions, but for some cases, this is not necessary. If two components are, for example, always used together for the same feature (the component split was only made to improve readability and maintainability of our code), we can, at any time, inject from a child component an instance of one of its parent components (direct or indirect).

### Implementation

To achieve this, we will use the same syntax as for service injection: by defining a new parameter in the component’s constructor. If you are familiar with Angular’s mechanics, you already know that Angular relies on the parameter’s type to determine which object should be injected. In the case presented in this article, the type will simply be the one of the component(s) we want to inject.

For example, if we have a `TabComponent` in which we want to inject the parent `TabsComponent`, we just need to write the following code:

```typescript
@Component({ ...}}
export class TabComponent {
    constructor(private list: TabsComponent) {}
}
```

Once this injection is done, we can use the methods and variables of the `TabsComponent` instance.
This practice is notably used in the `Accordion` component of the **ng-bootstrap** library. In fact, in the `NgPanelToggle` directive (responsible for opening and closing the displayed content), the `Accordion` component itself is injected so that its `toggle` method can be called when the user clicks the button.

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
    @Optional() @Host() public panel: NgbPanel,
  ) {}
}
```

This is my very first article on Angular (actually the very first article of this blog). More articles are planned, so feel free to come back and read them.
