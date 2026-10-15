"use server";

import { ndryshoOren } from "@/lib/ndrysho-oren";

export async function ruajOren(formData: FormData) {
  return ndryshoOren(formData);
}
