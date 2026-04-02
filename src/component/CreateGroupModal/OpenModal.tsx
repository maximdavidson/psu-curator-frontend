import { useState } from "react";
import styles from "./modal.module.scss";
import CreateGroupModal from "./CreateGroupModal";
import type { CreateGroupFormData } from "./CreateGroupModal";
import { GroupCard } from "@/component/GroupCards/group-card.component";
import {
  useGetGroupsQuery,
  useCreateGroupMutation
} from "@/pages/groups/group.api";

export default function GroupsPageCreate() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: groups = [] } = useGetGroupsQuery();
  const [createGroup] = useCreateGroupMutation();

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    try {
      const payload = {
        name: data.groupName,
        faculty: data.faculty,
        courseNumber: data.courseNumber,
        curatorEmail: data.curatorEmail,
        ...(data.headStudentEmail &&
          data.headStudentEmail.trim() !== "" && {
            headStudentEmail: data.headStudentEmail
          })
      };

      console.log("Отправляемые данные:", payload);

      await createGroup(payload).unwrap();

      // ❌ refetch НЕ нужен — RTK Query сам обновит
      setIsOpen(false);
    } catch (err) {
      console.error("Ошибка при создании группы:", err);
      if (err && typeof err === "object" && "data" in err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.error("Детали ошибки:", (err as any).data);
      }
    }
  };

  return (
    <>
      <div className={styles.GroupCard}>
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            groupId={group.id}
            groupName={group.name}
            curator={`${group.firstName} ${group.lastName}`}
            numberStudents={group.countOfstudents}
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
