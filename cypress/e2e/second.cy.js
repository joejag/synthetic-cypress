/// <reference types="cypress" />

describe('second journey', () => {
  it('happy path', () => { 
    cy.visit('https://example.cypress.io')
    cy.contains('joe wright')
  })
})
