/// <reference types="cypress" />

describe('eCommerce platforms endpoint', () => {
  it('happy path', () => {
    cy
    .request({
      method: 'GET',
      url: 'https://api-dev-8.feefo.com/api/ecommerce/plugin/ecommercetypes',
    })
    .then(res => {
      expect(res.status).to.eq(200)
      expect(res.body.eCommercePlatforms).to.exist
    })
  })
})
