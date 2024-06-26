/* auto-generated by NAPI-RS */
/* eslint-disable */

export function getMime(input: Uint8Array): string

/**
 * Merge updates in form like `Y.applyUpdate(doc, update)` way and return the
 * result binary.
 */
export function mergeUpdatesInApplyWay(updates: Array<Buffer>): Buffer

export function mintChallengeResponse(resource: string, bits?: number | undefined | null): Promise<string>

export function verifyChallengeResponse(response: string, bits: number, resource: string): Promise<boolean>

