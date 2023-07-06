/// <reference types="cypress" />

describe('first journey', () => {
  it('happy path', () => {
    cy
    .request({
      method: 'GET',
      url: 'https://example.cypress.io',
    })
    .then(res => {
      expect(res.status).to.eq(200)
      expect(res.body).to.contain('type')
    })
  })
})
