import {getCharacterLoadingGif} from '@/lib/utils/chineseCharacterGif'
import {writeBufferToFile} from '@/lib/utils/fileUtils'

async function main() {
  try {
    // Example usage with the character loading GIF
    const character = '他';
    const gifBuffer = await getCharacterLoadingGif(character);
    await writeBufferToFile(gifBuffer, 'public/images/subjects/yuwen/4a/unit1/lesson1/他.gif');
  } catch (error) {
    console.error('Main execution error:', error);
  }
}

main().catch(console.error);
