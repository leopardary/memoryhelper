import mongoose from 'mongoose';
import {getSubjectByTitle} from '@/lib/db/api/subject';
import {findOrCreateMemoryPiece} from '@/lib/db/api/memory-piece'
import {findOrCreateUnit} from '@/lib/db/api/unit'
import { connectDB } from '@/lib/db/utils';
import data from '@/lib/db/data/chinese/all_seed_data';

export async function processSeedData() {
  try {
    await connectDB();
    const yuwen_subject_result = await getSubjectByTitle("语文");
    console.log('Subject 语文 found:', yuwen_subject_result);
    if (yuwen_subject_result == null) {
      throw new Error('Subject 语文 is not found.')
    }
    // Create or find the subject
    for (const moduleKey of Object.keys(data)) {
      const module = data[moduleKey];
      const moduleTitle = Object.keys(module)[0];

    const moduleData = module[moduleTitle];
    const moduleRecord = await findOrCreateUnit({
      title: moduleTitle,
      type: moduleData.type,
      description: moduleData.description,
      imageUrls: moduleData.imageUrls,
      order: moduleData.order,
      subject: yuwen_subject_result.id
    });

    const chapterTitle = Object.keys(moduleData.data[0])[0];
    const chapterData = moduleData.data[0][chapterTitle];
    const chapter = await findOrCreateUnit({
      title: chapterTitle,
      type: chapterData.type,
      description: chapterData.description,
      imageUrls: chapterData.imageUrls,
      order: chapterData.order,
      subject: yuwen_subject_result.id,
      parentUnit: moduleRecord.id
    });

    const lessonTitles = Object.keys(chapterData.data[0]);
    for (const lessonTitle of lessonTitles) {
      const lessonData = chapterData.data[0][lessonTitle];
      const lessonRecord = await findOrCreateUnit({
        title: lessonTitle,
        type: lessonData.type,
        description: lessonData.description,
        imageUrls: lessonData.imageUrls,
        order: lessonData.order,
        subject: yuwen_subject_result.id,
        parentUnit: chapter.id
      });
    const characters = lessonData.data;

    for (const character of characters) {
      const content = Object.keys(character)[0];
      const data = character[content];
      const description = data['组词']?.join(', ') + '##' + data['造句']?.join('/ ');
      const imageUrls = data['imageUrls'];
      const labels = data['labels'];
      const characterRecord = await findOrCreateMemoryPiece({
        content,
        description,
        imageUrls,
        labels,
        unit: lessonRecord.id,
        subject: yuwen_subject_result.id,
      })
    }
        console.log('Seed data processing completed successfully');
  } }
    }catch (error) {
    console.error('Error processing seed data:', error);
    throw error;
  }
    
    

    


}

// Example Usage
async function main() {
  try {
    await processSeedData();

    // const memoryPiece: CreateMemoryPieceInput = {
    //   subject: yuwen_subject_result._id,
    //   content: "示例内容",
    //   description: "Example content",
    //   labels: ["example"],
    //   imageUrl: '/images/memory-pieces/example.jpg'
    // };

    // const memoryPieceResult = await findOrCreateMemoryPiece(memoryPiece);
    // console.log('Memory Piece Result:', memoryPieceResult);
  } catch (error) {
    console.error('Main execution error:', error);
  } finally {
    // Close the connection when done
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);

/**
 * To run this file, execute `npx tsx src/lib/db/data/chinese/upsert.ts` in commandline
 */