import { Item } from "./itemType";

export interface Service extends Item {
  service_duration: number;
  service_type: string;
}
