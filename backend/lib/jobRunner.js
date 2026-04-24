import Job from "../models/Job.js";
import Lesson from "../models/Lesson.js";
import Quiz from "../models/Quiz.js";
import { generatePersonalizedLessons, generateTopicLessons, generateQuizQuestions, generateAssessmentQuestions, refreshPersonalizedLessons } from "./geminiService.js";

let isWorkerRunning = false;
const inMemoryQueue = [];

const JOB_HANDLERS = {
  "lesson.generatePersonalized": async ({ userId, count }) => {
    const lessons = await generatePersonalizedLessons(userId, count);
    const savedLessons = await Lesson.insertMany(lessons);
    return { lessons: savedLessons, generatedCount: savedLessons.length };
  },
  "lesson.generateTopic": async ({ topic, difficulty, count }) => {
    const lessons = await generateTopicLessons(topic, difficulty, count);
    const savedLessons = await Lesson.insertMany(lessons);
    return { lessons: savedLessons, generatedCount: savedLessons.length };
  },
  "lesson.refreshPersonalized": async ({ userId }) => {
    const lessons = await refreshPersonalizedLessons(userId);
    return { lessons, generatedCount: lessons.length };
  },
  "quiz.generateAssessment": async ({ topic }) => {
    const questions = await generateAssessmentQuestions(topic);

    const quiz = await Quiz.create({
      title: `${topic} Skill Assessment`,
      description: `A comprehensive 15-question assessment to evaluate your ${topic} skills.`,
      type: "assessment",
      topic,
      xpReward: 150,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: 10
      }))
    });

    const quizForClient = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      xpReward: quiz.xpReward,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        points: q.points
      }))
    };

    return { quiz: quizForClient };
  },
  "quiz.generateLesson": async ({ lessonId, lessonTitle, lessonDescription }) => {
    const questions = await generateQuizQuestions(lessonTitle, lessonDescription);

    const quiz = await Quiz.create({
      title: `${lessonTitle} - Quick Quiz`,
      type: "lesson",
      lessonId,
      xpReward: 50,
      questions
    });

    const quizForClient = {
      _id: quiz._id,
      title: quiz.title,
      xpReward: quiz.xpReward,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        points: q.points
      }))
    };

    return { quiz: quizForClient };
  }
};

async function processNextJob() {
  const jobId = inMemoryQueue.shift();
  if (!jobId) return;

  const job = await Job.findById(jobId);
  if (!job) return;

  const handler = JOB_HANDLERS[job.type];
  if (!handler) {
    job.status = "failed";
    job.error = { message: `No handler for job type: ${job.type}` };
    await job.save();
    return;
  }

  job.status = "running";
  await job.save();

  try {
    const result = await handler(job.payload || {});
    job.status = "succeeded";
    job.result = result;
    await job.save();
  } catch (error) {
    job.status = "failed";
    job.error = { message: error?.message || "Job failed", stack: error?.stack };
    await job.save();
  }
}

async function workerLoop() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  try {
    while (inMemoryQueue.length > 0) {
      // eslint-disable-next-line no-await-in-loop
      await processNextJob();
    }
  } finally {
    isWorkerRunning = false;
  }
}

export async function enqueueJob({ type, createdBy, payload }) {
  const job = await Job.create({
    type,
    createdBy,
    payload,
    status: "queued"
  });

  inMemoryQueue.push(job._id.toString());
  // Detach from request lifecycle.
  setImmediate(() => {
    workerLoop().catch(err => console.error("Job worker error:", err));
  });

  return job;
}

export async function startJobRunner() {
  // Recover jobs that were running when the process died.
  await Job.updateMany({ status: "running" }, { $set: { status: "queued" } });

  // Resume any queued jobs.
  const queued = await Job.find({ status: "queued" }).select("_id").sort({ createdAt: 1 }).limit(50);
  queued.forEach(j => inMemoryQueue.push(j._id.toString()));

  if (inMemoryQueue.length > 0) {
    setImmediate(() => {
      workerLoop().catch(err => console.error("Job worker error:", err));
    });
  }
}
