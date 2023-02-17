import BN from "bn.js";
import elliptic from "elliptic";
import { DistributedKeyGeneration, THRESHOLD } from "./common";
import { interpolate } from "./utils";

const { ec } = elliptic;
const secp256k1 = new ec("secp256k1");

// generator order value of `secp256k1` curve
const n = secp256k1.curve.n;

////////////////////////////////////////////
// Initializing Key
////////////////////////////////////////////

// step 1: each node genenerate a random secret.
const nodes: DistributedKeyGeneration[] = [];
for (let i = 0; i < 5; i++) {
  nodes.push({
    secret: secp256k1.genKeyPair().getPrivate(),
    receivedShares: [],
  });
}

// step 2: nodes interact together to get shared keys.
nodes.forEach((node) => {
  const shares: BN[] = [node.secret];
  const indices: number[] = [0];

  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
    if (shares.length < THRESHOLD) {
      let randomShare: BN = secp256k1.genKeyPair().getPrivate();
      shares.push(randomShare);
      nodes[nodeIndex].receivedShares.push(randomShare);
      indices.push(nodeIndex + 1);
    } else {
      let point = interpolate(shares, indices, nodeIndex + 1);
      nodes[nodeIndex].receivedShares.push(point!);
    }
  }
});

// step 3: each node creates a secret key share from received shares.
nodes.forEach((node) => {
  node.secretKeyShare = node.receivedShares.reduce(
    (prev, current) => prev.add(current).umod(n),
    new BN(0)
  );
});

/////////////////////////////////////////
// Reconstructor key
/////////////////////////////////////////

// step 1: Get threshold of secret key shares
const secretKeyShares: BN[] = [];
const nodeIndices: number[] = [];

for (let i = 0; i < THRESHOLD; i++) {
  secretKeyShares.push(nodes[i].secretKeyShare);
  nodeIndices.push(i + 1);
}

const privateKey = interpolate(secretKeyShares, nodeIndices, 0);
console.log(privateKey?.toString());

const keyPair = secp256k1.keyFromPrivate(privateKey!.toBuffer());
const msgHash = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
const signature = keyPair.sign(msgHash);

console.log(signature)
