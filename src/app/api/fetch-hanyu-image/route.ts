import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    // Step 1: Search Baidu for the query
    const baiduSearchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;

    const searchResponse = await axios.get(baiduSearchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      timeout: 10000,
    });

    const $search = cheerio.load(searchResponse.data);

    // Step 2: Find hanyu.baidu.com link in search results
    let hanyuUrl = '';
    $search('img').each((_, element) => {
      const src = $search(element).attr('src');
      if (src && src.includes('hanyu-word-gif')) {
        hanyuUrl = decodeURIComponent(src.split("src=")[1].split("&refer=")[0]);
        return false; // break
      }
    });

    const gifUrl = hanyuUrl;
    if (!gifUrl) {
      return NextResponse.json({
        error: 'Image not found',
        message: 'Could not find .gif image on the page'
      }, { status: 404 });
    }

    return NextResponse.json({
      imageUrl: gifUrl,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching Hanyu image:', error);
    return NextResponse.json({
      error: 'Failed to fetch image',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
