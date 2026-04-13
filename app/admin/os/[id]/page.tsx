import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  FileText,
  PackageCheck,
  Ruler,
  Truck,
  User2,
  Boxes,
} from "lucide-react";

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDENTE":
      return "Pendente";
    case "PEDIDO_REALIZADO":
      return "Pedido realizado";
    case "RECEBIDO_PARCIAL":
      return "Recebido parcial";
    case "RECEBIDO":
      return "Recebido";
    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "PENDENTE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PEDIDO_REALIZADO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "RECEBIDO_PARCIAL":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "RECEBIDO":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatDateTime(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function DetalheOSPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const os = await prisma.ordemServico.findUnique({
    where: { id },
    include: { itens: true },
  });

  if (!os) notFound();

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* HEADER */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-700 shadow-sm">
              <ClipboardList size={24} />
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-red-600">
                SEQUÓIA
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Detalhes da OS {os.numero}
              </h1>

              <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                Visualize os dados completos da ordem de serviço
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-50"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>

            <Link
              href={`/admin/os/${os.id}/receber`}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
            >
              <Truck size={16} />
              Recebimento
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* INFO GERAL */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-zinc-100 p-2">
                <ClipboardList size={18} />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Informações gerais
              </h2>
            </div>

            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                os.status
              )}`}
            >
              {getStatusLabel(os.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info icon={<ClipboardList size={14} />} label="Número da OS" value={os.numero} />
            <Info icon={<Building2 size={14} />} label="Setor / Obra" value={os.setor || "-"} />
            <Info icon={<Boxes size={14} />} label="Fornecedor" value={os.fornecedor || "-"} />
            <Info icon={<User2 size={14} />} label="Responsável" value={os.responsavel || "-"} />
            <Info icon={<Truck size={14} />} label="Data do pedido" value={formatDateTime(os.dataPedido)} />
            <Info icon={<PackageCheck size={14} />} label="Data do recebimento" value={formatDateTime(os.dataRecebimento)} />
          </div>

          <div className="mt-5">
            <Label icon={<FileText size={14} />} text="Observação" />
            <p className="font-medium text-zinc-900">{os.observacao || "-"}</p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info icon={<User2 size={14} />} label="Recebido por" value={os.recebidoPorNome || "-"} />
            <Info icon={<FileText size={14} />} label="Obs. do recebimento" value={os.observacaoRecebimento || "-"} />
          </div>
        </section>

        {/* ITENS */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-lg bg-zinc-100 p-2">
              <Boxes size={18} />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Itens da OS
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">Material</th>
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">Pedido</th>
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">Recebido</th>
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">Unidade</th>
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">Observação</th>
                </tr>
              </thead>

              <tbody>
                {os.itens.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3 text-sm text-zinc-900">{item.nome}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{item.quantidade}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{item.quantidadeRecebida}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{item.unidade}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{item.observacao || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

/* COMPONENTES AUXILIARES (visual) */

function Info({ icon, label, value }: any) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-sm text-zinc-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-medium text-zinc-900">{value}</p>
    </div>
  );
}

function Label({ icon, text }: any) {
  return (
    <div className="mb-1 flex items-center gap-2 text-sm text-zinc-500">
      {icon}
      <span>{text}</span>
    </div>
  );
}