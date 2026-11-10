import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in environment.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. AI Meal Analysis (Image & Text)
app.post('/api/diet/analyze-meal', async (req: Request, res: Response) => {
  try {
    const { text, imageBase64, mimeType = 'image/jpeg', mealType = '식사' } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: '식단 설명 또는 사진을 제공해주세요.' });
    }

    const ai = getAiClient();
    const parts: any[] = [];

    if (imageBase64) {
      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const userPrompt = `
당신은 대한민국 최고의 전문 임상 영양사이자 친절하고 꼼꼼한 다이어트 코치입니다.
사용자가 제공한 식단(${mealType})의 ${imageBase64 ? '사진 및 ' : ''}설명을 분석하여 정확한 영양 성분 추정치와 전문적인 다이어트 조언을 제공해주세요.

사용자 입력: "${text || '사진 속 식단을 분석해주세요.'}"

응답 형식은 반드시 지정된 JSON 규격에 맞추어 출력해주세요. 한국 표준 식품영양성분 데이터베이스 기준을 바탕으로 합리적인 g당/인분당 칼로리를 산출하세요.
`;
    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: {
              type: Type.STRING,
              description: '주요 음식 및 구성 요약 (예: 닭가슴살 현미밥 샐러드 & 아몬드)',
            },
            calories: {
              type: Type.INTEGER,
              description: '총 예상 칼로리 (kcal)',
            },
            carbs: {
              type: Type.NUMBER,
              description: '탄수화물 (g)',
            },
            protein: {
              type: Type.NUMBER,
              description: '단백질 (g)',
            },
            fat: {
              type: Type.NUMBER,
              description: '지방 (g)',
            },
            sodium: {
              type: Type.INTEGER,
              description: '나트륨 (mg)',
            },
            sugar: {
              type: Type.NUMBER,
              description: '당류 (g)',
            },
            healthScore: {
              type: Type.INTEGER,
              description: '다이어트 적합도 점수 (1~10)',
            },
            feedback: {
              type: Type.STRING,
              description: '친절하고 전문적인 영양 코칭 및 다이어트 피드백 (2~3문장)',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '핵심 영양 태그 (예: 고단백, 저나트륨, 클린식단, 식이섬유풍부)',
            },
          },
          required: ['foodName', 'calories', 'carbs', 'protein', 'fat', 'healthScore', 'feedback', 'tags'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing meal:', error);
    // Provide sensible fallback if AI key missing or error occurs
    return res.status(500).json({
      error: '식단 분석 중 문제가 발생했습니다. 수동 입력을 이용하거나 다시 시도해주세요.',
      details: error.message,
    });
  }
});

// 2. AI Diet & Macro Plan Generator
app.post('/api/diet/generate-plan', async (req: Request, res: Response) => {
  try {
    const {
      gender = 'female',
      age = 28,
      height = 165,
      weight = 63,
      targetWeight = 55,
      activityLevel = 'moderate',
      dietGoal = 'loss',
      preference = 'balanced',
    } = req.body;

    const ai = getAiClient();
    const prompt = `
사용자 프로필:
- 성별: ${gender === 'female' ? '여성' : '남성'}
- 나이: ${age}세
- 신장: ${height}cm, 현재 체중: ${weight}kg, 목표 체중: ${targetWeight}kg
- 활동량: ${activityLevel}
- 다이어트 목표: ${dietGoal} (체중 감량/유지/근육증가)
- 선호 식단 스타일: ${preference} (균형잡힌 클린식단, 저탄고단, 간헐적 단식 친화 등)

해당 사용자의 정밀 BMR(기초대사량), TDEE(일일 총 에너지 소비량), 건강한 감량을 위한 목표 일일 칼로리, 탄단지 권장 비율 및 g수, 1일 추천 맞춤 식단(아침, 점심, 저녁, 간식), 전문 다이어트 조언을 JSON으로 제안해주세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bmr: { type: Type.INTEGER, description: '기초대사량 (kcal)' },
            tdee: { type: Type.INTEGER, description: '유지 칼로리 TDEE (kcal)' },
            recommendedCalories: { type: Type.INTEGER, description: '권장 일일 섭취 칼로리 (kcal)' },
            recommendedCarbs: { type: Type.INTEGER, description: '권장 탄수화물 (g)' },
            recommendedProtein: { type: Type.INTEGER, description: '권장 단백질 (g)' },
            recommendedFat: { type: Type.INTEGER, description: '권장 지방 (g)' },
            waterGoalMl: { type: Type.INTEGER, description: '권장 수분 섭취량 (ml)' },
            expectedDurationWeeks: { type: Type.INTEGER, description: '예상 달성 소요 기간 (주)' },
            mealPlan: {
              type: Type.OBJECT,
              properties: {
                breakfast: { type: Type.STRING, description: '추천 아침 식단' },
                lunch: { type: Type.STRING, description: '추천 점심 식단' },
                dinner: { type: Type.STRING, description: '추천 저녁 식단' },
                snack: { type: Type.STRING, description: '추천 간식' },
              },
              required: ['breakfast', 'lunch', 'dinner', 'snack'],
            },
            coachAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '맞춤형 핵심 다이어트 성공 팁 3가지',
            },
          },
          required: [
            'bmr',
            'tdee',
            'recommendedCalories',
            'recommendedCarbs',
            'recommendedProtein',
            'recommendedFat',
            'waterGoalMl',
            'expectedDurationWeeks',
            'mealPlan',
            'coachAdvice',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating plan:', error);
    return res.status(500).json({ error: '다이어트 플랜 생성 중 오류가 발생했습니다.', details: error.message });
  }
});

// 3. AI Diet Coach Consultation Chat / Advice
app.post('/api/diet/coach-chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    const ai = getAiClient();
    const systemPrompt = `
당신은 다이어트 전문 코치 '슬림로그 AI 코치'입니다.
한국인의 식습관(외식, 배달음식, 회식, 편의점, 닭가슴살 식단 등)에 대해 깊이 이해하고 있으며,
건강을 해치지 않는 지속 가능한 다이어트 원칙(칼로리 적자, 양질의 단백질 섭취, 수분 및 수면 관리, 근력운동 병행)을 전문적이면서도 따뜻하고 긍정적으로 설명합니다.
답변은 읽기 편하도록 핵심 포인트 위주로 간결하고 명확하게(3~4단락 내외) 작성해주세요.

사용자 현재 상태 요약:
${JSON.stringify(context || {})}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Error in coach chat:', error);
    return res.status(500).json({ error: 'AI 코칭 상담 중 오류가 발생했습니다.', details: error.message });
  }
});

// Dev vs Prod Vite setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SlimLog Diet Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
