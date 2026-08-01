export type VerificationStatus=
| "completed"
| "continue"
| "failed";

export interface VerificationResult {
    status:VerificationStatus;
    reason:string;
}