import "server-only";
import type { Profil } from "./profilet";
import type { Udhetim } from "./udhetimet";

// Controls visibility only. The action enforces both conditions again in SQL.
export function mundTeNdryshoje(profili: Profil | null, udhetim: Udhetim) {
  return profili?.roli === "shofer" && profili.id === udhetim.shofer_id;
}
