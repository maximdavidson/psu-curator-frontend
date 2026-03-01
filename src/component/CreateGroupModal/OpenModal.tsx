import { useState } from "react";
import styles from "./styles.module.scss";
import CreateGroupModal from "./CreateGroupModal";
import type { Group } from "./CreateGroupModal";
import { GroupCard } from "@/component/GroupCards/group-card.component";

export default function GroupsPageCreate() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const handleCreateGroup = (newGroup: Group) => {
    setGroups([...groups, newGroup]);
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.GroupCard}>
        {groups.map((g, index) => (
          <GroupCard
            key={index}
            groupName={g.groupName}
            curator={g.curator}
            numberStudents={g.numberStudents}
          />
        ))}
      </div>
      <CreateGroupModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreate={handleCreateGroup}
      />

      <img
        onClick={() => setIsOpen(true)}
        className={styles.AddBtn}
        src="./icons/Add_btn.svg"
        alt="Добавить группу"
      />
    </>
  );
}
