import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  videoCompression: 15,
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: false,
    json: true,
  },
  e2e: {
    setupNodeEvents(on, config) {},
    supportFile: false,
  },
})
