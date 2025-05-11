import { Item } from "./itemType";

export interface Product extends Item {
  quantity: number;
}