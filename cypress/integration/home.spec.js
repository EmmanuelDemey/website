/// <reference types="cypress" />

context("Home", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5000");
  });

  it("should have a title", () => {
    // https://on.cypress.io/window
    cy.get("title").should("not.be.empty");
  });
});
