import { useState, useEffect } from "react";
import styles from "./modal.module.scss";
import pageStyles from "@/pages/groups/components/groups.module.scss";
import CreateGroupModal from "./CreateGroupModal";
import type { CreateGroupFormData, EditGroupData } from "./CreateGroupModal";
import { GroupCard } from "@/component/GroupCards/group-card.component";
import {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useUpdateGroupMutation
} from "@/pages/groups/group.api";
import { getSearchText, subscribeToSearch } from "@/app/store/searchStore";
import { useCanManageGroups } from "@/hooks/use-can-manage-groups";

export default function GroupsPageCreate() {
  const canManageGroups = useCanManageGroups();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedGroup, setSelectedGroup] = useState<EditGroupData | null>(
    null
  );
  const [search, setSearch] = useState(getSearchText());

  const { data: groups = [] } = useGetGroupsQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  const [createGroup] = useCreateGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();

  useEffect(() => {
    const unsubscribe = subscribeToSearch(setSearch);
    return unsubscribe;
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCuratorName = (group: (typeof groups)[number]) => {
    const parts = [group.lastName, group.firstName, group.surname].filter((p) =>
      p?.trim()
    );
    return parts.join(" ").trim();
  };

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

  // DELETE
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
      <div className={pageStyles.grid}>
        {filteredGroups.length === 0 ? (
          <p className={pageStyles.empty}>
            {search.trim()
              ? "Группы по вашему запросу не найдены"
              : "Пока нет групп — создайте первую"}
          </p>
        ) : (
          filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              groupId={group.id}
              groupName={group.name}
              curator={formatCuratorName(group)}
              numberStudents={group.countOfstudents}
              faculty={group.faculty}
              courseNumber={1}
              curatorEmail={group.curatorEmail}
              headStudentEmail={group.headStudentEmail}
              onEdit={openEditModal}
              onDelete={handleDeleteGroup}
              showStaffActions={canManageGroups}
            />
          ))
        )}
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

      {canManageGroups && (
        <img
          onClick={openCreateModal}
          className={styles.AddBtn}
          src="./icons/Add_btn.svg"
          alt="Добавить группу"
        />
      )}
    </>
  );
}
