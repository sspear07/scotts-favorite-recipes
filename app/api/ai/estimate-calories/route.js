
import { openai } from '@/lib/openaiClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { ingredients } = await request.json();

        if (!ingredients || ingredients.length === 0) {
            return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
        }

        const prompt = `
      Calculate the approximate calories for EACH of the following ingredients, and the total calories.
      Return a JSON object with this exact structure:
      {
        "total_calories": number,
        "ingredients": [
          { "item": "exact ingredient name from list", "amount": "original amount", "calories": number }
        ]
      }
      Do not output markdown code blocks, just the raw JSON string.
      
      Ingredients:
      ${ingredients.map(ing => `- ${ing.amount} ${ing.item}`).join('\n')}
    `;

        console.log('OpenAI Prompt:', prompt);

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const text = completion.choices[0].message.content;
        console.log('OpenAI Response:', text);

        const data = JSON.parse(text);

        return NextResponse.json({
            calories: data.total_calories, // Keeping this for backward compatibility if needed, but 'data' has it
            total_calories: data.total_calories,
            ingredients: data.ingredients
        });
    } catch (error) {
        console.error('Error estimating calories:', error);
        return NextResponse.json({
            error: 'Failed to estimate calories',
            details: error.message
        }, { status: 500 });
    }
}
