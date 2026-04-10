import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
    include: {
      itens: true,
    },
  });

  if (!os) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Detalhes da OS {os.numero}
            </h1>
            <p className="text-sm text-zinc-500">
              Visualize os dados completos da ordem de serviço
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Voltar
            </Link>

            <Link
              href={`/admin/os/${os.id}/receber`}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Recebimento
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Informações gerais
            </h2>

            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                os.status
              )}`}
            >
              {getStatusLabel(os.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Número da OS</p>
              <p className="font-medium text-zinc-900">{os.numero}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Setor / Obra</p>
              <p className="font-medium text-zinc-900">{os.setor || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Fornecedor</p>
              <p className="font-medium text-zinc-900">{os.fornecedor || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Responsável</p>
              <p className="font-medium text-zinc-900">{os.responsavel || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Data do pedido</p>
              <p className="font-medium text-zinc-900">
                {formatDateTime(os.dataPedido)}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Data do recebimento</p>
              <p className="font-medium text-zinc-900">
                {formatDateTime(os.dataRecebimento)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-zinc-500">Observação</p>
            <p className="font-medium text-zinc-900">{os.observacao || "-"}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Recebido por</p>
              <p className="font-medium text-zinc-900">
                {os.recebidoPorNome || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Obs. do recebimento</p>
              <p className="font-medium text-zinc-900">
                {os.observacaoRecebimento || "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Itens da OS
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">
                    Material
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">
                    Pedido
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">
                    Recebido
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">
                    Unidade
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-zinc-700">
                    Observação
                  </th>
                </tr>
              </thead>

              <tbody>
                {os.itens.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3 text-sm text-zinc-900">
                      {item.nome}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">
                      {item.quantidade}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">
                      {item.quantidadeRecebida}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">
                      {item.unidade}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">
                      {item.observacao || "-"}
                    </td>
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