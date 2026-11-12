import { StudentProfile, Subject, Lesson, PersonalizedPathData, RecommendedLessonItem, LearningMilestone } from '../types';

/**
 * Calculates a fully personalized, adaptive learning path for the student
 * based on their study level, completed lessons, quiz scores, and subject curriculum.
 */
export function calculatePersonalizedPath(
  student: StudentProfile,
  subjects: Subject[],
  lessons: Lesson[]
): PersonalizedPathData {
  const completedIds = new Set(student.completedLessons || []);
  const quizScores = student.quizScores || {};

  const totalLessons = lessons.length;
  const completedCount = completedIds.size;
  const completionRate = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Calculate average quiz score across completed quizzes
  const scoredLessonIds = Object.keys(quizScores);
  const totalScoreSum = scoredLessonIds.reduce((sum, id) => sum + (quizScores[id] || 0), 0);
  const averageQuizScore = scoredLessonIds.length > 0 
    ? Math.round(totalScoreSum / scoredLessonIds.length) 
    : 0;

  // Academic Readiness Label & Color
  let readinessLabel: PersonalizedPathData['readinessLabel'] = 'مبتدئ';
  let readinessColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800';

  if (completionRate >= 75 && averageQuizScore >= 80) {
    readinessLabel = 'جاهز للاختبارات الجامعية';
    readinessColor = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700';
  } else if (completionRate >= 60 || averageQuizScore >= 75) {
    readinessLabel = 'متقدم';
    readinessColor = 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800';
  } else if (completionRate >= 25 || scoredLessonIds.length >= 2) {
    readinessLabel = 'متوسط';
    readinessColor = 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
  }

  // Helper map for quick subject lookup
  const subjectMap = new Map<string, Subject>();
  subjects.forEach(s => subjectMap.set(s.id, s));

  // 1. Identify Strengths (quizzes with score >= 85%)
  const strengths: PersonalizedPathData['strengths'] = [];
  scoredLessonIds.forEach(id => {
    const score = quizScores[id];
    if (score >= 80) {
      const lesson = lessons.find(l => l.id === id);
      const subject = lesson ? subjectMap.get(lesson.subjectId) : null;
      if (lesson) {
        strengths.push({
          subjectName: subject?.name || 'المنهج العام',
          skill: lesson.title.split('(')[0].trim(),
          score
        });
      }
    }
  });

  // 2. Identify Weak Points & Remediation Needs (score < 65%)
  const remediationItems: RecommendedLessonItem[] = [];
  const focusAreas: PersonalizedPathData['focusAreas'] = [];

  scoredLessonIds.forEach(id => {
    const score = quizScores[id];
    if (score < 65 && completedIds.has(id)) {
      const lesson = lessons.find(l => l.id === id);
      const subject = lesson ? subjectMap.get(lesson.subjectId) : null;
      if (lesson && subject) {
        const item: RecommendedLessonItem = {
          lesson,
          subject,
          recommendationType: 'remediation_review',
          title: `تثبيت وتدارك: ${lesson.title}`,
          reason: `حصلت على ${score}% في اختبار هذا الدرس. مراجعة القوانين وحل مسائل إضافية سترفع فهمك وتمكنك من الدروس التالية.`,
          priority: 'urgent',
          estimatedMinutes: 10,
          keyTopics: lesson.terms?.slice(0, 3).map(t => t.term) || [],
          relatedTool: subject.id.includes('circuit') ? 'arduino' : 'formulas',
          scoreAchieved: score
        };
        remediationItems.push(item);

        focusAreas.push({
          subjectName: subject.name,
          topic: lesson.title.split('(')[0].trim(),
          score,
          advice: 'راجع الأخطاء الشائعة وخطوات الأمثلة المحلولة ثم أعد الاختبار.'
        });
      }
    }
  });

  // 3. Recommended Sequential Lessons
  // Order priority:
  // Physics 101 -> Circuits 101 -> Math 101 -> Programming -> Mechatronics Intro
  const subjectPriority: Record<string, number> = {
    'physics': 1,
    'circuits-1': 2,
    'math-1': 3,
    'programming': 4,
    'eng-fundamentals': 5,
    'drawing': 6
  };

  const sortedLessons = [...lessons].sort((a, b) => {
    const pA = subjectPriority[a.subjectId] || 99;
    const pB = subjectPriority[b.subjectId] || 99;
    if (pA !== pB) return pA - pB;
    return (a.order || 0) - (b.order || 0);
  });

  const uncompletedLessons = sortedLessons.filter(l => !completedIds.has(l.id));

  // Determine Primary Recommendation
  let primaryRecommendation: RecommendedLessonItem | null = null;
  const secondaryRecommendations: RecommendedLessonItem[] = [];

  if (remediationItems.length > 0) {
    // If there is an urgent remediation needed, make the lowest score lesson primary
    remediationItems.sort((a, b) => (a.scoreAchieved || 0) - (b.scoreAchieved || 0));
    primaryRecommendation = remediationItems[0];
  } else if (uncompletedLessons.length > 0) {
    // Sequential next lesson
    const nextLesson = uncompletedLessons[0];
    const subject = subjectMap.get(nextLesson.subjectId) || subjects[0];
    
    // Find what previous lesson was completed to explain rationale
    const prevCompletedInSubject = sortedLessons
      .filter(l => l.subjectId === nextLesson.subjectId && completedIds.has(l.id))
      .pop();

    const rationale = prevCompletedInSubject
      ? `بناءً على إتقانك لدرس "${prevCompletedInSubject.title.split('(')[0]}"، الخطوة الطبيعية التالية هي الانتقال إلى "${nextLesson.title.split('(')[0]}".`
      : completedCount === 0
      ? `نقطة الانطلاق المثالية لمنهج ${student.studyLevel}: تأسيس المفاهيم الهندسية والفيزيائية الأولى.`
      : `الخطوة التالية المجدولة في مسارك الأكاديمي لمادة ${subject.name}.`;

    primaryRecommendation = {
      lesson: nextLesson,
      subject,
      recommendationType: completedCount === 0 ? 'starter' : 'next_sequential',
      title: nextLesson.title,
      reason: rationale,
      priority: 'high',
      estimatedMinutes: nextLesson.readingTimeMinutes || 15,
      keyTopics: nextLesson.terms?.slice(0, 3).map(t => t.term) || ['المفاهيم الأساسية', 'القوانين', 'أمثلة محلولة'],
      prerequisiteLessonTitle: prevCompletedInSubject?.title,
      relatedTool: subject.id.includes('circuit') ? 'arduino' : subject.id.includes('physics') ? 'formulas' : 'assignments'
    };
  } else if (lessons.length > 0) {
    // Completed all lessons! Propose advanced challenge or comprehensive exam
    const firstLesson = lessons[0];
    const subject = subjectMap.get(firstLesson.subjectId) || subjects[0];
    primaryRecommendation = {
      lesson: firstLesson,
      subject,
      recommendationType: 'advanced_challenge',
      title: 'تحدي المراجعة الشاملة ونماذج الامتحانات الرسمية',
      reason: 'تهانينا يا مهندس! لقد أنهيت جميع الدروس الأساسية في المنهاج. خطوتك الموصى بها هي حل نماذج الامتحانات وتطبيق المشاريع التفاعلية.',
      priority: 'normal',
      estimatedMinutes: 30,
      keyTopics: ['نماذج الامتحانات النهائية', 'محاكي Arduino', 'منشئ التكليفات'],
      relatedTool: 'assignments'
    };
  }

  // Populate secondary recommendations (the next 2 uncompleted lessons)
  const remainingNext = uncompletedLessons.filter(l => l.id !== primaryRecommendation?.lesson.id).slice(0, 3);
  remainingNext.forEach(lesson => {
    const subject = subjectMap.get(lesson.subjectId) || subjects[0];
    secondaryRecommendations.push({
      lesson,
      subject,
      recommendationType: 'next_sequential',
      title: lesson.title,
      reason: `درس قادم ضمن مسار ${subject.name}`,
      priority: 'normal',
      estimatedMinutes: lesson.readingTimeMinutes || 15,
      keyTopics: lesson.terms?.slice(0, 2).map(t => t.term) || [],
      relatedTool: subject.id.includes('circuit') ? 'arduino' : 'formulas'
    });
  });

  // 4. Build Curriculum Milestones Timeline
  const milestones: LearningMilestone[] = sortedLessons.map((lesson, idx) => {
    const isCompleted = completedIds.has(lesson.id);
    const score = quizScores[lesson.id];
    const isPrimaryNext = primaryRecommendation?.lesson.id === lesson.id;

    let status: LearningMilestone['status'] = 'locked';
    if (isCompleted) {
      status = score !== undefined && score < 65 ? 'review_needed' : 'completed';
    } else if (isPrimaryNext) {
      status = 'current';
    } else if (idx === 0 && completedCount === 0) {
      status = 'current';
    }

    const subject = subjectMap.get(lesson.subjectId);

    return {
      id: `milestone-${lesson.id}`,
      stepNumber: idx + 1,
      title: lesson.title.split('(')[0].trim(),
      description: lesson.coreConcept ? lesson.coreConcept.slice(0, 85) + '...' : lesson.title,
      subjectId: lesson.subjectId,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      status,
      score,
      estimatedMinutes: lesson.readingTimeMinutes || 14,
      category: subject?.name || 'مقرر عام'
    };
  });

  // 5. Generate Adaptive AI Advisor Advice
  let aiAdvisorTip = '';
  if (completedCount === 0) {
    aiAdvisorTip = `أهلاً بك يا باشمهندس في ${student.university}! البداية هي نصف الطريق: ابدأ بدرس المتجهات والكميات الفيزيائية، فهو حجر الزاوية لكل قوانين الحركة والروبوتات في تخصص الميكاترونكس.`;
  } else if (remediationItems.length > 0) {
    aiAdvisorTip = `ملاحظة أكاديمية ذكية: لديك درس بحاجة لتثبيت الفهم. لا تقلق، في الهندسة الأخطاء هي أفضل معلم! خصص 10 دقائق لمراجعة خطوات الحل ونموذج الإجابة لترتفع درجتك في الاختبار القصير.`;
  } else if (averageQuizScore >= 85) {
    aiAdvisorTip = `أداء استثنائي بمعدل اختبارات ${averageQuizScore}%! ننصحك بعد كل درس بالانتقال فوراً لمحاكي Arduino لتطبيق النظرية بيدك وتوليد تكليف هندسي لتثبيت المعلومة.`;
  } else {
    aiAdvisorTip = `خطتك الدراسية تسير بثبات: أنهيت ${completedCount} من أصل ${totalLessons} دروس. حافظ على وتيرة إكمال درسين أسبوعياً لتكون مستعداً قبل بدء امتحانات الجامعة.`;
  }

  // 6. Weekly Target
  const weeklyTarget = {
    recommendedHours: completedCount < 3 ? 3 : 4,
    recommendedLessons: completedCount === 0 ? 1 : 2,
    statusText: completedCount >= 4 ? 'أداء ممتاز، متقدم على الخطة الأسبوعية' : 'مطلوب إكمال درسين هذا الأسبوع للمحافظة على الجاهزية'
  };

  return {
    studentLevel: student.studyLevel,
    university: student.university,
    totalLessons,
    completedCount,
    completionRate,
    averageQuizScore,
    readinessLabel,
    readinessColor,
    primaryRecommendation,
    secondaryRecommendations,
    remediationItems,
    strengths,
    focusAreas,
    milestones,
    aiAdvisorTip,
    weeklyTarget
  };
}
