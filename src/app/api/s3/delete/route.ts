import { S3 } from 'aws-sdk';
import { NextResponse } from "next/server";

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: Request) {
  const { key } = await req.json();
  try {
    await s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      })
      .promise();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('S3 delete error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
