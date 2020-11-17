const cypress = require("cypress");
const cron = require("node-cron");
const serveIndex = require("serve-index");
const express = require("express");
const promBundle = require("express-prom-bundle");
const client = require("prom-client");
const { merge } = require("mochawesome-merge");
const generator = require("mochawesome-report-generator");
const fse = require("fs-extra");

const scenarioStatusGauge = new client.Gauge({
  name: "scenario_status",
  help: "Indicates if the tests are passing(1), failing(-1) or not run(0)",
  labelNames: ["scenario"],
});

const scenarioTimingGuage = new client.Gauge({
  name: "scenario_timing",
  help: "How long a scenario took to run in seconds",
  labelNames: ["scenario"],
});

const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

let currentSummary = {};
app.get("/", (req, res) => {
  res.setHeader("content-type", "application/json");
  const result = {
    lastRun: {
      startedTestsAt: currentSummary.startedTestsAt,
      endedTestsAt: currentSummary.endedTestsAt,
      totalDuration: currentSummary.totalDuration,
      totalSuites: currentSummary.totalSuites,
      totalTests: currentSummary.totalTests,
      totalFailed: currentSummary.totalFailed,
      totalPassed: currentSummary.totalPassed,
      totalPending: currentSummary.totalPending,
      totalSkipped: currentSummary.totalSkipped,
    },
    statusPageLink: "http://localhost:3000/status/mochawesome.html",
    videosLink: "http://localhost:3000/videos",
    screenshotsLink: "http://localhost:3000/screenshots",
  };
  res.send(JSON.stringify(result, null, 4));
});

app.get("/debug", (req, res) => {
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(currentSummary, null, 4));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Synthetic Cypress listening at http://localhost:${PORT}`);
});

// Enable directory lists of videos, screenshots and the test report
app.use("/videos", serveIndex(__dirname + "/cypress/videos"));
app.use("/videos", express.static(__dirname + "/cypress/videos"));
app.use("/screenshots", serveIndex(__dirname + "/cypress/screenshots"));
app.use("/screenshots", express.static(__dirname + "/cypress/screenshots"));
app.use("/status", serveIndex(__dirname + "/mochawesome-report"));
app.use("/status", express.static(__dirname + "/mochawesome-report"));

// Run every minute
cron.schedule("* * * * *", function () {
  console.log("Running tests...");

  fse.remove("cypress/results").then(() => {
    runTests((summary) => {
      currentSummary = summary;
      fse
        .remove("mochawesome-report")
        .then(() => merge({ files: ["cypress/results/*.json"] }))
        .then((r) => generator.create(r));

      // set guages
      scenarioStatusGauge.set({ scenario: "rollup" }, 1);
      scenarioStatusGauge.set({ scenario: "test name" }, 1);
      scenarioTimingGuage.set({ scenario: "test name" }, 123);
    });
  });
});

const runTests = (cb) => {
  cypress
    .run({
      quiet: true,
      config: {
        video: true,
      },
      specs: "./cypress/integration/*-spec.js",
    })
    .then((runsResults) => {
      cb(runsResults);
    });
};
