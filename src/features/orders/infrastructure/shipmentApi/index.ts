import { backofficeListShipments } from './backofficeListShipments';
import { backofficeGetShipmentById } from './backofficeGetShipmentById';
import { backofficeAdvanceShipment } from './backofficeAdvanceShipment';
import { backofficeFailShipment } from './backofficeFailShipment';
import { backofficeUpdateShipment } from './backofficeUpdateShipment';

export type { UpdateShipmentPayload } from './backofficeUpdateShipment';

export function createShipmentApi() {
  return {
    backofficeList: backofficeListShipments,
    backofficeGetById: backofficeGetShipmentById,
    backofficeAdvance: backofficeAdvanceShipment,
    backofficeFail: backofficeFailShipment,
    backofficeUpdate: backofficeUpdateShipment,
  };
}
