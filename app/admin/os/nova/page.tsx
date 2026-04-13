"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  FilePlus2,
  Hash,
  Package2,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  User2,
  FileText,
  Ruler,
  Boxes,
} from "lucide-react";

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
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-700 shadow-sm">
              <FilePlus2 size={24} />
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-red-600">
                SEQUÓIA
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Nova OS
              </h1>
              <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                Cadastre uma nova ordem de serviço com os materiais pedidos
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-50"
          >
            <ArrowLeft size={17} />
            <span>Voltar</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-zinc-700">
              <div className="rounded-lg bg-zinc-100 p-2">
                <ClipboardList size={18} />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Dados principais
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Hash size={16} className="text-zinc-500" />
                  <span>Número da OS *</span>
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                  placeholder="Ex.: OS-001"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Building2 size={16} className="text-zinc-500" />
                  <span>Setor / Obra</span>
                </label>
                <input
                  type="text"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                  placeholder="Ex.: Obra A"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <ShoppingBag size={16} className="text-zinc-500" />
                  <span>Fornecedor</span>
                </label>
                <input
                  type="text"
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                  placeholder="Ex.: Material São José"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <User2 size={16} className="text-zinc-500" />
                  <span>Responsável</span>
                </label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                  placeholder="Ex.: Pedro"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <FileText size={16} className="text-zinc-500" />
                <span>Observação</span>
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="min-h-[110px] w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                placeholder="Observações gerais da OS"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-zinc-700">
                  <div className="rounded-lg bg-zinc-100 p-2">
                    <Package2 size={18} />
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-900">Itens</h2>
                </div>

                <p className="text-sm text-zinc-500">
                  Adicione os materiais solicitados nesta OS
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Plus size={16} />
                <span>Adicionar item</span>
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
                      className="inline-flex items-center gap-2 text-sm font-medium text-red-600 transition hover:underline"
                    >
                      <Trash2 size={15} />
                      <span>Remover</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                        <Boxes size={16} className="text-zinc-500" />
                        <span>Material *</span>
                      </label>
                      <input
                        type="text"
                        value={item.nome}
                        onChange={(e) =>
                          updateItem(index, "nome", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                        placeholder="Ex.: Tijolo"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                        <Hash size={16} className="text-zinc-500" />
                        <span>Quantidade *</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantidade}
                        onChange={(e) =>
                          updateItem(index, "quantidade", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                        placeholder="Ex.: 150"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                        <Ruler size={16} className="text-zinc-500" />
                        <span>Unidade *</span>
                      </label>
                      <input
                        type="text"
                        value={item.unidade}
                        onChange={(e) =>
                          updateItem(index, "unidade", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                        placeholder="Ex.: un, m, saco"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                      <FileText size={16} className="text-zinc-500" />
                      <span>Observação do item</span>
                    </label>
                    <input
                      type="text"
                      value={item.observacao}
                      onChange={(e) =>
                        updateItem(index, "observacao", e.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
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
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <ArrowLeft size={16} />
              <span>Cancelar</span>
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              <span>{loading ? "Salvando..." : "Salvar OS"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}