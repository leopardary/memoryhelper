import { NextResponse } from "next/server";
import { S3 } from "aws-sdk";
import crypto from "crypto";

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "Missing text!" }, { status: 400 });
  }

  try {
    // Generate deterministic key based on text hash
    const hash = crypto.createHash("md5").update(text).digest("hex");
    const key = `readCache/${hash}.mp3`;

    // Delete from S3
    await s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      })
      .promise();

    return NextResponse.json(
      { message: "Audio deleted successfully", key },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting audio from S3:', error);
    return NextResponse.json(
      { error: "Failed to delete audio" },
      { status: 500 }
    );
  }
}
