/* global global, window, module */
const { sha3_512: sha3 } = require("js-sha3");

const defaultLength = 24;
const bigLength = 32;

const createEntropy = (length = 4, random = Math.random) => {
  let entropy = "";

  while (entropy.length < length) {
    entropy = entropy + Math.floor(random() * 36).toString(36);
  }
  return entropy;
};

const hash = (input = "") => {
  // Drop the first character because it will bias the histogram
  // to the left.
  return sha3(input).toString(36).slice(1);
};

const alphabet = Array.from({ length: 26 }, (x, i) =>
  String.fromCharCode(i + 97)
);

const randomLetter = (random) =>
  alphabet[Math.floor(random() * alphabet.length)];

/*
This is a fingerprint of the host environment. It is used to help
prevent collisions when generating ids in a distributed system.
If no global object is available, you can pass in your own, or fall back
on a random string.
*/
const createFingerprint = ({
  globalObj = typeof global !== "undefined"
    ? global
    : typeof window !== "undefined"
    ? window
    : {},
} = {}) => {
  const globals = Object.keys(globalObj).toString();
  const sourceString = globals.length
    ? globals + createEntropy(bigLength)
    : createEntropy(bigLength);

  return hash(sourceString).substring(0, bigLength);
};

const createCounter = (count) => () => {
  return count++;
};

// ~22k hosts before 50% chance of initial counter collision
// with a remaining counter range of 9.0e+15 in JavaScript.
const initialCountMax = 476782367;

const init = ({
  // Fallback if the user does not pass in a CSPRNG. This should be OK
  // because we don't rely solely on the random number generator for entropy.
  // We also use the host fingerprint, current time, and a session counter.
  random = Math.random,
  counter = createCounter(Math.floor(random() * initialCountMax)),
  length = defaultLength,
  fingerprint = createFingerprint(),
} = {}) => {
  return function cuid2() {
    const firstLetter = randomLetter(random);

    // If we're lucky, the `.toString(36)` calls may reduce hashing rounds
    // by shortening the input to the hash function a little.
    const time = Date.now().toString(36);
    const count = counter().toString(36);

    // The salt should be long enough to be globally unique across the full
    // length of the hash. For simplicity, we use the same length as the
    // intended id output.
    const salt = createEntropy(length, random);
    const hashInput = `${time + salt + count + fingerprint}`;

    return `${firstLetter + hash(hashInput).substring(1, length)}`;
  };
};

const createId = init();

const isCuid = (id, { minLength = 2, maxLength = bigLength } = {}) => {
  const length = id.length;
  const regex = /^[0-9a-z]+$/;

  try {
    if (
      typeof id === "string" &&
      length >= minLength &&
      length <= maxLength &&
      regex.test(id)
    )
      return true;
  } finally {
  }

  return false;
};

module.exports.getConstants = () => ({ defaultLength, bigLength });
module.exports.init = init;
module.exports.createId = createId;
module.exports.createCounter = createCounter;
module.exports.createFingerprint = createFingerprint;
module.exports.isCuid = isCuid;
