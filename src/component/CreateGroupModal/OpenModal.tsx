import { useState } from "react";
import styles from "./modal.module.scss";
import CreateGroupModal from "./CreateGroupModal";
import type { CreateGroupFormData, EditGroupData } from "./CreateGroupModal";

import { GroupCard } from "@/component/GroupCards/group-card.component";
import {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useUpdateGroupMutation
} from "@/pages/groups/group.api";

export default function GroupsPageCreate() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedGroup, setSelectedGroup] = useState<EditGroupData | null>(
    null
  );

  const { data: groups = [] } = useGetGroupsQuery();
  const [createGroup] = useCreateGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();

  // CREATE
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

      await createGroup(payload).unwrap();
      setIsOpen(false);
    } catch (err) {
      console.error("Ошибка при создании группы:", err);
    }
  };

  // UPDATE
  const handleUpdateGroup = async (data: EditGroupData) => {
    try {
      await updateGroup({
        id: data.id,
        name: data.name,
        faculty: data.faculty,
        courseNumber: data.courseNumber,
        curatorEmail: data.curatorEmail!,
        headEmail: data.headStudentEmail
      }).unwrap();

      setIsOpen(false);
      setSelectedGroup(null);
    } catch (err) {
      console.error("Ошибка при обновлении группы:", err);
    }
  };

  // DELETE (ВАЖНО: теперь это единственная точка удаления)
  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId).unwrap();
    } catch (err) {
      console.error("Ошибка при удалении группы:", err);
    }
  };

  // OPEN CREATE
  const openCreateModal = () => {
    setMode("create");
    setSelectedGroup(null);
    setIsOpen(true);
  };

  // OPEN EDIT
  const openEditModal = (group: EditGroupData) => {
    setMode("edit");
    setSelectedGroup(group);
    setIsOpen(true);
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
            faculty={group.faculty}
            courseNumber={1}
            curatorEmail={group.curatorEmail}
            headStudentEmail={group.headStudentEmail}
            onEdit={openEditModal}
            onDelete={handleDeleteGroup}
          />
        ))}
      </div>

      <CreateGroupModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelectedGroup(null);
        }}
        onCreate={handleCreateGroup}
        onUpdate={handleUpdateGroup}
        mode={mode}
        initialData={selectedGroup}
      />

      <img
        onClick={openCreateModal}
        className={styles.AddBtn}
        src="./icons/Add_btn.svg"
        alt="Добавить группу"
      />
    </>
  );
}
