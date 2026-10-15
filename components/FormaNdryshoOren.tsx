
"use client";

import { useActionState } from "react";
import { ruajOren } from "@/app/panel/actions";

type State = {
  error?: string;
  success?: boolean;
};

async function action(
  _state: State,
  formData: FormData
): Promise<State> {
  return ruajOren(formData);
}

export function FormaNdryshoOren({
  id,
  ora,
}: {
  id: string;
  ora: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form className="time-form" action={formAction}>
      <input type="hidden" name="id" value={id} />

      <label htmlFor="ora">Ora e nisjes</label>
      <input
        id="ora"
        name="ora"
        type="time"
        defaultValue={ora}
        required
      />

      <button className="action" type="submit" disabled={pending}>
        {pending ? "Duke ruajtur..." : "Ruaj orën"}
      </button>

      {state.error && <p role="alert">{state.error}</p>}
      {state.success && <p role="status">Ora u ndryshua me sukses.</p>}
    </form>
  );
}
