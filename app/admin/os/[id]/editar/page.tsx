"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  FilePenLine,
  FileText,
  Hash,
  Package2,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  User2,
  Boxes,
  Ruler,
} from "lucide-react";

type Item = {
  nome: string;
  quantidade: string;
  unidade: string;
  observacao: string;
};

export default function EditarOSPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [numero, setNumero] = useState("");
  const [setor, setSetor] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacao, setObservacao] = useState("");
  const [status, setStatus] = useState("PENDENTE");
  const [itens, setItens] = useState<Item[]>([
    { nome: "", quantidade: "", unidade: "", observacao: "" },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarOS() {
      try {
        const res = await fetch(`/api/os/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setErro(data?.error || "Erro ao carregar OS.");
          setLoading(false);
          return;
        }

        setNumero(data.numero || "");
        setSetor(data.setor || "");
        setFornecedor(data.fornecedor || "");
        setResponsavel(data.responsavel || "");
        setObservacao(data.observacao || "");
        setStatus(data.status || "PENDENTE");
        setItens(
          data.itens?.length
            ? data.itens.map((item: any) => ({
                nome: item.nome || "",
                quantidade: String(item.quantidade ?? ""),
                unidade: item.unidade || "",
                observacao: item.observacao || "",
              }))
            : [{ nome: "", quantidade: "", unidade: "", observacao: "" }]
        );
      } catch {
        setErro("Erro ao carregar OS.");
      } finally {
        setLoading(false);
      }
    }

    carregarOS();
  }, [params.id]);

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
    setSaving(true);

    try {
      const res = await fetch(`/api/os/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero,
          setor,
          fornecedor,
          responsavel,
          observacao,
          status,
          itens,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data?.error || "Erro ao atualizar OS.");
        setSaving(false);
        return;
      }

      router.push(`/admin/os/${params.id}`);
      router.refresh();
    } catch {
      setErro("Erro ao enviar formulário.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm">
          Carregando OS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-700 shadow-sm">
              <FilePenLine size={24} />
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-red-600">
                SEQUÓIA
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Editar OS
              </h1>
              <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                Atualize os dados da ordem de serviço
              </p>
            </div>
          </div>

          <Link
            href={`/admin/os/${params.id}`}
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
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <ClipboardList size={16} className="text-zinc-500" />
                  <span>Status</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="PEDIDO_REALIZADO">Pedido realizado</option>
                  <option value="RECEBIDO_PARCIAL">Recebido parcial</option>
                  <option value="RECEBIDO">Recebido</option>
                </select>
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
                  Atualize os itens desta OS
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
                    <div>
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
              href={`/admin/os/${params.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <ArrowLeft size={16} />
              <span>Cancelar</span>
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              <span>{saving ? "Salvando..." : "Salvar alterações"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}