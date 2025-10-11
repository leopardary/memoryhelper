import { NextResponse } from "next/server";
import isEmpty from 'lodash/isEmpty';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { text } = await req.json();

  if (isEmpty(text)) {
    return NextResponse.json({ error: "Missing text!" }, { status: 400 });
  }

  try {
    // Generate audio using OpenAI
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return base64 encoded audio
    return NextResponse.json(
      {
        audio: buffer.toString('base64'),
        contentType: "audio/mpeg"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
