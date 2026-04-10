import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const os = await prisma.ordemServico.findUnique({
      where: { id },
      include: { itens: true },
    });

    if (!os) {
      return NextResponse.json({ error: "OS não encontrada." }, { status: 404 });
    }

    return NextResponse.json(os);
  } catch (error) {
    console.error("Erro ao buscar OS:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar OS." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const numero = String(body?.numero ?? "").trim();
    const setor = String(body?.setor ?? "").trim() || null;
    const fornecedor = String(body?.fornecedor ?? "").trim() || null;
    const responsavel = String(body?.responsavel ?? "").trim() || null;
    const observacao = String(body?.observacao ?? "").trim() || null;
    const status = String(body?.status ?? "PENDENTE").trim();

    const itens = Array.isArray(body?.itens) ? body.itens : [];

    if (!numero) {
      return NextResponse.json(
        { error: "Número da OS é obrigatório." },
        { status: 400 }
      );
    }

    if (itens.length === 0) {
      return NextResponse.json(
        { error: "Adicione pelo menos um item." },
        { status: 400 }
      );
    }

    const itensTratados = itens.map((item: any) => ({
      nome: String(item?.nome ?? "").trim(),
      quantidade: Number(item?.quantidade ?? 0),
      quantidadeRecebida: Number(item?.quantidadeRecebida ?? 0),
      unidade: String(item?.unidade ?? "").trim(),
      observacao: String(item?.observacao ?? "").trim() || null,
    }));

    const itensInvalidos = itensTratados.some(
      (item) =>
        !item.nome ||
        !item.unidade ||
        Number.isNaN(item.quantidade) ||
        item.quantidade <= 0 ||
        Number.isNaN(item.quantidadeRecebida) ||
        item.quantidadeRecebida < 0 ||
        item.quantidadeRecebida > item.quantidade
    );

    if (itensInvalidos) {
      return NextResponse.json(
        { error: "Preencha corretamente os itens." },
        { status: 400 }
      );
    }

    const existeComMesmoNumero = await prisma.ordemServico.findFirst({
      where: {
        numero,
        NOT: { id },
      },
    });

    if (existeComMesmoNumero) {
      return NextResponse.json(
        { error: "Já existe outra OS com esse número." },
        { status: 400 }
      );
    }

    const osExistente = await prisma.ordemServico.findUnique({
      where: { id },
    });

    if (!osExistente) {
      return NextResponse.json({ error: "OS não encontrada." }, { status: 404 });
    }

    const updated = await prisma.ordemServico.update({
      where: { id },
      data: {
        numero,
        setor,
        fornecedor,
        responsavel,
        observacao,
        status,
        itens: {
          deleteMany: {},
          create: itensTratados,
        },
      },
      include: {
        itens: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar OS:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar OS." },
      { status: 500 }
    );
  }
}