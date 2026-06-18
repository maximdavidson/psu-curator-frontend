import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./groups.module.scss";
import GroupsPageCreate from "@/component/CreateGroupModal/OpenModal";
import { useCurrentUserDisplayName } from "@/hooks/use-current-user";
import { useGetGroupCategoriesQuery } from "../groupCategory.api";

export const GroupsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const { data: categories = [] } = useGetGroupCategoriesQuery();
  const activeCategory = categories.find(
    (category) => category.id === categoryId
  );
  const { displayName, isLoading } = useCurrentUserDisplayName();

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      navigate(`/groups?categoryId=${categories[0].id}`, { replace: true });
    }
  }, [categoryId, categories, navigate]);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.greeting}>Добро пожаловать</p>
        <h1 className={styles.title}>
          {isLoading ? (
            <span className={styles.nameSkeleton} aria-hidden />
          ) : (
            displayName
          )}
        </h1>
        <p className={styles.subtitle}>
          {activeCategory ? activeCategory.name : "Группы"}
        </p>
      </header>
      <GroupsPageCreate />
    </div>
  );
};
