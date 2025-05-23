import {getCharacterLoadingGif} from '@/lib/utils/chineseCharacterGif'
import {writeBufferToFile} from '@/lib/utils/fileUtils'

//'隐','毫','掘','搜','倾','骤','置','抛','宅','临','慎','选','择','址','良','穴','厅','卧','专','卫','较'
const characters = ['纲','授','揍','键','谱','锈','沫','砖','矿','综','氧','俱'];

async function main() {
  try {
    // Example usage with the character loading GIF
    for (const character of characters) {
      const gifBuffer = await getCharacterLoadingGif(character);
      await writeBufferToFile(gifBuffer, `public/images/subjects/yuwen/4a/unit8/practice/${character}.gif`);
    }
       
  } catch (error) {
    console.error('Main execution error:', error);
  }
}

main().catch(console.error);

// to execute, run `npx tsx src/lib/db/data/chinese/downloadGif.ts`