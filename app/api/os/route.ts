import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ItemTratado = {
  nome: string;
  quantidade: number;
  quantidadeRecebida: number;
  unidade: string;
  observacao: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const numero = String(body?.numero ?? "").trim();
    const setor = String(body?.setor ?? "").trim() || null;
    const fornecedor = String(body?.fornecedor ?? "").trim() || null;
    const responsavel = String(body?.responsavel ?? "").trim() || null;
    const observacao = String(body?.observacao ?? "").trim() || null;

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

    const itensTratados: ItemTratado[] = itens.map((item: any) => ({
      nome: String(item?.nome ?? "").trim(),
      quantidade: Number(item?.quantidade ?? 0),
      quantidadeRecebida: 0,
      unidade: String(item?.unidade ?? "").trim(),
      observacao: String(item?.observacao ?? "").trim() || null,
    }));

    const itensInvalidos = itensTratados.some(
      (item: ItemTratado) =>
        !item.nome ||
        !item.unidade ||
        Number.isNaN(item.quantidade) ||
        item.quantidade <= 0
    );

    if (itensInvalidos) {
      return NextResponse.json(
        { error: "Preencha corretamente os itens." },
        { status: 400 }
      );
    }

    const jaExiste = await prisma.ordemServico.findUnique({
      where: { numero },
    });

    if (jaExiste) {
      return NextResponse.json(
        { error: "Já existe uma OS com esse número." },
        { status: 400 }
      );
    }

    const os = await prisma.ordemServico.create({
      data: {
        numero,
        setor,
        fornecedor,
        responsavel,
        observacao,
        status: "PENDENTE",
        itens: {
          create: itensTratados,
        },
      },
      include: {
        itens: true,
      },
    });

    return NextResponse.json(os, { status: 201 });
  } catch (error) {
    console.error("ERRO NA API /api/os:", error);

    return NextResponse.json(
      { error: "Erro interno ao criar OS." },
      { status: 500 }
    );
  }
}