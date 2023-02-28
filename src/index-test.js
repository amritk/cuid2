const { describe } = require("riteway");
const {
  createId,
  init,
  getConstants,
  createCounter,
  createFingerprint,
  isCuid,
} = require("./index");

const { info } = require("./test-utils.js");

describe("Cuid2", async (assert) => {
  {
    const id = createId();
    info(id);

    assert({
      given: "nothing",
      should: "return a cuid string",
      actual: typeof id,
      expected: "string",
    });
  }

  {
    const id = createId();
    const defaultLength = getConstants().defaultLength;
    info(id);

    assert({
      given: "nothing",
      should: "return a cuid of the default length",
      actual: id.length,
      expected: defaultLength,
    });
  }

  {
    const length = 10;
    // Test that custom cuid lengths work
    const cuid = init({ length });
    const id = cuid();
    info(id);

    assert({
      given: "custom cuid with a smaller length",
      should: "return a cuid with the specified smaller length",
      actual: id.length,
      expected: length,
    });
  }

  {
    const length = 32;
    // Test that large cuid lengths work
    const cuid = init({ length });
    const id = cuid();
    info(id);

    assert({
      given: "custom cuid with a larger length",
      should: "return a cuid with the specified larger length",
      actual: id.length,
      expected: length,
    });
  }
});

describe("createCounter", async (assert) => {
  const counter = createCounter(10);
  const expected = [10, 11, 12, 13];
  const actual = [counter(), counter(), counter(), counter()];
  info(actual);

  assert({
    given: "a starting number",
    should: "return a function that increments the number",
    actual,
    expected,
  });
});

describe("createFingerprint", async (assert) => {
  {
    const fingerprint = createFingerprint();
    const actual = fingerprint.length >= 24;
    const expected = true;
    info(`Host fingerprint: ${fingerprint}`);

    assert({
      given: "no arguments",
      should: "return a string of sufficient length",
      actual,
      expected,
    });
  }
  {
    const fingerprint = createFingerprint({ globalObj: {} });
    const actual = fingerprint.length >= 24;
    const expected = true;

    info(`Empty global fingerprint: ${fingerprint}`);

    assert({
      given: "an empty global object",
      should: "fall back on random entropy",
      actual,
      expected,
    });
  }
});

describe("isCuid", async (assert) => {
  {
    const actual = isCuid(createId());
    const expected = true;

    assert({
      given: "a valid cuid",
      should: "return true",
      actual,
      expected,
    });
  }

  {
    const actual = isCuid(createId() + createId() + createId());
    const expected = false;

    assert({
      given: "a cuid that is too long",
      should: "return false",
      actual,
      expected,
    });
  }

  {
    const actual = isCuid("");
    const expected = false;

    assert({
      given: "an empty string",
      should: "return false",
      actual,
      expected,
    });
  }
});
