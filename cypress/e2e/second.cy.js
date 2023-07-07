/// <reference types="cypress" />

describe('eCommerce industries endpoint', () => {
  it('happy path', () => {
    cy
    .request({
      method: 'GET',
      url: 'https://api-dev-8.feefo.com/api/ecommerce/plugin/industries',
    })
    .then(res => {
      expect(res.status).to.eq(200)
      expect(res.body.merchantindustry).to.exist
    })
  })
})
