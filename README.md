# Synthetic Cypress

> Synthetic monitoring is a monitoring technique that is done by using an emulation or scripted recordings of transactions
> [Wikipedia article](https://en.wikipedia.org/wiki/Synthetic_monitoring)

This repo is a starter template to get you running Cypress tests continuously against one of your environments.

Run with `npm start` which starts a service on port 3000. You can play with the Cypress tests directly via `npm run cy:open`

## What does this do?

It runs a Cypress test suite, waits for 5 minutes then runs it again and records the results to http://localhost:3000

If you visit that URL it will give you links to other options such as:

- Videos of each test run
- An easy to read status page (generated with [Mochawesome](https://www.npmjs.com/package/mochawesome))
- A JSON API endpoint for querying the existing state
- Prometheus endpoints for monitoring results, which could be consumed via Grafana

## Environment Variables

You can configure how the server runs:

- `SLEEP_MINS`: How long to wait in minutes between a test run finishing before starting a new run (default: 5 minutes)
- `SPECS_REGEX`: Select which specs to run (default all: "/cypress/integration/\*-spec.js")
- `PORT`: What HTTP port to run the server on (default: 3000)

## Running with Docker

If you'd prefer not to install node, you can use the supplied `Dockerfile` to run inside Docker with.

```
docker build -t synthetic-cypress .
docker run -p 3000:3000 synthetic-cypress

```
