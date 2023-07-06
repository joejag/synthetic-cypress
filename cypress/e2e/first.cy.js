/// <reference types="cypress" />

describe('first journey', () => {
  it('happy path', () => {
    cy.visit('https://example.cypress.io')
    cy.contains('type')
  })
})
