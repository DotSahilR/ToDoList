import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TaskCard } from '../components/TaskCard';
import { useTasks } from '../hooks/useTasks';
import { TaskStatus } from '../types/task';
import styles from './Home.module.css';
import { authService } from '../services/authService';

type FilterMode = 'all' | TaskStatus;

const statusFilters: { id: FilterMode; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'incomplete', label: 'Incomplete' },
  { id: 'complete', label: 'Complete' },
];

const formatHeaderDate = (): string => {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
};

export const Home = () => {
  const navigate = useNavigate();
  const { tasks, loading, error, toggleStatus, deleteTask, renameTask } = useTasks();
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all');
  const [searchText, setSearchText] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const activeUser = authService.getUser();
  const initials = activeUser?.email.slice(0, 2).toUpperCase() || 'TU';

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const visibleTasks = useMemo(() => {
    const sourceTasks = Array.isArray(tasks) ? tasks : [];
    let filteredTasks = sourceTasks;

    if (activeFilter !== 'all') {
      filteredTasks = filteredTasks.filter((task) => task.status === activeFilter);
    }

    const normalizedQuery = searchText.trim().toLowerCase();
    if (normalizedQuery) {
      filteredTasks = filteredTasks.filter((task) => task.name.toLowerCase().includes(normalizedQuery));
    }

    return filteredTasks;
  }, [activeFilter, searchText, tasks]);

  const onSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>To Do List</h1>
        </div>

        <div className={styles.headerCenter}>
          <input
            type="text"
            placeholder="Search tasks"
            value={searchText}
            onChange={onSearchInput}
            aria-label="Search tasks"
          />
        </div>

        <div className={styles.headerRight}>
          <span className={styles.datePill}>{formatHeaderDate()}</span>
          <div className={styles.profileMenu} ref={profileMenuRef}>
            <button
              type="button"
              className={styles.profileButton}
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-label="profile options"
            >
              <span className={styles.avatar}>{initials}</span>
            </button>
            {profileMenuOpen && (
              <div className={styles.menuDropdown}>
                <button
                  type="button"
                  onClick={() => {
                    authService.logout();
                    navigate('/login', { replace: true });
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className={styles.controls}>
        <div className={styles.filterGroup} role="group" aria-label="Filter tasks by status">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`${styles.filterButton} ${activeFilter === filter.id ? styles.filterButtonActive : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <Link to="/add" className={styles.addButton}>
          New Task Model
        </Link>
      </section>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <section className={styles.taskContainer}>
        {loading ? (
          <div className={styles.loadingStack}>
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className={styles.emptyState}>No tasks match the current filter.</div>
        ) : (
          <div className={styles.taskList}>
            {visibleTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggleStatus={toggleStatus}
                onDeleteTask={deleteTask}
                onRenameTask={renameTask}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
