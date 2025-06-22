// src\types\itemType.ts
import { components } from "@/types/generated/schema";

export type Item = components["schemas"]["Item"];
export type Product = components["schemas"]["Product"];
export type Service = components["schemas"]["Service"];

// For use where either applies (e.g., search results)
export type ItemType = Product | Service;