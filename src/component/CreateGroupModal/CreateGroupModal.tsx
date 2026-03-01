import { useState } from "react";
import styles from "./styles.module.scss";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newGroup: Group) => void;
}

export interface Group {
  groupName: string;
  curator: string;
  numberStudents: number;
}

const MAX_LENGTH = 50;
const NAME_REGEX = /^[А-Яа-яЁё0-9]+(-[А-Яа-яЁё0-9]+)*$/;

const CreateGroupModal = ({
  isOpen,
  onClose,
  onCreate
}: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState<string>("");
  const [curator, setCurator] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleClose = () => {
    setGroupName("");
    setCurator("");
    setError("");
    onClose();
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      setError("Поле не может быть пустым");
      return;
    }

    if (!NAME_REGEX.test(groupName)) {
      setError("Поле содержит недопустимые символы");
      return;
    }

    const newGroup: Group = {
      groupName: groupName.trim(),
      curator,
      numberStudents: 0
    };

    onCreate(newGroup);
    setError("");
    setGroupName("");
    setCurator("");
    onClose();
  };

  return (
    <div className={styles.ModalOverlay}>
      <div className={styles.Modal}>
        <div className={styles.ModalHeader}>
          <h2>Создание группы</h2>
          <img
            className={styles.CloseBtn}
            onClick={handleClose}
            src="./icons/X.svg"
          ></img>
        </div>

        <div className={styles.ModalBody}>
          <div className={styles.Group}>
            <label>Имя группы</label>
            <input
              type="text"
              maxLength={MAX_LENGTH}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div
              className={`${styles.CharCounter} ${
                groupName.length === MAX_LENGTH ? styles.limit : ""
              }`}
            >
              {groupName.length}/{MAX_LENGTH}
            </div>
          </div>

          <div className={styles.Group}>
            <label>Куратор группы</label>
            <select
              value={curator}
              onChange={(e) => setCurator(e.target.value)}
            >
              <option value="" disabled hidden></option>
              <option value="sample1">sample1</option>
              <option value="sample2">sample2</option>
              <option value="sample3">sample3</option>
            </select>
          </div>
        </div>

        <div className={styles.ModalFooter}>
          {error && <div className={styles.Error}>{error}</div>}
          <button className={styles.CancelBtn} onClick={handleClose}>
            Отмена
          </button>
          <button className={styles.CreateBtn} onClick={handleCreate}>
            Создать
          </button>
          \
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
