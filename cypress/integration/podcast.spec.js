/// <reference types="cypress" />

context("Podcast RSS feed", () => {
  beforeEach(() => {
    cy.request("http://localhost:5000/podcasts.xml");
  });
});
