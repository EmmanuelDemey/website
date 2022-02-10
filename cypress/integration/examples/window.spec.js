/// <reference types="cypress" />

const HomePage = {
  title: 'h2.p-name',
  publicationTime: 'time'
}

const viewports = ["macbook-13", "iphone-8"]
viewports.forEach(viewport => {
  context('Home Page ' + viewport, () => {
    beforeEach(() => {
      cy.viewport(viewport)
      cy.visitAndCheckA11Y('/')
    })
  
    it('shoudl contain the right title', () => {
      // CSS selectors / document.querySelectorAll
      cy.get(HomePage.title).should("have.text", "Communication entre composants")
      cy.get(HomePage.publicationTime).should("be.visible")
    })
  
    /* ==== Test Created with Cypress Studio ==== */
    it('generateTests', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('#main-nav > ul > :nth-child(3) > a').click();
      cy.get('ul > :nth-child(1) > a').click();
  
  
      /* ==== End Cypress Studio ==== */
    });
  })
})

