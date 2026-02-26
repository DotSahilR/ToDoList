import { useMemo, useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import styles from './TaskCard.module.css';

type TaskCardProps = {
  task: Task;
  onToggleStatus: (taskId: string, nextStatus: TaskStatus) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onRenameTask: (taskId: string, nextName: string) => Promise<void>;
};

const readableDate = (isoDate: string): string => {
  const calendarDate = new Date(isoDate);
  return calendarDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const TaskCard = ({ task, onToggleStatus, onDeleteTask, onRenameTask }: TaskCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [draftName, setDraftName] = useState(task.name);

  const toggleLabel = task.status === 'complete' ? 'Mark Incomplete' : 'Mark Complete';
  const nextStatus: TaskStatus = task.status === 'complete' ? 'incomplete' : 'complete';
  const toggleButtonClass = task.status === 'complete' ? styles.outlineOrange : styles.outlineGreen;
  const badgeClass = task.status === 'complete' ? styles.completeBadge : styles.incompleteBadge;
  const createdText = useMemo(() => readableDate(task.createdAt), [task.createdAt]);
  const description = (task.description || '').trim() || 'No description provided.';
  const shouldCollapse = description.length > 140;
  const visibleDescription = showFullDescription || !shouldCollapse
    ? description
    : `${description.slice(0, 140)}...`;

  const runToggle = async () => {
    setBusy(true);
    try {
      await onToggleStatus(task._id, nextStatus);
    } finally {
      setBusy(false);
    }
  };

  const runDelete = async () => {
    setBusy(true);
    try {
      await onDeleteTask(task._id);
    } finally {
      setBusy(false);
    }
  };

  const commitRename = async () => {
    const trimmed = draftName.trim();

    if (!trimmed || trimmed === task.name) {
      setDraftName(task.name);
      setEditing(false);
      return;
    }

    setBusy(true);
    try {
      await onRenameTask(task._id, trimmed);
      setEditing(false);
    } catch {
      setDraftName(task.name);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.titleWrap}>
          {editing ? (
            <input
              className={styles.renameInput}
              value={draftName}
              autoFocus
              maxLength={120}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={() => void commitRename()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void commitRename();
                }

                if (event.key === 'Escape') {
                  setDraftName(task.name);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <h3 className={styles.title} onClick={() => setEditing(true)}>
              {task.name}
            </h3>
          )}
          <span className={`${styles.statusBadge} ${badgeClass}`}>
            {task.status === 'complete' ? 'Complete' : 'Incomplete'}
          </span>
        </div>

        <div className={styles.menuWrap}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="task options"
            disabled={busy}
          >
            ⋯
          </button>
          {menuOpen && (
            <div className={styles.menu}>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void runDelete();
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.metaRow}>
        <p className={styles.meta}>Created {createdText}</p>
      </div>

      <p className={styles.description}>{visibleDescription}</p>
      {shouldCollapse && (
        <button
          type="button"
          className={styles.viewMore}
          onClick={() => setShowFullDescription((open) => !open)}
        >
          {showFullDescription ? 'Show less' : 'View more'}
        </button>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.toggleButton} ${toggleButtonClass}`}
          disabled={busy}
          onClick={() => void runToggle()}
        >
          {toggleLabel}
        </button>
      </div>
    </article>
  );
};
