import { NextResponse } from "next/server";
import isEmpty from 'lodash/isEmpty';
import { S3 } from "aws-sdk";
import crypto from "crypto";

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

    // 2. Generate audio using atomic API
    const generateRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/audio/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!generateRes.ok) {
      return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
    }

    const { audio } = await generateRes.json();

    // 3. Save to S3 using atomic API
    const saveRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/audio/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, audioBase64: audio }),
    });

    if (!saveRes.ok) {
      return NextResponse.json({ error: "Failed to save audio" }, { status: 500 });
    }

    const { url: savedUrl } = await saveRes.json();
    url = savedUrl;
  }
  return NextResponse.json(
      { url: url },
      { status: 200 }
    );
}