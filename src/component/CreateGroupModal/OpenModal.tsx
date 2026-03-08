import { useState } from "react";
import styles from "./modal.module.scss";
import CreateGroupModal from "./CreateGroupModal";
import type { Group } from "./CreateGroupModal";
import { GroupCard } from "@/component/GroupCards/group-card.component";

const ExampleGroup = {
  groupName: "22-ИТ-1",
  curator: "Коноплева Галина Филипповна",
  numberStudents: 22
};

export default function GroupsPageCreate() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [groups, setGroups] = useState<Group[]>([ExampleGroup]);

  const handleCreateGroup = (newGroup: Group) => {
    setGroups([...groups, newGroup]);
    setIsOpen(false);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleOpenModal = () => {
    setIsOpen(true);
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
        onClose={handleCloseModal}
        onCreate={handleCreateGroup}
      />

      <img
        onClick={handleOpenModal}
        className={styles.AddBtn}
        src="./icons/Add_btn.svg"
        alt="Добавить группу"
      />
    </>
  );
}
