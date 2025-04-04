import mongoose from 'mongoose';
import Subject from '@/lib/db/model/Subject'
import { validateImagePath } from '@/lib/utils/fileValidation';
import { CreateSubjectInput } from '@/lib/db/model/types/Subject.types';
import { connectDB } from '@/lib/db/utils';

// Check existence or create subject
async function findOrCreateSubject(subject: CreateSubjectInput) {
  try {
    if (subject.imageUrl && !validateImagePath(subject.imageUrl)) {
      throw new Error(`Image file not found: ${subject.imageUrl}`);
    }

    const record = await Subject.findOneAndUpdate(
      { title: subject.title },
      subject,
      { upsert: true, new: true }
    );
    
    console.log('Subject found or created:', record);
    return record;
  } catch (error) {
    console.error('Error in findOrCreateSubject:', error);
    throw error;
  }
}

const subject_yuwen: CreateSubjectInput = {
  title: "语文",
  description: "Chinese Language Arts",
  labels: ["Chinese", "Language"],
  imageUrl: `${process.env.IMAGE_BASE_PATH}/subjects/yuwen.jpg`
};

const subject_shuxue: CreateSubjectInput = {
  title: "数学",
  description: "Mathematics is the universal language of logic, patterns, and relationships. It provides the tools to solve real-world problems, explore the mysteries of the universe, and build the foundations of modern technology. From basic arithmetic to complex calculus, mathematics fosters critical thinking, analytical reasoning, and problem-solving skills. It is essential in fields like engineering, finance, medicine, and data science, making it a cornerstone of human progress.",
  labels: ["Mathematics", "Logic", "Problem Solving", "Numbers", "Equations", "Algebra", "Geometry", "Calculus", "Statistics", "Patterns", "Critical Thinking", "STEM", "Theorems", "Formulas", "Applied Math"],
  imageUrl: `${process.env.IMAGE_BASE_PATH}/subjects/shuxue.jpg`
};

const subject_wuli: CreateSubjectInput = {
  title: "物理",
  description: "Physics is the study of the fundamental principles that govern the universe. It explores the nature of matter, energy, space, and time, seeking to understand how the world behaves from the smallest particles to the vast cosmos. Through observation, experimentation, and mathematical modeling, physics helps us uncover the laws of nature, leading to innovations in technology, medicine, engineering, and space exploration. It challenges our understanding of reality and inspires curiosity about the universe's mysteries.",
  labels: ["Physics", "Science", "Energy", "Motion", "Forces", "Gravity", "Electricity", "Magnetism", "Quantum Mechanics", "Relativity", "Astrophysics", "Thermodynamics", "Optics", "Waves", "Matter and Energy", "Experimentation", "Scientific Discovery"],
  imageUrl: `${process.env.IMAGE_BASE_PATH}/subjects/wuli.jpg`
};

const subject_lishi: CreateSubjectInput = {
  title: "历史",
  description: "History is the study of past events, civilizations, and the people who shaped the world. It helps us understand how societies evolved, learn from successes and failures, and appreciate the cultural, political, and technological advancements that define humanity. By exploring historical records, artifacts, and narratives, we gain insight into the forces that have shaped civilizations and continue to influence the present and future. History connects us to our roots, fosters critical thinking, and teaches valuable lessons about resilience, leadership, and progress.",
  labels: ["History", "Ancient Civilizations", "World History", "Cultural Heritage", "Historical Events", "Legends & Myths", "Archaeology", "Wars & Revolutions", "Historical Figures", "Empires & Dynasties", "Political History", "Social Movements", "Industrial Revolution", "Renaissance", "Exploration & Discovery", "Lessons from the Past"],
  imageUrl: `${process.env.IMAGE_BASE_PATH}/subjects/lishi.jpg`
};

const subject_yingyu: CreateSubjectInput = {
  title: "英语",
  description: "English is a global language used for communication, literature, business, science, and diplomacy. With rich vocabulary, diverse grammar, and deep cultural history, English connects people across continents and cultures. Studying English enhances reading, writing, speaking, and listening skills, while also opening doors to understanding classic literature, modern media, and global perspectives. Whether used in daily conversation or academic discourse, English empowers individuals to express ideas, share stories, and engage with the world.",
  labels: ["English", "Language", "Literature", "Reading", "Writing", "Vocabulary", "Grammar", "Communication", "Speaking & Listening", "Global Language", "Creative Writing", "Poetry", "Prose", "Public Speaking", "Storytelling", "Language Arts"],
  imageUrl: `${process.env.IMAGE_BASE_PATH}/subjects/yingyu.jpg`
};

async function main() {
  try {
    await connectDB();

    const yuwen_subject_result = await findOrCreateSubject(subject_yuwen);
    console.log('Subject 语文 created result:', yuwen_subject_result);

    const shuxue_subject_result = await findOrCreateSubject(subject_shuxue);
    console.log('Subject 数学 created result:', shuxue_subject_result);

    const wuli_subject_result = await findOrCreateSubject(subject_wuli);
    console.log('Subject 物理 created result:', wuli_subject_result);

    const lishi_subject_result = await findOrCreateSubject(subject_lishi);
    console.log('Subject 历史 created result:', lishi_subject_result);

    const yingyu_subject_result = await findOrCreateSubject(subject_yingyu);
    console.log('Subject 英语 created result:', yingyu_subject_result);
  } catch (error) {
    console.error('Main execution error:', error);
  } finally {
    // Close the connection when done
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);
