import { NextResponse } from "next/server";
import { S3 } from "aws-sdk";
import crypto from "crypto";

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: Request) {
  const { text, audioBase64 } = await req.json();

  if (!text || !audioBase64) {
    return NextResponse.json({ error: "Missing text or audio data!" }, { status: 400 });
  }

  try {
    // Generate deterministic key based on text hash
    const hash = crypto.createHash("md5").update(text).digest("hex");
    const key = `readCache/${hash}.mp3`;

    // Convert base64 back to buffer
    const buffer = Buffer.from(audioBase64, 'base64');

    // Save to S3
    await s3
      .putObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: "audio/mpeg",
        ACL: "public-read",
      })
      .promise();

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json(
      { url, key },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving audio to S3:', error);
    return NextResponse.json(
      { error: "Failed to save audio" },
      { status: 500 }
    );
  }
}
