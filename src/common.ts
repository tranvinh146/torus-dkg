import BN from "bn.js"

export type DistributedKeyGeneration = {
    secret: BN,
    receivedShares: BN[],
    secretKeyShare?: any
}

export const THRESHOLD = 3;
