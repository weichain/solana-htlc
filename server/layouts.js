const borsh = require('borsh');
const CryptoJS = require('crypto-js');

const INTRSUCTION = {
  INIT: 0,
  CLAIM: 1,
  REFUND: 2
};

class Assignable {
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key];
    });
  }
}

class Template extends Assignable {}

// ***************************************

// INIT MODEL

// ***************************************

const secret = CryptoJS.SHA256('asd asd 2');

const secretHash = CryptoJS.SHA256(secret);

const initSchema = new Map([
  [
    Template,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['buyer', 'string'],
        ['seller', 'string'],
        ['secret_hash', 'string'],
        ['expiration', 'u64']
      ]
    }
  ]
]);

const FIVE_MINUTES = 60 * 5;

const init = new Template({
  instruction: INTRSUCTION.INIT,
  buyer: 'HbjQYtTtzKcLjdDS3zMJYRKCZiNbRkLq4FNawRp6Hwyp',
  seller: '59tCULt8ZKGt388V2WQ8nCnknw4re4GfCnQs25naiuUx',
  secret_hash: secretHash.toString(),
  expiration: Math.floor(Date.now() / 1000)
});

// ***************************************

// WITHDRAW MODEL

// ***************************************

const claimSchema = new Map([
  [
    Template,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['secret', 'string']
      ]
    }
  ]
]);

const claim = new Template({
  instruction: INTRSUCTION.CLAIM,
  secret: secret.toString()
});

// ***************************************

// REFUND MODEL

// ***************************************

const refundSchema = new Map([
  [
    Template,
    {
      kind: 'struct',
      fields: [['instruction', 'u8']]
    }
  ]
]);

const refund = new Template({ instruction: INTRSUCTION.REFUND });

const initBuffer = borsh.serialize(initSchema, init);
const claimBuffer = borsh.serialize(claimSchema, claim);
const refundBuffer = borsh.serialize(refundSchema, refund);

module.exports = {
  Template,
  initSchema,
  initBuffer,
  claimBuffer,
  refundBuffer
};
