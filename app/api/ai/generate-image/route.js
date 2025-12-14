
import { openai } from '@/lib/openaiClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { title, description, cuisine } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const prompt = `
      Professional food photography of ${title} (${cuisine} cuisine). 
      Description: ${description}. 
      High resolution, vibrant colors, delicious, plated on a nice table. 
      Photorealistic, 4k.
    `;

        console.log('Generating image for:', prompt);

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        const imageUrl = response.data[0].url;
        console.log('Image generated:', imageUrl);

        return NextResponse.json({ imageUrl });

    } catch (error) {
        console.error('Error generating image:', error);

        const fs = require('fs');
        fs.appendFileSync('openai_debug_log.txt', `Image Error: ${error.message}\n${error.stack}\n`);

        return NextResponse.json({
            error: 'Failed to generate image',
            details: error.message
        }, { status: 500 });
    }
}
