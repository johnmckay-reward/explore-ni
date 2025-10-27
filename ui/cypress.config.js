const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
