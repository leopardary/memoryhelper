import { S3 } from 'aws-sdk';
import { NextResponse } from "next/server";

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

export async function POST(req: Request) {
  const { fileName, fileType, filePath } = await req.json();

  const fileKey = `${filePath}/${fileName}`;

  const url = await s3.getSignedUrlPromise('putObject', {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
    ContentType: fileType,
    ACL: 'public-read',
    Expires: 60,
  });

  const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  return NextResponse.json({ uploadUrl: url, publicUrl }, { status: 200 });
}
