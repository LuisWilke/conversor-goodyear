import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    
    // Suporte a múltiplos encodings (UTF-16, UTF-8, Latin1)
    let text = '';
    try {
      text = new TextDecoder('utf-16').decode(buffer);
      if (!text.includes('SKU') && !text.includes('sku')) {
        throw new Error();
      }
    } catch {
      try {
        text = new TextDecoder('utf-8').decode(buffer);
      } catch {
        text = new TextDecoder('latin1').decode(buffer);
      }
    }

    const lines = text.split(/\r?\n/);
    const outLines: string[] = [
      'sku_goodyear;volume_vendas;faturamento_bruto;data_faturamento;codigo_goodyear_distribuidor;id_cliente'
    ];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 6) continue;

      const [sku, volume, faturamento, data, distribuidor, cliente] = parts;

      // Substitui vírgula por ponto decimal
      const faturamentoFormatado = faturamento.replace(',', '.');

      const linhaFormatada = `${sku};${volume};${faturamentoFormatado};${data};${distribuidor};${cliente}`;
      outLines.push(linhaFormatada);
    }

    const resultadoFinal = outLines.join('\r\n') + '\r\n';

    return new NextResponse(resultadoFinal, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="goodyear_convertido.txt"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno ao processar o arquivo.' }, { status: 500 });
  }
}