import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  try {
    const { provider, apiKey, prompt } = await req.json()

    if (!provider || !apiKey || !prompt) {
      return NextResponse.json({ error: '필수 정보(provider, apiKey, prompt)가 누락되었습니다.' }, { status: 400 })
    }

    if (provider === 'gemini') {
      // 1. API 키에 권한이 있는 사용 가능한 모델 목록 조회
      const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!modelsRes.ok) {
        throw new Error('Gemini API 키가 유효하지 않거나 모델 목록을 불러올 수 없습니다.');
      }
      const modelsData = await modelsRes.json();
      
      // 2. 텍스트 생성(generateContent)을 지원하는 모델 필터링
      const validModels = modelsData.models.filter((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent')
      );

      if (validModels.length === 0) {
        throw new Error('이 Gemini API 키로는 텍스트 생성을 지원하는 모델을 찾을 수 없습니다.');
      }

      // 3. 빠르고 가성비 좋은 flash 모델 우선 선택 (2.5 -> 1.5), 없으면 pro 등 아무거나 선택
      let selectedModelName = validModels[0].name;
      const preferred = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-pro'];
      
      for (const pref of preferred) {
        const found = validModels.find((m: any) => m.name.includes(pref));
        if (found) {
          selectedModelName = found.name;
          break;
        }
      }

      const modelId = selectedModelName.replace('models/', '');
      console.log('Gemini 선택된 모델:', modelId);

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: modelId })
      const result = await model.generateContent(prompt)
      return NextResponse.json({ text: result.response.text() })
    }

    if (provider === 'openai') {
      const openai = new OpenAI({ apiKey })
      let text = ''
      try {
        // 우선 gpt-4o 시도
        const completion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4o',
        })
        text = completion.choices[0].message?.content || ''
      } catch (err: any) {
        // 권한이나 한도 문제면 gpt-4o-mini로 자동 폴백
        if (err.status === 404 || err.status === 403 || err.status === 429) {
          console.log('OpenAI gpt-4o 실패, gpt-4o-mini로 시도합니다.');
          const fallback = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o-mini',
          })
          text = fallback.choices[0].message?.content || ''
        } else {
          throw err
        }
      }
      return NextResponse.json({ text })
    }

    if (provider === 'claude') {
      const anthropic = new Anthropic({ apiKey })
      const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      return NextResponse.json({ text })
    }

    return NextResponse.json({ error: '지원하지 않는 AI 제공자입니다.' }, { status: 400 })

  } catch (err: any) {
    console.error('AI Proxy Error:', err)
    return NextResponse.json({ error: err.message || '알 수 없는 오류' }, { status: 500 })
  }
}
