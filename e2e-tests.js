const cypress = require('cypress')
const cron = require('node-cron')
const serveIndex = require('serve-index')
const express = require('express')

const app = express()

let currentSummary = {}
app.get('/', (req, res) => {
  res.setHeader('content-type', 'application/json')
  const result = {
    startedTestsAt: currentSummary.startedTestsAt,
    endedTestsAt: currentSummary.endedTestsAt,
    totalDuration: currentSummary.totalDuration,
    totalSuites: currentSummary.totalSuites,
    totalTests: currentSummary.totalTests,
    totalFailed: currentSummary.totalFailed,
    totalPassed: currentSummary.totalPassed,
    totalPending: currentSummary.totalPending,
    totalSkipped: currentSummary.totalSkipped
  }
  res.send(JSON.stringify(result, null, 4))
})

app.get('/debug', (req, res) => {
  res.setHeader('content-type', 'application/json')
  res.send(JSON.stringify(currentSummary, null, 4))
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Synthetic Cypress listening at http://localhost:${PORT}`)
})

// Enable directory lists of videos
app.use('/videos', serveIndex(__dirname + '/cypress/videos'))
app.use('/videos', express.static(__dirname + "/cypress/videos"))

// Run every minute
cron.schedule('* * * * *', function() {
  console.log('Running tests...')
  runTests((summary) => {
    currentSummary = summary
  })
})

const runTests = (cb) => {
  cypress.run({
      quiet: true,
      config: {
        video: true,
      },
      specs: './cypress/integration/*-spec.js'
    })
    .then((runsResults) => {
      cb(runsResults)
    })
}