import BN from "bn.js";
import elliptic from "elliptic";

const { ec } = elliptic;
const secp256k1 = new ec("secp256k1");

// generator order value of `secp256k1` curve
const n = secp256k1.curve.n;

export function interpolate(
  shares: BN[],
  nodeIndices: number[],
  xPoint: number
): BN | null {
  let result = new BN(0);
  if (shares.length !== nodeIndices.length) {
    return null;
  }

  const xBN = new BN(xPoint);

  for (let i = 0; i < shares.length; i++) {
    let iBN = new BN(nodeIndices[i]);
    let upper = new BN(1);
    let lower = new BN(1);

    for (let j = 0; j < shares.length; j++) {
      if (j !== i) {
        let jBN = new BN(nodeIndices[j]);

        upper = upper.mul(xBN.sub(jBN));
        upper = upper.umod(n);

        let temp = iBN.sub(jBN);
        temp = temp.umod(n);
        lower = lower.mul(temp).umod(n);
      }
    }

    let delta = upper.mul(lower.invm(n)).umod(n);;
    delta = delta.mul(shares[i]).umod(n); 
    result = result.add(delta).umod(n);
  }

  return result;
}
