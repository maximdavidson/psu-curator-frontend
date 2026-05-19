import { useEffect, useId, useRef, useState } from "react";
import styles from "./faculty-picker.module.scss";

const FACULTY_PRESETS = ["ФИТ", "ФЭУ", "ФК"] as const;

interface FacultyPickerProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  onChange: (faculty: string) => void;
}

export const FacultyPicker = ({
  id,
  label,
  value,
  placeholder = "Выберите факультет или введите свой",
  hint = "Можно выбрать из списка или указать другое название.",
  error,
  onChange
}: FacultyPickerProps) => {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

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

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPresets = FACULTY_PRESETS.filter((faculty) =>
    faculty.toLowerCase().includes(normalizedQuery)
  );
  const showCustomOption =
    query.trim().length > 0 &&
    !FACULTY_PRESETS.some(
      (faculty) => faculty.toLowerCase() === normalizedQuery
    );
  const showDropdown =
    isOpen && (filteredPresets.length > 0 || showCustomOption);

  const handleSelect = (faculty: string) => {
    setQuery(faculty);
    onChange(faculty);
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
          {filteredPresets.map((faculty) => (
            <button
              key={faculty}
              type="button"
              role="option"
              className={styles.option}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(faculty)}
            >
              {faculty}
            </button>
          ))}
          {showCustomOption && (
            <button
              type="button"
              role="option"
              className={styles.optionCustom}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(query.trim())}
            >
              <span className={styles.optionCustomLabel}>Использовать:</span>
              <span className={styles.optionCustomValue}>{query.trim()}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
