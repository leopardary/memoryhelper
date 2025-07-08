export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Unit {
  id: string;
  name: string;
  subjectId: string;
}

export interface Lesson {
  id: string;
  name: string;
  unitId: string;
}

export interface MemoryPiece {
  id: string;
  title: string;
  description: string;
  lessonId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface TestResult {
  id: string;
  memoryPieceId: string;
  score: number;
  maxScore: number;
  testDate: string;
}

export const mockData = {
  subjects: [
    { id: 's1', name: 'Mathematics', color: '#3B82F6' },
    { id: 's2', name: 'Science', color: '#10B981' },
    { id: 's3', name: 'History', color: '#F59E0B' },
    { id: 's4', name: 'Languages', color: '#EF4444' },
  ] as Subject[],

  units: [
    { id: 'u1', name: 'Algebra', subjectId: 's1' },
    { id: 'u2', name: 'Geometry', subjectId: 's1' },
    { id: 'u3', name: 'Physics', subjectId: 's2' },
    { id: 'u4', name: 'Chemistry', subjectId: 's2' },
    { id: 'u5', name: 'Ancient History', subjectId: 's3' },
    { id: 'u6', name: 'Modern History', subjectId: 's3' },
    { id: 'u7', name: 'Spanish', subjectId: 's4' },
    { id: 'u8', name: 'French', subjectId: 's4' },
  ] as Unit[],

  lessons: [
    { id: 'l1', name: 'Linear Equations', unitId: 'u1' },
    { id: 'l2', name: 'Quadratic Equations', unitId: 'u1' },
    { id: 'l3', name: 'Triangle Properties', unitId: 'u2' },
    { id: 'l4', name: 'Circle Theorems', unitId: 'u2' },
    { id: 'l5', name: 'Newton\'s Laws', unitId: 'u3' },
    { id: 'l6', name: 'Thermodynamics', unitId: 'u3' },
    { id: 'l7', name: 'Periodic Table', unitId: 'u4' },
    { id: 'l8', name: 'Chemical Reactions', unitId: 'u4' },
  ] as Lesson[],

  memoryPieces: [
    {
      id: 'mp1',
      title: 'Slope-Intercept Form',
      description: 'Understanding y = mx + b formula',
      lessonId: 'l1',
      difficulty: 'easy',
      tags: ['algebra', 'linear', 'slope']
    },
    {
      id: 'mp2',
      title: 'Solving for X',
      description: 'Isolating variables in linear equations',
      lessonId: 'l1',
      difficulty: 'medium',
      tags: ['algebra', 'solving', 'variables']
    },
    {
      id: 'mp3',
      title: 'Quadratic Formula',
      description: 'Using the quadratic formula to solve equations',
      lessonId: 'l2',
      difficulty: 'hard',
      tags: ['algebra', 'quadratic', 'formula']
    },
    {
      id: 'mp4',
      title: 'Pythagorean Theorem',
      description: 'a² + b² = c² in right triangles',
      lessonId: 'l3',
      difficulty: 'medium',
      tags: ['geometry', 'triangles', 'theorem']
    },
    {
      id: 'mp5',
      title: 'Circle Area Formula',
      description: 'A = πr² for circle calculations',
      lessonId: 'l4',
      difficulty: 'easy',
      tags: ['geometry', 'circles', 'area']
    },
    {
      id: 'mp6',
      title: 'Newton\'s First Law',
      description: 'Object at rest stays at rest unless acted upon',
      lessonId: 'l5',
      difficulty: 'medium',
      tags: ['physics', 'motion', 'laws']
    },
    {
      id: 'mp7',
      title: 'Periodic Trends',
      description: 'Atomic radius and ionization energy patterns',
      lessonId: 'l7',
      difficulty: 'hard',
      tags: ['chemistry', 'periodic', 'trends']
    },
    {
      id: 'mp8',
      title: 'Balancing Equations',
      description: 'Conservation of mass in chemical reactions',
      lessonId: 'l8',
      difficulty: 'medium',
      tags: ['chemistry', 'reactions', 'balance']
    },
  ] as MemoryPiece[],

  testResults: [
    // Recent results (past few days)
    { id: 'tr1', memoryPieceId: 'mp1', score: 85, maxScore: 100, testDate: '2025-07-06T10:30:00Z', timeSpent: 120, mistakes: ['Forgot to include y-intercept'] },
    { id: 'tr2', memoryPieceId: 'mp2', score: 92, maxScore: 100, testDate: '2025-07-06T14:15:00Z', timeSpent: 180, mistakes: [] },
    { id: 'tr3', memoryPieceId: 'mp3', score: 78, maxScore: 100, testDate: '2025-06-30T16:45:00Z', timeSpent: 240, mistakes: ['Calculation error', 'Wrong discriminant'] },
    { id: 'tr4', memoryPieceId: 'mp4', score: 95, maxScore: 100, testDate: '2025-06-30T09:20:00Z', timeSpent: 90, mistakes: [] },
    { id: 'tr5', memoryPieceId: 'mp5', score: 88, maxScore: 100, testDate: '2025-06-29T11:10:00Z', timeSpent: 75, mistakes: ['Unit conversion error'] },
    
    // Past week results
    { id: 'tr6', memoryPieceId: 'mp1', score: 82, maxScore: 100, testDate: '2025-06-28T15:30:00Z', timeSpent: 135, mistakes: ['Sign error'] },
    { id: 'tr7', memoryPieceId: 'mp6', score: 90, maxScore: 100, testDate: '2025-06-27T13:20:00Z', timeSpent: 150, mistakes: [] },
    { id: 'tr8', memoryPieceId: 'mp7', score: 73, maxScore: 100, testDate: '2025-06-26T17:00:00Z', timeSpent: 300, mistakes: ['Confused trends', 'Wrong explanation'] },
    { id: 'tr9', memoryPieceId: 'mp8', score: 87, maxScore: 100, testDate: '2025-06-25T10:45:00Z', timeSpent: 200, mistakes: ['Missing coefficient'] },
    { id: 'tr10', memoryPieceId: 'mp2', score: 89, maxScore: 100, testDate: '2025-06-24T14:30:00Z', timeSpent: 165, mistakes: [] },
    
    // Past month results
    { id: 'tr11', memoryPieceId: 'mp3', score: 75, maxScore: 100, testDate: '2025-06-20T16:15:00Z', timeSpent: 280, mistakes: ['Formula error'] },
    { id: 'tr12', memoryPieceId: 'mp4', score: 93, maxScore: 100, testDate: '2025-06-18T11:30:00Z', timeSpent: 85, mistakes: [] },
    { id: 'tr13', memoryPieceId: 'mp1', score: 79, maxScore: 100, testDate: '2025-06-15T09:45:00Z', timeSpent: 145, mistakes: ['Slope calculation'] },
    { id: 'tr14', memoryPieceId: 'mp5', score: 91, maxScore: 100, testDate: '2025-06-12T13:20:00Z', timeSpent: 70, mistakes: [] },
    { id: 'tr15', memoryPieceId: 'mp6', score: 86, maxScore: 100, testDate: '2025-06-10T15:10:00Z', timeSpent: 140, mistakes: ['Incomplete explanation'] },
    { id: 'tr16', memoryPieceId: 'mp7', score: 71, maxScore: 100, testDate: '2025-06-08T17:30:00Z', timeSpent: 320, mistakes: ['Wrong trend direction', 'Missing units'] },
    { id: 'tr17', memoryPieceId: 'mp8', score: 84, maxScore: 100, testDate: '2025-06-05T12:00:00Z', timeSpent: 190, mistakes: ['Balancing error'] },
    { id: 'tr18', memoryPieceId: 'mp2', score: 88, maxScore: 100, testDate: '2025-06-03T10:15:00Z', timeSpent: 175, mistakes: [] },
  ] as TestResult[],
};

// Helper functions to get related data
export const getSubjectById = (id: string) => mockData.subjects.find(s => s.id === id);
export const getUnitById = (id: string) => mockData.units.find(u => u.id === id);
export const getLessonById = (id: string) => mockData.lessons.find(l => l.id === id);
export const getMemoryPieceById = (id: string) => mockData.memoryPieces.find(mp => mp.id === id);

export const getMemoryPieceDetails = (memoryPieceId: string) => {
  const memoryPiece = getMemoryPieceById(memoryPieceId);
  if (!memoryPiece) return null;
  
  const lesson = getLessonById(memoryPiece.lessonId);
  const unit = lesson ? getUnitById(lesson.unitId) : null;
  const subject = unit ? getSubjectById(unit.subjectId) : null;
  
  return { memoryPiece, lesson, unit, subject };
};