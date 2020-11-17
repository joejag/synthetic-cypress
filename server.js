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

let currentSummary = { runs: [] };
app.get("/", (req, res) => {
  res.setHeader("content-type", "application/json");
  const baseUrl = req.protocol + "://" + req.get("Host");
  const result = summaryAsJson(currentSummary, baseUrl);
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
cron.schedule("* * * * *", () => {
  console.log("Running tests...");

  fse
    .remove("cypress/results")
    .then(() => runTests())
    .then((summary) => (currentSummary = summary))
    .then(() => generateHtmlReport())
    .then(() => updateGuages(currentSummary));
});

const runTests = () => {
  return cypress.run({
    quiet: true,
    config: {
      video: true,
    },
    specs: "./cypress/integration/*-spec.js",
  });
};

const generateHtmlReport = () => {
  return fse
    .remove("mochawesome-report")
    .then(() => merge({ files: ["cypress/results/*.json"] }))
    .then((r) => generator.create(r))
    .then(() => updateGuages(currentSummary));
};

const summaryAsJson = (results, baseUrl) => {
  const tests = [];
  results.runs.forEach((run) => {
    const videoLink = baseUrl + "/videos/" + run.video.split("/").slice(-1)[0];

    run.tests.forEach((test) => {
      const title = test.title.join(" | ");
      const state = test.state;
      tests.push({ title, state, videoLink });
    });
  });

  return {
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
      tests,
    },
    statusPageLink: baseUrl + "/status/mochawesome.html",
    videosLink: baseUrl + "/videos",
    screenshotsLink: baseUrl + "/screenshots",
    metricsLink: baseUrl + "/metrics",
  };
};

const updateGuages = (results) => {
  let allPassing = true;

  results.runs.forEach((run) => {
    run.tests.forEach((test) => {
      const title = test.title.join(" | ");
      const duration = test.attempts[0].duration;
      let state = 0;
      if (test.state === "passed") state = 1;
      if (test.state === "failed") state = -1;
      if (test.state === "failed") allPassing = false;

      scenarioStatusGauge.set({ scenario: title }, state);
      scenarioTimingGuage.set({ scenario: title }, duration);
    });
  });

  scenarioStatusGauge.set({ scenario: "rollup" }, allPassing ? 1 : -1);
};
