# Synthetic Cypress

> Synthetic monitoring is a monitoring technique that is done by using an emulation or scripted recordings of transactions
> [Wikipedia article](https://en.wikipedia.org/wiki/Synthetic_monitoring)

# Prerequisites

* docker
* nvm
* npm

* Run this once to install a modern version of node: 
`nvm install 18.16.1`

* Run this in the shell you are using 
`nvm use 18.16.1`

* Install dependencies
`npm install`

# Run

Run with `npm start` which starts a service on port 3000. You can play with the Cypress tests directly via `npm run cy:open`

## What does this do?

It runs a Cypress test suite, waits for 1 minutes then runs it again and records the results to http://localhost:3000

If you visit that URL it will give you links to other options such as:

- Videos of each test run
- An easy to read status page (generated with [Mochawesome](https://www.npmjs.com/package/mochawesome))
- A JSON API endpoint for querying the existing state
- Prometheus endpoints for monitoring results, which could be consumed via Grafana

## Environment Variables

You can configure how the server runs:

- `SLEEP_MINS`: How long to wait in minutes between a test run finishing before starting a new run (default: 1 minute)
- `SPECS_REGEX`: Select which specs to run (default all: "/cypress/e2e/\*.cy.js")
- `PORT`: What HTTP port to run the server on (default: 3000)
- `ALERT_THRESHOLD`: Numbers of failures for any given monitor to trigger an alert
- `TEAMS_ALERT_URL`: The URL to post Teams alert message 

## Running with Docker

Docker commands are contained in convenience scripts located in ./bin
