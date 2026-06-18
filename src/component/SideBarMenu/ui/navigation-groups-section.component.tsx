import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import HomeIcon from "@/assets/groups-icon.svg";
import styles from "../side-bar-menu.module.scss";
import {
  getRoleStringFromAccessToken,
  roleCanCreateGroupFeedItems
} from "@/shared/lib/jwt-claims";
import {
  useCreateGroupCategoryMutation,
  useDeleteGroupCategoryMutation,
  useGetGroupCategoriesQuery,
  type GroupCategory
} from "@/pages/groups/groupCategory.api";
import { groupApi } from "@/pages/groups/group.api";
import { CreateGroupCategoryModal } from "./create-group-category-modal.component";
import { DeleteGroupCategoryModal } from "./delete-group-category-modal.component";

interface Props {
  pathname: string;
  isCollapsed: boolean;
}

export const NavigationGroupsSection = ({ pathname, isCollapsed }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<GroupCategory | null>(null);

  const role = getRoleStringFromAccessToken(localStorage.getItem("token"));
  const canCreateCategory = roleCanCreateGroupFeedItems(role);
  const activeCategoryId = searchParams.get("categoryId");

  const { data: categories = [], isLoading } = useGetGroupCategoriesQuery();
  const [createCategory] = useCreateGroupCategoryMutation();
  const [deleteCategory] = useDeleteGroupCategoryMutation();

  const isGroupsRoute = pathname.startsWith("/groups");
  const isSectionActive = useMemo(() => isGroupsRoute, [isGroupsRoute]);

  const handleCreateCategory = async (data: {
    name: string;
    faculty?: string;
  }) => {
    await createCategory(data).unwrap();
  };

  const openCreateModal = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsModalOpen(true);
  };

  const openDeleteModal = (
    event: React.MouseEvent,
    category: GroupCategory
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setCategoryToDelete(category);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(categoryId).unwrap();
    dispatch(groupApi.util.invalidateTags([{ type: "Group", id: "LIST" }]));

    if (activeCategoryId === categoryId) {
      const remaining = categories.filter(
        (category) => category.id !== categoryId
      );
      if (remaining.length > 0) {
        navigate(`/groups?categoryId=${remaining[0].id}`, { replace: true });
      } else {
        navigate("/groups", { replace: true });
      }
    }
  };

  if (isCollapsed) {
    return (
      <li
        className={`${styles["sidebar-menu__navigation-item"]} ${
          isSectionActive ? styles["sidebar-menu__navigation-item--active"] : ""
        }`}
        title="Группы"
      >
        <button type="button" onClick={() => setIsExpanded((value) => !value)}>
          <img src={HomeIcon} alt="" />
        </button>
      </li>
    );
  }

  return (
    <>
      <li
        className={`${styles["sidebar-menu__navigation-item"]} ${
          styles["sidebar-menu__navigation-item--group-section"]
        } ${isSectionActive ? styles["sidebar-menu__navigation-item--active"] : ""}`}
      >
        <button
          type="button"
          className={styles["sidebar-menu__group-toggle"]}
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
        >
          <img src={HomeIcon} alt="" />
          <span className={styles["sidebar-menu__navigation-label"]}>
            Группы
          </span>

          {canCreateCategory && (
            <span
              className={styles["sidebar-menu__group-add"]}
              onClick={openCreateModal}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  openCreateModal(event as unknown as React.MouseEvent);
                }
              }}
              role="button"
              tabIndex={0}
              title="Создать раздел"
              aria-label="Создать раздел"
            >
              +
            </span>
          )}

          <span
            className={`${styles["sidebar-menu__group-chevron"]} ${
              isExpanded ? styles["sidebar-menu__group-chevron--open"] : ""
            }`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {isExpanded && (
          <ul className={styles["sidebar-menu__group-children"]}>
            {isLoading ? (
              <li className={styles["sidebar-menu__group-child-empty"]}>
                Загрузка…
              </li>
            ) : categories.length === 0 ? (
              <li className={styles["sidebar-menu__group-child-empty"]}>
                Разделов пока нет
              </li>
            ) : (
              categories.map((category) => {
                const isActive =
                  isGroupsRoute && activeCategoryId === category.id;

                return (
                  <li
                    key={category.id}
                    className={styles["sidebar-menu__group-child-row"]}
                  >
                    <Link
                      to={`/groups?categoryId=${category.id}`}
                      className={`${styles["sidebar-menu__group-child-link"]} ${
                        isActive
                          ? styles["sidebar-menu__group-child-link--active"]
                          : ""
                      }`}
                      title={category.name}
                    >
                      <span>{category.name}</span>
                      <span
                        className={styles["sidebar-menu__group-child-count"]}
                      >
                        {category.groupsCount}
                      </span>
                    </Link>

                    {category.canDelete && (
                      <button
                        type="button"
                        className={styles["sidebar-menu__group-child-delete"]}
                        onClick={(event) => openDeleteModal(event, category)}
                        title="Удалить раздел"
                        aria-label={`Удалить раздел ${category.name}`}
                      >
                        ×
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </li>

      <CreateGroupCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCategory}
      />

      <DeleteGroupCategoryModal
        category={categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
};
