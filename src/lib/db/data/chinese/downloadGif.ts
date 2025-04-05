import {getCharacterLoadingGif} from '@/lib/utils/chineseCharacterGif'
import {writeBufferToFile} from '@/lib/utils/fileUtils'

//'浩', '崩', '震', '霎', '薄', '笼', '罩', '踮', '恢', '潮', '据', '堤', '阔', '盼', '滚', 
const characters = ['顿', '逐', '渐', '堵', '犹', '余'];

async function main() {
  try {
    // Example usage with the character loading GIF
    for (const character of characters) {
      const gifBuffer = await getCharacterLoadingGif(character);
      await writeBufferToFile(gifBuffer, `public/images/subjects/yuwen/4a/unit1/lesson1/${character}.gif`);
    }
       
  } catch (error) {
    console.error('Main execution error:', error);
  }
}

main().catch(console.error);
