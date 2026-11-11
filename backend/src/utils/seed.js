import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Problem } from '../models/Problem.js';
import { Badge } from '../models/Badge.js';
import { DailyChallenge } from '../models/DailyChallenge.js';
import { Submission } from '../models/Submission.js';
import { Battle } from '../models/Battle.js';
import { seedBadges, seedProblems } from './seedData.js';
import { config } from '../config/env.js';

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB at ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to MongoDB.');

    // 1. Drop existing database/collections to clear stale indexes
    console.log('[Seed] Dropping stale database collections...');
    try {
      await mongoose.connection.db.dropDatabase();
      console.log('[Seed] Database cleared cleanly.');
    } catch (e) {
      console.log('[Seed] Drop database note:', e.message);
    }

    // 2. Seed Badges
    console.log('[Seed] Seeding badges...');
    const createdBadges = await Badge.insertMany(seedBadges);
    console.log(`[Seed] ${createdBadges.length} badges created.`);

    // 3. Create Admin Account
    console.log('[Seed] Creating admin user...');
    const admin = await User.create({
      name: 'Alex Administrator',
      username: 'admin',
      email: 'admin@skillbattle.com',
      password: 'Admin@123',
      role: 'admin',
      bio: 'Head of Competitive Programming & Platform Administrator.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminBoss',
      rating: 2100,
      streak: { current: 15, max: 20, lastActiveDate: new Date().toISOString().split('T')[0] }
    });

    // 4. Create Sample Student Accounts
    console.log('[Seed] Creating sample students...');
    const student1 = await User.create({
      name: 'Devon Vance',
      username: 'devon_coder',
      email: 'student1@skillbattle.com',
      password: 'Student@123',
      role: 'student',
      bio: 'Algorithms enthusiast & Full-Stack Developer. Ready for 1v1 battles!',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevonVance',
      rating: 1520,
      streak: { current: 5, max: 9, lastActiveDate: new Date().toISOString().split('T')[0] },
      battleStats: {
        totalBattles: 8,
        wins: 6,
        losses: 2,
        draws: 0,
        winRate: 75
      }
    });

    const student2 = await User.create({
      name: 'Sarah Chen',
      username: 'sarah_dev',
      email: 'student2@skillbattle.com',
      password: 'Student@123',
      role: 'student',
      bio: 'CS student @ Capstone University. Practicing for coding interviews.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SarahChen',
      rating: 1410,
      streak: { current: 3, max: 7, lastActiveDate: new Date().toISOString().split('T')[0] },
      battleStats: {
        totalBattles: 6,
        wins: 3,
        losses: 2,
        draws: 1,
        winRate: 50
      }
    });

    // 5. Seed Problems
    console.log('[Seed] Seeding problems...');
    const problemsWithAdmin = seedProblems.map(p => ({
      ...p,
      createdBy: admin._id
    }));
    const createdProblems = await Problem.insertMany(problemsWithAdmin);
    console.log(`[Seed] ${createdProblems.length} coding problems created.`);

    // 6. Assign badges & solved problems to student1
    const welcomeBadge = createdBadges.find(b => b.slug === 'welcome');
    const firstSolveBadge = createdBadges.find(b => b.slug === 'first-solve');
    const battleWinBadge = createdBadges.find(b => b.slug === 'battle-first-win');

    if (welcomeBadge) student1.badges.push({ badge: welcomeBadge._id });
    if (firstSolveBadge) student1.badges.push({ badge: firstSolveBadge._id });
    if (battleWinBadge) student1.badges.push({ badge: battleWinBadge._id });

    // Mark two problems as solved by student1
    const p1 = createdProblems.find(p => p.slug === 'two-sum');
    const p2 = createdProblems.find(p => p.slug === 'valid-parentheses');
    if (p1) {
      student1.solvedProblems.push({
        problem: p1._id,
        solvedAt: new Date(Date.now() - 24 * 3600 * 1000),
        difficulty: p1.difficulty
      });
      // Add submission
      await Submission.create({
        user: student1._id,
        problem: p1._id,
        code: p1.starterCode.javascript,
        language: 'javascript',
        status: 'Accepted',
        testCasesPassed: 5,
        totalTestCases: 5,
        executionTime: 42,
        memory: 12400,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000)
      });
    }

    if (p2) {
      student1.solvedProblems.push({
        problem: p2._id,
        solvedAt: new Date(),
        difficulty: p2.difficulty
      });
      await Submission.create({
        user: student1._id,
        problem: p2._id,
        code: p2.starterCode.javascript,
        language: 'javascript',
        status: 'Accepted',
        testCasesPassed: 7,
        totalTestCases: 7,
        executionTime: 38,
        memory: 12200,
        createdAt: new Date()
      });
    }

    await student1.save();

    // 7. Seed Daily Challenge for Today
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyProblem = createdProblems.find(p => p.slug === 'two-sum') || createdProblems[0];
    console.log(`[Seed] Creating daily challenge for ${todayStr}...`);
    await DailyChallenge.create({
      date: todayStr,
      problem: dailyProblem._id,
      bonusPoints: 50,
      completions: [
        {
          user: student1._id,
          completedAt: new Date()
        }
      ]
    });

    // 8. Seed sample battle between student1 and student2
    console.log('[Seed] Seeding sample completed battle...');
    await Battle.create({
      roomCode: 'SB-PRO',
      creator: student1._id,
      opponent: student2._id,
      problem: dailyProblem._id,
      difficulty: dailyProblem.difficulty,
      duration: 600,
      status: 'completed',
      winner: student1._id,
      creatorReady: true,
      opponentReady: true,
      creatorProgress: {
        testCasesPassed: 5,
        totalTestCases: 5,
        submissionTimeSeconds: 184,
        status: 'solved'
      },
      opponentProgress: {
        testCasesPassed: 3,
        totalTestCases: 5,
        submissionTimeSeconds: 245,
        status: 'submitted_partial'
      },
      startTime: new Date(Date.now() - 3600 * 1000),
      endTime: new Date(Date.now() - 3600 * 1000 + 184 * 1000),
      resultSummary: {
        reason: 'solved_first',
        creatorPointsAwarded: 100,
        opponentPointsAwarded: -25
      }
    });

    console.log('\n=========================================');
    console.log('  SKILL BATTLE SEEDING COMPLETE! 🎉      ');
    console.log('=========================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@skillbattle.com');
    console.log('  Password: Admin@123\n');
    console.log('Student Accounts:');
    console.log('  Email:    student1@skillbattle.com');
    console.log('  Password: Student@123\n');
    console.log('  Email:    student2@skillbattle.com');
    console.log('  Password: Student@123');
    console.log('=========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDatabase();
