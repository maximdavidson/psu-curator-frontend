import { useEffect, useId, useRef, useState } from "react";
import styles from "../faculty-picker/faculty-picker.module.scss";
import { getDepartmentsForFaculty } from "@/shared/data/university-structure";

interface DepartmentPickerProps {
  id: string;
  label: string;
  value: string;
  faculty: string;
  placeholder?: string;
  error?: string;
  onChange: (department: string) => void;
}

export const DepartmentPicker = ({
  id,
  label,
  value,
  faculty,
  placeholder = "Выберите кафедру",
  error,
  onChange
}: DepartmentPickerProps) => {
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

  const departments = getDepartmentsForFaculty(faculty);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = departments.filter((d) =>
    d.toLowerCase().includes(normalizedQuery)
  );
  const showDropdown = isOpen && filtered.length > 0;

  const handleSelect = (department: string) => {
    setQuery(department);
    onChange(department);
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
        placeholder={
          departments.length === 0 ? "Сначала выберите факультет" : placeholder
        }
        value={query}
        disabled={departments.length === 0}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {error && <p className={styles.error}>{error}</p>}

      {showDropdown && (
        <div id={listId} className={styles.dropdown} role="listbox">
          {filtered.map((dept) => (
            <button
              key={dept}
              type="button"
              role="option"
              className={styles.option}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
