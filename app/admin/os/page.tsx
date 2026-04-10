import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
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

type SearchParams = Promise<{
  q?: string;
  fornecedor?: string;
  responsavel?: string;
  status?: string;
}>;

export default async function ListaOSPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;

  const q = String(params.q ?? "").trim();
  const fornecedor = String(params.fornecedor ?? "").trim();
  const responsavel = String(params.responsavel ?? "").trim();
  const status = String(params.status ?? "").trim();

  const where: Prisma.OrdemServicoWhereInput = {
    ...(q
      ? {
          OR: [
            { numero: { contains: q, mode: "insensitive" } },
            { setor: { contains: q, mode: "insensitive" } },
            { observacao: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(fornecedor
      ? {
          fornecedor: {
            contains: fornecedor,
            mode: "insensitive",
          },
        }
      : {}),
    ...(responsavel
      ? {
          responsavel: {
            contains: responsavel,
            mode: "insensitive",
          },
        }
      : {}),
    ...(status ? { status } : {}),
  };

  const [ordens, total, fornecedoresRows, responsaveisRows] = await Promise.all([
    prisma.ordemServico.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { itens: true },
    }),
    prisma.ordemServico.count({ where }),
    prisma.ordemServico.findMany({
      select: { fornecedor: true },
      distinct: ["fornecedor"],
      orderBy: { fornecedor: "asc" },
      where: {
        fornecedor: {
          not: null,
        },
      },
    }),
    prisma.ordemServico.findMany({
      select: { responsavel: true },
      distinct: ["responsavel"],
      orderBy: { responsavel: "asc" },
      where: {
        responsavel: {
          not: null,
        },
      },
    }),
  ]);

  const fornecedores = fornecedoresRows
    .map((row) => row.fornecedor)
    .filter(Boolean) as string[];

  const responsaveis = responsaveisRows
    .map((row) => row.responsavel)
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Ordens de Serviço
            </h1>
            <p className="text-sm text-zinc-500">
              Visualize, busque e filtre todas as OS cadastradas
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
              href="/admin/os/nova"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Nova OS
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <form className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Buscar
              </label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Número, setor ou observação"
                className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Fornecedor
              </label>
              <select
                name="fornecedor"
                defaultValue={fornecedor}
                className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
              >
                <option value="">Todos</option>
                {fornecedores.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Responsável
              </label>
              <select
                name="responsavel"
                defaultValue={responsavel}
                className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
              >
                <option value="">Todos</option>
                {responsaveis.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Status
              </label>
              <select
                name="status"
                defaultValue={status}
                className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-black"
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PEDIDO_REALIZADO">Pedido realizado</option>
                <option value="RECEBIDO_PARCIAL">Recebido parcial</option>
                <option value="RECEBIDO">Recebido</option>
              </select>
            </div>

            <div className="flex items-end gap-3 lg:col-span-4">
              <button
                type="submit"
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Filtrar
              </button>

              <Link
                href="/admin/os"
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Limpar
              </Link>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Lista de OS
              </h2>
              <p className="text-sm text-zinc-500">
                {total} {total === 1 ? "resultado encontrado" : "resultados encontrados"}
              </p>
            </div>
          </div>

          {ordens.length === 0 ? (
            <div className="px-6 py-10 text-center text-zinc-500">
              Nenhuma OS encontrada com os filtros informados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-zinc-200 text-left">
                    <th className="px-5 py-3 text-sm font-semibold text-zinc-700">
                      Nº OS
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-zinc-700">
                      Fornecedor
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-zinc-700">
                      Responsável
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-zinc-700">
                      Itens
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-zinc-700">
                      Status
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-zinc-700">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ordens.map((os) => (
                    <tr key={os.id} className="border-b border-zinc-100">
                      <td className="px-5 py-4 text-sm font-medium text-zinc-900">
                        {os.numero}
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-700">
                        {os.fornecedor || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-700">
                        {os.responsavel || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-700">
                        {os.itens.length}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            os.status
                          )}`}
                        >
                          {getStatusLabel(os.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/os/${os.id}`}
                            className="font-medium text-black hover:underline"
                          >
                            Ver
                          </Link>
                          <Link
                            href={`/admin/os/${os.id}/editar`}
                            className="font-medium text-zinc-600 hover:underline"
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}