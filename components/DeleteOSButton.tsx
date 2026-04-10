"use client";

import { Trash2 } from "lucide-react";

type Props = {
  osId: string;
  osNumero: string;
  action: (formData: FormData) => void | Promise<void>;
};

export default function DeleteOSButton({ osId, osNumero, action }: Props) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={osId} />

      <button
        type="submit"
        title="Apagar OS"
        onClick={(e) => {
          const confirmou = window.confirm(
            `Tem certeza que deseja apagar a OS ${osNumero}?`
          );

          if (!confirmou) {
            e.preventDefault();
          }
        }}
        className="flex items-center justify-center text-red-600 transition hover:text-red-800"
      >
        <Trash2 size={18} />
      </button>
    </form>
  );
}