/// <reference types="cypress" />

context("Menu", () => {
  [
    ["http://localhost:5000", 1],
    ["http://localhost:5000/articles.html", 2],
    ["http://localhost:5000/events.html", 3],
  ].forEach(([page, i]) => {
    it(`should have the ${i} menu item active`, () => {
      cy.visit(page);
      cy.get(`#main-nav li:nth-child(${i}) a`).should("have.attr", "aria-current", "page");
    });
  })

});
