import { NextResponse } from "next/server";
import isEmpty from 'lodash/isEmpty';
import OpenAI from "openai";
import { S3 } from "aws-sdk";
import crypto from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: Request) {
  const { text } = await req.json();
  if (isEmpty(text)) {
    return NextResponse.json({ error: "Missing text!" }, { status: 400 });
  }

  // Generate a deterministic filename for caching
  const hash = crypto.createHash("md5").update(text).digest("hex");
  const key = `readCache/${hash}.mp3`;
  let url = '';

  // 1. Check if file already exists in S3
  try {
    await s3
      .headObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      })
      .promise();
    url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (err: any) {
    console.log('Cache missed. Generating audio...' + err);
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy", // You can choose voices like "verse", "aria" etc.
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    // 3. Save to S3
    await s3
      .putObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: "audio/mpeg",
        ACL: "public-read",
      })
      .promise();
    url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
  return NextResponse.json(
      { url: url },
      { status: 200 }
    );
}