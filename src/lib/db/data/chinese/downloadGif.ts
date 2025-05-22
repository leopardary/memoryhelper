import {getCharacterLoadingGif} from '@/lib/utils/chineseCharacterGif'
import {writeBufferToFile} from '@/lib/utils/fileUtils'

//'获','赖','潜','索','舶','兰','唤','纪','技','改','程','超','亿','核','奥','益','联','质','哲','任','善'，'驻','钞','培','赌','媒','氛','账','贺','樟','杠','狡','猾'
const characters = [];

async function main() {
  try {
    // Example usage with the character loading GIF
    for (const character of characters) {
      const gifBuffer = await getCharacterLoadingGif(character);
      await writeBufferToFile(gifBuffer, `public/images/subjects/yuwen/4a/unit2/lesson6/${character}.gif`);
    }
       
  } catch (error) {
    console.error('Main execution error:', error);
  }
}

main().catch(console.error);

// to execute, run `npx tsx src/lib/db/data/chinese/downloadGif.ts`