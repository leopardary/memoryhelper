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

    const prompt = `请根据以下要求完成任务：用“${content}”字组成三个词语，并用这三个词语各造两个句子。输出时，请严格按照以下格式排列：

- 将三个词语用逗号隔开；
- 紧接##符号；
- 然后写出两个例句，中间用/分隔。

在生成答案前，请确保：
- 首先推理和选择合适的“${content}”字词语；
- 然后再根据这几个词语，推理和构造语句，保证每个例句都包含这些词语，语法与用法均正确；
- 最后输出合格的答案，格式详见下方示例。

输出格式：
词语1,词语2,词语3##例句1/例句2

示例：
输入：“他”字，要求：组三个词，造两个句子，并按范例输出格式返回。

期望输出示例（例子仅供格式参考，内容可替换）：
他的，他人，他心##他的书丢了/他人帮助了他

（实际输出例子需自行挑选合适词语和编写完整句子）

请严格按照上述格式输出，确保符号、分隔和顺序准确无误。

重要提醒：  
任务目标是——分别推理选词与造句，再输出结果；输出时先词语、再句子，并用要求的格式展示。`;

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
