const MongodbMemoryServer = require('mongodb-memory-server').default;
const NodeEnvironment = require('jest-environment-node');

class TestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();
    this.global.__MONGODB_SERVER_ = new MongodbMemoryServer({
      autoStart: false,
      binary: { version: '3.6.8' }
    });
  }

  async teardown() {
    this.global.__MONGODB_SERVER_ = undefined;
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = TestEnvironment;
