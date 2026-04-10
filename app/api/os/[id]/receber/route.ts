import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const recebidoPorNome =
      String(body?.recebidoPorNome ?? "").trim() || "Administrador";
    const observacaoRecebimento =
      String(body?.observacaoRecebimento ?? "").trim() || null;

    const itensRecebidos = Array.isArray(body?.itensRecebidos)
      ? body.itensRecebidos
      : [];

    const os = await prisma.ordemServico.findUnique({
      where: { id },
      include: { itens: true },
    });

    if (!os) {
      return NextResponse.json(
        { error: "OS não encontrada." },
        { status: 404 }
      );
    }

    if (itensRecebidos.length !== os.itens.length) {
      return NextResponse.json(
        { error: "Quantidade de itens recebidos inválida." },
        { status: 400 }
      );
    }

    for (const item of itensRecebidos) {
      const quantidadeRecebida = Number(item?.quantidadeRecebida ?? 0);
      if (Number.isNaN(quantidadeRecebida) || quantidadeRecebida < 0) {
        return NextResponse.json(
          { error: "Quantidade recebida inválida." },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(
      itensRecebidos.map((item: any) =>
        prisma.ordemServicoItem.update({
          where: { id: String(item.id) },
          data: {
            quantidadeRecebida: Number(item.quantidadeRecebida),
          },
        })
      )
    );

    const itensAtualizados = await prisma.ordemServicoItem.findMany({
      where: { osId: id },
    });

    const tudoRecebido = itensAtualizados.every(
      (item) => item.quantidadeRecebida >= item.quantidade
    );

    const algoRecebido = itensAtualizados.some(
      (item) => item.quantidadeRecebida > 0
    );

    const novoStatus = tudoRecebido
      ? "RECEBIDO"
      : algoRecebido
      ? "RECEBIDO_PARCIAL"
      : os.status;

    const updated = await prisma.ordemServico.update({
      where: { id },
      data: {
        status: novoStatus,
        dataRecebimento: algoRecebido ? new Date() : os.dataRecebimento,
        recebidoPorNome: algoRecebido ? recebidoPorNome : os.recebidoPorNome,
        observacaoRecebimento: observacaoRecebimento,
      },
      include: {
        itens: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao confirmar recebimento:", error);
    return NextResponse.json(
      { error: "Erro interno ao confirmar recebimento." },
      { status: 500 }
    );
  }
}