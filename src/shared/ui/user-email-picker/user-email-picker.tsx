import { useEffect, useId, useRef, useState } from "react";
import {
  useLazySearchUsersByNameQuery,
  type UserFullName
} from "@/services/user.api";
import styles from "./user-email-picker.module.scss";

const MIN_QUERY_LEN = 2;

interface UserEmailPickerProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  onChange: (email: string) => void;
}

const formatUserLabel = (user: UserFullName): string =>
  user.fullName?.trim() || user.email?.trim() || "Пользователь";

export const UserEmailPicker = ({
  id,
  label,
  value,
  placeholder,
  hint = "Введите имя или email — подскажем пользователей из системы.",
  error,
  onChange
}: UserEmailPickerProps) => {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchUsers, searchState] = useLazySearchUsersByNameQuery();

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      300
    );
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (!isOpen || debouncedQuery.length < MIN_QUERY_LEN) {
      return;
    }
    void searchUsers(debouncedQuery, true);
  }, [debouncedQuery, isOpen, searchUsers]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const results = searchState.data ?? [];
  const showDropdown = isOpen && debouncedQuery.length >= MIN_QUERY_LEN;

  const handleSelect = (user: UserFullName) => {
    const email = user.email?.trim() ?? "";
    setQuery(email);
    onChange(email);
    setIsOpen(false);
  };

  return (
    <div className={styles.field} ref={rootRef}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={showDropdown ? listId : undefined}
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && <p className={styles.error}>{error}</p>}

      {showDropdown && (
        <div id={listId} className={styles.dropdown} role="listbox">
          {searchState.isFetching && (
            <p className={styles.status}>Поиск пользователей…</p>
          )}
          {!searchState.isFetching && results.length === 0 && (
            <p className={styles.status}>Пользователи не найдены</p>
          )}
          {!searchState.isFetching &&
            results.map((user) => (
              <button
                key={user.id}
                type="button"
                role="option"
                className={styles.option}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(user)}
              >
                <span className={styles.optionName}>
                  {formatUserLabel(user)}
                </span>
                {user.email && (
                  <span className={styles.optionEmail}>{user.email}</span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
