import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { taskService } from '../services/taskService';
import { TaskStatus } from '../types/task';
import styles from './AddTask.module.css';

const MAX_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1200;

export const AddTask = () => {
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('incomplete');
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const trimmedName = taskName.trim();

    if (!trimmedName) {
      setNameError('Task name is required');
      return false;
    }

    if (trimmedName.length > MAX_LENGTH) {
      setNameError('Task name cannot exceed 120 characters');
      return false;
    }

    const trimmedDescription = taskDescription.trim();
    if (!trimmedDescription) {
      setDescriptionError('Task description is required');
      return false;
    }

    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError('Task description cannot exceed 1200 characters');
      return false;
    }

    setNameError(null);
    setDescriptionError(null);
    return true;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setApiError(null);
    setSubmitting(true);

    try {
      await taskService.create({
        name: taskName.trim(),
        description: taskDescription.trim(),
        status,
      });

      navigate('/');
    } catch (unknownError) {
      if (axios.isAxiosError(unknownError)) {
        setApiError(unknownError.response?.data?.error ?? unknownError.message);
      } else {
        setApiError('Could not create task right now');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link to="/" className={styles.backLink}>
          ← Back to tasks
        </Link>

        <h1>Add New Task</h1>

        {apiError && <div className={styles.errorBanner}>{apiError}</div>}

        <form onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="taskName">Task Name</label>
            <input
              id="taskName"
              type="text"
              value={taskName}
              maxLength={MAX_LENGTH}
              onChange={(event) => {
                setTaskName(event.target.value);
                if (nameError) {
                  setNameError(null);
                }
              }}
              placeholder="Write a task title"
            />
            <div className={styles.counter}>{taskName.length} / 120</div>
            {nameError && <p className={styles.fieldError}>{nameError}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="taskDescription">Description</label>
            <textarea
              id="taskDescription"
              value={taskDescription}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(event) => {
                setTaskDescription(event.target.value);
                if (descriptionError) {
                  setDescriptionError(null);
                }
              }}
              placeholder="Add task details"
              rows={4}
            />
            <div className={styles.counter}>{taskDescription.length} / 1200</div>
            {descriptionError && <p className={styles.fieldError}>{descriptionError}</p>}
          </div>

          <div className={styles.field}>
            <p className={styles.statusLabel}>Status</p>
            <div className={styles.statusChoices}>
              <label
                className={`${styles.statusChoice} ${status === 'incomplete' ? styles.incompleteSelected : ''}`}
              >
                <input
                  type="radio"
                  name="status"
                  value="incomplete"
                  checked={status === 'incomplete'}
                  onChange={() => setStatus('incomplete')}
                />
                Incomplete
              </label>

              <label className={`${styles.statusChoice} ${status === 'complete' ? styles.completeSelected : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="complete"
                  checked={status === 'complete'}
                  onChange={() => setStatus('complete')}
                />
                Complete
              </label>
            </div>
          </div>

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Adding...
              </>
            ) : (
              'Add Task'
            )}
          </button>
        </form>
      </section>
    </main>
  );
};
