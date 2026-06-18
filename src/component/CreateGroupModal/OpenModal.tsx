import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./modal.module.scss";
import pageStyles from "@/pages/groups/components/groups.module.scss";
import CreateGroupModal from "./CreateGroupModal";
import type { CreateGroupFormData, EditGroupData } from "./CreateGroupModal";
import { GroupCard } from "@/component/GroupCards/group-card.component";
import {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useUpdateGroupMutation,
  type CreateGroupRequest
} from "@/pages/groups/group.api";
import { useGetGroupCategoriesQuery } from "@/pages/groups/groupCategory.api";
import { getSearchText, subscribeToSearch } from "@/app/store/searchStore";
import { useCanManageGroups } from "@/hooks/use-can-manage-groups";

export default function GroupsPageCreate() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const canManageGroups = useCanManageGroups();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedGroup, setSelectedGroup] = useState<EditGroupData | null>(
    null
  );
  const [search, setSearch] = useState(getSearchText());
  const { data: categories = [] } = useGetGroupCategoriesQuery();
  const { data: groups = [], isLoading } = useGetGroupsQuery(categoryId, {
    refetchOnMountOrArgChange: true,
    skip: !categoryId
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
  const activeCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId]
  );
  const formatCuratorName = (group: (typeof groups)[number]) => {
    const parts = [group.lastName, group.firstName, group.surname].filter((p) =>
      p?.trim()
    );
    return parts.join(" ").trim();
  };
  const handleCreateGroup = async (data: CreateGroupFormData) => {
    try {
      const payload: CreateGroupRequest = {
        name: data.groupName,
        faculty: data.faculty,
        courseNumber: data.courseNumber,
        ...(categoryId && { categoryId }),
        ...(data.department && { department: data.department }),
        ...(data.curatorEmail && { curatorEmail: data.curatorEmail }),
        ...(data.headStudentEmail && {
          headStudentEmail: data.headStudentEmail
        })
      };
      await createGroup(payload).unwrap();
      setIsOpen(false);
    } catch (err) {
      console.error("Ошибка при создании группы:", err);
      throw err;
    }
  };
  const handleUpdateGroup = async (data: EditGroupData) => {
    try {
      await updateGroup({
        id: data.id,
        name: data.name,
        faculty: data.faculty,
        department: data.department,
        courseNumber: data.courseNumber,
        curatorEmail: data.curatorEmail ?? "",
        headEmail: data.headStudentEmail ?? ""
      }).unwrap();
      setIsOpen(false);
      setSelectedGroup(null);
    } catch (err) {
      console.error("Ошибка при обновлении группы:", err);
      throw err;
    }
  };
  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId).unwrap();
    } catch (err) {
      console.error("Ошибка при удалении группы:", err);
    }
  };
  const openCreateModal = () => {
    setMode("create");
    setSelectedGroup(null);
    setIsOpen(true);
  };
  const openEditModal = (group: EditGroupData) => {
    setMode("edit");
    setSelectedGroup(group);
    setIsOpen(true);
  };
  return (
    <>
      {!categoryId ? (
        <p className={pageStyles.empty}>
          Выберите раздел групп в меню слева или создайте новый раздел кнопкой
          «+».
        </p>
      ) : (
        <div className={pageStyles.grid}>
          {isLoading ? (
            <p className={pageStyles.empty}>Загрузка групп…</p>
          ) : filteredGroups.length === 0 ? (
            <p className={pageStyles.empty}>
              {search.trim()
                ? "Группы по вашему запросу не найдены"
                : `В разделе «${activeCategory?.name ?? "выбранный"}» пока нет групп`}
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
                department={group.department ?? undefined}
                courseNumber={group.courseNumber}
                curatorEmail={group.curatorEmail ?? ""}
                headStudentEmail={group.headStudentEmail ?? undefined}
                onEdit={openEditModal}
                onDelete={handleDeleteGroup}
                showStaffActions={canManageGroups}
              />
            ))
          )}
        </div>
      )}

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

      {canManageGroups && categoryId && (
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
