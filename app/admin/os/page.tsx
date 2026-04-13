import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  Filter,
  FilePlus2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  User2,
} from "lucide-react";
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

function buildTokenVariants(token: string) {
  const cleaned = token.trim().toLowerCase();
  if (!cleaned) return [];

  const variants = new Set<string>([cleaned]);

  if (cleaned.endsWith("es") && cleaned.length > 3) {
    variants.add(cleaned.slice(0, -2));
  }

  if (cleaned.endsWith("s") && cleaned.length > 2) {
    variants.add(cleaned.slice(0, -1));
  }

  return Array.from(variants).filter(Boolean);
}

function buildSearchWhere(q: string): Prisma.OrdemServicoWhereInput {
  const query = q.trim();

  if (!query) return {};

  const tokens = query
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const tokenFilters: Prisma.OrdemServicoWhereInput[] = tokens.map((token) => {
    const variants = buildTokenVariants(token);

    return {
      OR: variants.flatMap((variant) => [
        { numero: { contains: variant, mode: "insensitive" } },
        { setor: { contains: variant, mode: "insensitive" } },
        { observacao: { contains: variant, mode: "insensitive" } },
        {
          itens: {
            some: {
              nome: {
                contains: variant,
                mode: "insensitive",
              },
            },
          },
        },
        {
          itens: {
            some: {
              observacao: {
                contains: variant,
                mode: "insensitive",
              },
            },
          },
        },
      ]),
    };
  });

  return {
    AND: [
      {
        OR: [
          { numero: { contains: query, mode: "insensitive" } },
          { setor: { contains: query, mode: "insensitive" } },
          { observacao: { contains: query, mode: "insensitive" } },
          {
            itens: {
              some: {
                nome: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            itens: {
              some: {
                observacao: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      ...tokenFilters,
    ],
  };
}

type SearchParams = Promise<{
  q?: string;
  setor?: string;
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
  const setor = String(params.setor ?? "").trim();
  const responsavel = String(params.responsavel ?? "").trim();
  const status = String(params.status ?? "").trim();

  const where: Prisma.OrdemServicoWhereInput = {
    ...buildSearchWhere(q),
    ...(setor
      ? {
          setor: {
            contains: setor,
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

  const [ordens, total, setoresRows, responsaveisRows] = await Promise.all([
    prisma.ordemServico.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { itens: true },
    }),
    prisma.ordemServico.count({ where }),
    prisma.ordemServico.findMany({
      select: { setor: true },
      distinct: ["setor"],
      orderBy: { setor: "asc" },
      where: { setor: { not: null } },
    }),
    prisma.ordemServico.findMany({
      select: { responsavel: true },
      distinct: ["responsavel"],
      orderBy: { responsavel: "asc" },
      where: { responsavel: { not: null } },
    }),
  ]);

  const setores = setoresRows.map((row) => row.setor).filter(Boolean) as string[];
  const responsaveis = responsaveisRows
    .map((row) => row.responsavel)
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-700 shadow-sm">
              <ClipboardList size={24} />
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-red-600">
                SEQUÓIA
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Ordens de Serviço
              </h1>

              <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                Busque, filtre e acompanhe suas OS de forma rápida e organizada
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-50"
            >
              <ArrowLeft size={17} />
              <span>Voltar</span>
            </Link>

            <Link
              href="/admin/os/nova"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              <FilePlus2 size={17} />
              <span>Nova OS</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-zinc-700">
            <div className="rounded-lg bg-zinc-100 p-2">
              <SlidersHorizontal size={18} />
            </div>
            <p className="text-sm font-medium text-zinc-600">
              Use os filtros abaixo para encontrar rapidamente uma OS
            </p>
          </div>

          <form className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Search size={16} className="text-zinc-500" />
                <span>Buscar</span>
              </label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Ex: 6289, patrimônio, caixa eletroduto..."
                className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Building2 size={16} className="text-zinc-500" />
                <span>Setor / Obra</span>
              </label>
              <select
                name="setor"
                defaultValue={setor}
                className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
              >
                <option value="">Todos</option>
                {setores.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <User2 size={16} className="text-zinc-500" />
                <span>Responsável</span>
              </label>
              <select
                name="responsavel"
                defaultValue={responsavel}
                className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
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
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <ClipboardList size={16} className="text-zinc-500" />
                <span>Status</span>
              </label>
              <select
                name="status"
                defaultValue={status}
                className="w-full rounded-lg border border-zinc-300 p-3 text-black outline-none transition focus:border-black"
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PEDIDO_REALIZADO">Pedido realizado</option>
                <option value="RECEBIDO_PARCIAL">Recebido parcial</option>
                <option value="RECEBIDO">Recebido</option>
              </select>
            </div>

            <div className="flex items-end gap-3 md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Filter size={16} />
                <span>Filtrar</span>
              </button>

              <Link
                href="/admin/os"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                <RotateCcw size={16} />
                <span>Limpar filtros</span>
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
                      Setor / Obra
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
                        {os.setor || "-"}
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