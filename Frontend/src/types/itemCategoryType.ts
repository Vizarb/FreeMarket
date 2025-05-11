// src/models/ItemCategory.ts
import { BaseModel } from "./baseType";
import { Item } from "./itemType";
import { Category } from "./categoryType";

export interface ItemCategory extends BaseModel {
  item: Item;
  category: Category;
}
