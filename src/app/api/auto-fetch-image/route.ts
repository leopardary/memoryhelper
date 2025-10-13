import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { S3 } from "aws-sdk";
import crypto from "crypto";

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filePath } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    // Step 1: Fetch the image URL from hanyu.baidu.com
    const fetchImageResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fetch-hanyu-image?query=${encodeURIComponent(query)}`,
      { method: 'GET' }
    );

    if (!fetchImageResponse.ok) {
      const error = await fetchImageResponse.json();
      return NextResponse.json({
        error: 'Failed to fetch image URL',
        details: error.error || error.message,
      }, { status: 404 });
    }

    const { imageUrl } = await fetchImageResponse.json();

    // Step 2: Download the image
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://hanyu.baidu.com/',
      },
      timeout: 15000,
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    // Step 3: Generate filename and upload to S3
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
    const fileName = `${query}-${hash}.gif`;
    const s3Key = filePath ? `${filePath}/${fileName}` : `auto-fetched/${fileName}`;

    await s3
      .putObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: 'image/gif',
        ACL: 'public-read',
      })
      .promise();

    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      key: s3Key,
      originalUrl: imageUrl,
    }, { status: 200 });

  } catch (error) {
    console.error('Error in auto-fetch-image:', error);
    return NextResponse.json({
      error: 'Failed to auto-fetch image',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
