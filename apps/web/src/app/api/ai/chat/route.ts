import { NextRequest, NextResponse } from 'next/server';
import { executeRagPipeline } from '@/server/rag';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Tin nhắn không hợp lệ.'
      }, { status: 400 });
    }

    const query = message.trim();

    // Guardrail: Max query length
    if (query.length > 1000) {
      return NextResponse.json({
        success: false,
        error: 'Tin nhắn quá dài (tối đa 1000 ký tự).'
      }, { status: 400 });
    }

    // Execute full Geo-Strict RAG + DeepSeek pipeline
    const ragResult = await executeRagPipeline(query, history);

    return NextResponse.json({
      success: true,
      data: {
        reply: ragResult.reply,
        intent: ragResult.intent,
        mode: ragResult.mode,
        answerType: ragResult.answerType,
        citations: ragResult.citations,
        suggestedPrompts: ragResult.suggestions,
        actionLink: ragResult.actionLink,
        evidenceScope: ragResult.evidenceScope || 'rag_verified',
        toolsUsed: ragResult.mode.startsWith('live_deepseek')
          ? ['deepseek_live_api', 'dongnai_geo_rag', 'citation_validator']
          : ['dongnai_geo_rag', 'budget_calculator', 'fact_grounding']
      }
    });

  } catch (err: any) {
    console.error('AI Chat route error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Lỗi xử lý phản hồi từ trợ lý CropNet AI'
    }, { status: 500 });
  }
}
