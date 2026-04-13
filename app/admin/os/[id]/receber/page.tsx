"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  ClipboardCheck,
  FileText,
  PackageCheck,
  Ruler,
  Save,
  Truck,
  User2,
} from "lucide-react";

type ItemRecebimento = {
  id: string;
  nome: string;
  quantidade: number;
  quantidadeRecebida: string;
  unidade: string;
};

export default function ReceberOSPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [recebidoPorNome, setRecebidoPorNome] = useState("");
  const [observacaoRecebimento, setObservacaoRecebimento] = useState("");
  const [itens, setItens] = useState<ItemRecebimento[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

        setRecebidoPorNome(data.recebidoPorNome || "");
        setObservacaoRecebimento(data.observacaoRecebimento || "");
        setItens(
          data.itens.map((item: any) => ({
            id: item.id,
            nome: item.nome,
            quantidade: item.quantidade,
            quantidadeRecebida: String(item.quantidadeRecebida ?? 0),
            unidade: item.unidade,
          }))
        );
      } catch {
        setErro("Erro ao carregar OS.");
      } finally {
        setLoading(false);
      }
    }

    carregarOS();
  }, [params.id]);

  function updateQuantidade(id: string, value: string) {
    setItens((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantidadeRecebida: value } : item
      )
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setSaving(true);

    try {
      const res = await fetch(`/api/os/${params.id}/receber`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recebidoPorNome,
          observacaoRecebimento,
          itensRecebidos: itens.map((item) => ({
            id: item.id,
            quantidadeRecebida: Number(item.quantidadeRecebida),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data?.error || "Erro ao confirmar recebimento.");
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
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
          Carregando recebimento...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-700 shadow-sm">
              <PackageCheck size={24} />
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-red-600">
                SEQUÓIA
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Recebimento da OS
              </h1>
              <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                Informe quanto chegou de cada item
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

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-zinc-700">
              <div className="rounded-lg bg-zinc-100 p-2">
                <ClipboardCheck size={18} />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Dados do recebimento
              </h2>
            </div>

            <div className="mb-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <User2 size={16} className="text-zinc-500" />
                <span>Recebido por</span>
              </label>
              <input
                type="text"
                value={recebidoPorNome}
                onChange={(e) => setRecebidoPorNome(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                placeholder="Ex.: Pedro"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <FileText size={16} className="text-zinc-500" />
                <span>Observação do recebimento</span>
              </label>
              <textarea
                value={observacaoRecebimento}
                onChange={(e) => setObservacaoRecebimento(e.target.value)}
                className="min-h-[100px] w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
                placeholder="Ex.: Parte do material chegou hoje"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-zinc-700">
              <div className="rounded-lg bg-zinc-100 p-2">
                <Truck size={18} />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Quantidades recebidas
              </h2>
            </div>

            <div className="space-y-4">
              {itens.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 p-4 md:grid-cols-4"
                >
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
                      <Boxes size={15} />
                      <span>Material</span>
                    </div>
                    <p className="font-medium text-zinc-900">{item.nome}</p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
                      <Ruler size={15} />
                      <span>Pedido</span>
                    </div>
                    <p className="font-medium text-zinc-900">
                      {item.quantidade} {item.unidade}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                      <PackageCheck size={16} className="text-zinc-500" />
                      <span>Quantidade recebida</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={item.quantidade}
                      value={item.quantidadeRecebida}
                      onChange={(e) =>
                        updateQuantidade(item.id, e.target.value)
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

          <div className="flex justify-end gap-3">
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
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              <span>{saving ? "Salvando..." : "Salvar recebimento"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}