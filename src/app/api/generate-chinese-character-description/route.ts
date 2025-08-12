import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Put your key in .env.local
});

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Missing 'content'" }, { status: 400 });
    }

    const prompt = `请用\'${content}\'字组三个词，造两个句子。结果请以以下方式组织：词语1,词语2,词语3##例句1/例句2`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4o", adjust if needed
      messages: [{ role: "user", content: prompt }],
    });

    const generatedText =
      completion.choices[0]?.message?.content?.trim() ||
      "未生成内容";

    return NextResponse.json({ description: generatedText });
  } catch (err) {
    console.error("Error generating description:", err);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
