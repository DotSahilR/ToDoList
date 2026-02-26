import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { TaskModel } from '../models/Task';
import { UserModel } from '../models/User';
import { TaskStatus } from '../types/task';

dotenv.config();

const presets: { name: string; description: string; status: TaskStatus }[] = [
  { name: 'Plan sprint board for next release', description: 'Create sprint goals, align stories with owners, and lock a realistic timeline for delivery.', status: 'incomplete' },
  { name: 'Refine landing page CTA copy', description: 'Test clearer action verbs and align button copy with the latest product messaging.', status: 'complete' },
  { name: 'Write API contract tests for tasks', description: 'Cover create, update, toggle, and delete edge cases so regressions are caught before release.', status: 'incomplete' },
  { name: 'Fix flaky CI workflow on pull requests', description: 'Pin unstable dependencies and add retry logic around known intermittent test steps.', status: 'incomplete' },
  { name: 'Review onboarding checklist with design', description: 'Validate each onboarding screen against the checklist and close gaps before handoff.', status: 'complete' },
  { name: 'Update DB indexes for task queries', description: 'Improve read performance by adding indexes used by task listing and status filters.', status: 'incomplete' },
  { name: 'Prepare demo dataset for stakeholders', description: 'Populate realistic sample tasks and metadata so the demo reflects production usage.', status: 'complete' },
  { name: 'Document release rollback playbook', description: 'Define rollback triggers, command sequence, and communication steps for incident response.', status: 'incomplete' },
  { name: 'Audit CORS config before deployment', description: 'Verify allowed origins for local and production clients and remove permissive leftovers.', status: 'complete' },
  { name: 'Clean up stale feature flags in app shell', description: 'Retire old flag checks that are already permanently enabled to reduce client complexity.', status: 'incomplete' },
  { name: 'Draft Q2 engineering goals', description: 'Outline measurable goals for reliability, delivery speed, and product quality improvements.', status: 'incomplete' },
  { name: 'Schedule post-release incident review', description: 'Book a short retrospective and gather logs, metrics, and action items in advance.', status: 'complete' }
];

const parseCount = (rawCount: string | undefined): number => {
  if (!rawCount) {
    return 12;
  }

  const parsed = Number(rawCount);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('--count must be a positive integer');
  }

  return parsed;
};

const shouldReset = (argv: string[]): boolean => argv.includes('--reset');

const buildSeedTasks = (
  count: number,
  userId: string
): { userId: string; name: string; description: string; status: TaskStatus }[] => {
  const rows: { userId: string; name: string; description: string; status: TaskStatus }[] = [];

  for (let idx = 0; idx < count; idx += 1) {
    const template = presets[idx % presets.length];
    const label = count > presets.length ? ` #${idx + 1}` : '';
    rows.push({
      userId,
      name: `${template.name}${label}`,
      description: template.description,
      status: template.status
    });
  }

  return rows;
};

const main = async () => {
  const count = parseCount(process.argv.find((arg) => arg.startsWith('--count='))?.split('=')[1]);
  const resetCollection = shouldReset(process.argv);

  await connectDB();

  const seedEmail = 'seed-user@todo.local';
  let seedUser = await UserModel.findOne({ email: seedEmail });
  if (!seedUser) {
    const passwordHash = await bcrypt.hash('seedpassword', 10);
    seedUser = await UserModel.create({ email: seedEmail, password: passwordHash });
  }

  if (resetCollection) {
    await TaskModel.deleteMany({ userId: seedUser._id });
  }

  const seedRows = buildSeedTasks(count, seedUser._id.toString());
  const inserted = await TaskModel.insertMany(seedRows);

  const completeCount = inserted.filter((task) => task.status === 'complete').length;
  const incompleteCount = inserted.length - completeCount;

  console.log(`seeded ${inserted.length} tasks (incomplete=${incompleteCount}, complete=${completeCount})`);
};

main()
  .catch((err: Error) => {
    console.error('seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
