export async function analyzeIndustrialImage(base64Image: string, prompt: string): Promise<string | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured');
      return '未配置 API 密钥，请在环境变量中设置 GEMINI_API_KEY';
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return `API 请求失败: ${response.status} - ${JSON.stringify(errorData)}`;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return text || '未能获取分析结果';
  } catch (error) {
    console.error('Error analyzing image:', error);
    return `分析过程中发生错误: ${error instanceof Error ? error.message : String(error)}`;
  }
}
