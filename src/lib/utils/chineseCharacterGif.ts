import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getCharacterLoadingGif(character: string): Promise<Buffer> {
  try {
    // First, fetch the HTML page
    const url = `https://www.chineselearning.com/character/simplified/${character}`;
    const htmlResponse = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Parse the HTML to find the GIF URL
    const $ = cheerio.load(htmlResponse.data);
    const gifUrl = $('img[src*=".gif"]').attr('src');
    
    if (!gifUrl) {
      throw new Error(`No GIF found for character: ${character}`);
    }

    // Fetch the actual GIF
    const gifResponse = await axios.get(gifUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/gif',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    return Buffer.from(gifResponse.data);
  } catch (error) {
    console.error('Error fetching character loading GIF:', error);
    throw new Error(`Failed to fetch loading GIF for character: ${character}`);
  }
}

