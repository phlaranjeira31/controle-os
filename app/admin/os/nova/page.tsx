"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = {
  nome: string;
  quantidade: string;
  unidade: string;
  observacao: string;
};

export default function NovaOSPage() {
  const router = useRouter();

  const [numero, setNumero] = useState("");
  const [setor, setSetor] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [itens, setItens] = useState<Item[]>([
    { nome: "", quantidade: "", unidade: "", observacao: "" },
  ]);

  function updateItem(index: number, field: keyof Item, value: string) {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItens((prev) => [
      ...prev,
      { nome: "", quantidade: "", unidade: "", observacao: "" },
    ]);
  }

  function removeItem(index: number) {
    setItens((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/os", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero,
          setor,
          fornecedor,
          responsavel,
          observacao,
          itens,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data?.error || "Erro ao salvar OS.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setErro("Erro ao enviar formulário.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Nova OS</h1>
            <p className="text-sm text-zinc-500">
              Cadastre uma nova ordem de serviço com os materiais pedidos
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">
              Dados principais
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Número da OS *
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
                  placeholder="Ex.: OS-001"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Setor / Obra
                </label>
                <input
                  type="text"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
                  placeholder="Ex.: Obra A"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
                  placeholder="Ex.: Material São José"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Responsável
                </label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
                  placeholder="Ex.: Pedro"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Observação
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="min-h-[110px] w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
                placeholder="Observações gerais da OS"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Itens</h2>
                <p className="text-sm text-zinc-500">
                  Adicione os materiais solicitados nesta OS
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                + Adicionar item
              </button>
            </div>

            <div className="space-y-4">
              {itens.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-800">
                      Item {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Material *
                      </label>
                      <input
                        type="text"
                        value={item.nome}
                        onChange={(e) =>
                          updateItem(index, "nome", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
                        placeholder="Ex.: Tijolo"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Quantidade *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantidade}
                        onChange={(e) =>
                          updateItem(index, "quantidade", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
                        placeholder="Ex.: 150"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Unidade *
                      </label>
                      <input
                        type="text"
                        value={item.unidade}
                        onChange={(e) =>
                          updateItem(index, "unidade", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
                        placeholder="Ex.: un, m, saco"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Observação do item
                    </label>
                    <input
                      type="text"
                      value={item.observacao}
                      onChange={(e) =>
                        updateItem(index, "observacao", e.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
                      placeholder="Ex.: Entrega urgente"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {erro ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar OS"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}