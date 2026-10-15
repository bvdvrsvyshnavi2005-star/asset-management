import { HttpError } from "../utils/httpError.js";

// Pure state-machine rules for asset assignment (no DB access, so they are unit-testable).
// The service layer applies the matching change atomically (see assetService.js).

export const assertCanAssign = (asset) => {
  if (asset.status !== "AVAILABLE") {
    throw new HttpError(409, `Only AVAILABLE assets can be assigned (current status: ${asset.status})`);
  }
};

export const assertCanTransfer = (asset, employeeId) => {
  if (asset.status !== "ASSIGNED" || !asset.assignedTo) {
    throw new HttpError(409, "Only ASSIGNED assets can be transferred");
  }
  if (String(asset.assignedTo) === String(employeeId)) {
    throw new HttpError(409, "Asset is already assigned to this employee");
  }
};

export const assertCanReturn = (asset) => {
  if (asset.status !== "ASSIGNED" || !asset.assignedTo) {
    throw new HttpError(409, "Only ASSIGNED assets can be returned");
  }
};
