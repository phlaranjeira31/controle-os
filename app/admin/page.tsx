import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  FilePlus2,
  PackageCheck,
  PackageOpen,
  ShoppingCart,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import DeleteOSButton from "@/components/DeleteOSButton";
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

function formatDateTime(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function StatCard({
  title,
  value,
  icon,
  valueClassName = "text-zinc-900",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="cursor-pointer rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p className={`mt-3 text-3xl font-bold ${valueClassName}`}>{value}</p>
        </div>

        <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-700">{icon}</div>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  async function deleteOS(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");

    if (!id) return;

    await prisma.$transaction(async (tx) => {
      await tx.ordemServico.update({
        where: { id },
        data: {
          itens: {
            deleteMany: {},
          },
        },
      });

      await tx.ordemServico.delete({
        where: { id },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/admin/os");
  }

  const [
    totalOS,
    pendentes,
    pedidoRealizado,
    recebidasParciais,
    recebidas,
    ultimasOS,
  ] = await Promise.all([
    prisma.ordemServico.count(),
    prisma.ordemServico.count({
      where: { status: "PENDENTE" },
    }),
    prisma.ordemServico.count({
      where: { status: "PEDIDO_REALIZADO" },
    }),
    prisma.ordemServico.count({
      where: { status: "RECEBIDO_PARCIAL" },
    }),
    prisma.ordemServico.count({
      where: { status: "RECEBIDO" },
    }),
    prisma.ordemServico.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        itens: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-red-600">
                SEQUÓIA
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Painel de Pedidos
              </h1>

              <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                Bem-vindo, {session.user?.name ?? "Administrador"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/os/nova"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800"
              >
                <FilePlus2 size={18} />
                <span>Nova OS</span>
              </Link>

              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/admin/os">
            <StatCard
              title="Total de OS"
              value={totalOS}
              icon={<ClipboardList size={22} />}
            />
          </Link>

          <Link href="/admin/os?status=PENDENTE">
            <StatCard
              title="Pendentes"
              value={pendentes}
              icon={<Clock3 size={22} />}
              valueClassName="text-yellow-600"
            />
          </Link>

          <Link href="/admin/os?status=PEDIDO_REALIZADO">
            <StatCard
              title="Pedido realizado"
              value={pedidoRealizado}
              icon={<ShoppingCart size={22} />}
              valueClassName="text-blue-600"
            />
          </Link>

          <Link href="/admin/os?status=RECEBIDO_PARCIAL">
            <StatCard
              title="Recebido parcial"
              value={recebidasParciais}
              icon={<PackageOpen size={22} />}
              valueClassName="text-orange-600"
            />
          </Link>

          <Link href="/admin/os?status=RECEBIDO">
            <StatCard
              title="Recebidas"
              value={recebidas}
              icon={<PackageCheck size={22} />}
              valueClassName="text-green-600"
            />
          </Link>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Últimas ordens de serviço
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Visualize as OS mais recentes cadastradas no sistema
              </p>
            </div>

            <Link
              href="/admin/os"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-800 transition hover:text-red-600"
            >
              <span>Ver todas</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {ultimasOS.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                <ClipboardList size={24} />
              </div>

              <p className="text-zinc-600">Nenhuma OS cadastrada ainda.</p>

              <Link
                href="/admin/os/nova"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                <FilePlus2 size={18} />
                <span>Cadastrar primeira OS</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-zinc-50">
                  <tr className="border-b border-zinc-200 text-left">
                    <th className="px-5 py-4 text-sm font-semibold text-zinc-700">
                      Nº OS
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-zinc-700">
                      Fornecedor
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-zinc-700">
                      Responsável
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-zinc-700">
                      Itens
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-zinc-700">
                      Pedido
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-zinc-700">
                      Status
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-zinc-700">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ultimasOS.map((os) => (
                    <tr
                      key={os.id}
                      className="border-b border-zinc-100 transition hover:bg-zinc-50/80"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-zinc-900">
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

                      <td className="px-5 py-4 text-sm text-zinc-700">
                        {formatDateTime(os.dataPedido)}
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
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/admin/os/${os.id}`}
                            className="font-semibold text-black transition hover:text-red-600"
                          >
                            Ver
                          </Link>

                          <Link
                            href={`/admin/os/${os.id}/editar`}
                            className="font-semibold text-zinc-600 transition hover:text-zinc-900"
                          >
                            Editar
                          </Link>

                          <DeleteOSButton
                            osId={os.id}
                            osNumero={os.numero}
                            action={deleteOS}
                          />
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