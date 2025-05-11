import { Item } from "./itemType";

export interface Service extends Item {
  serviceDuration: number;
  serviceType: string;
}
