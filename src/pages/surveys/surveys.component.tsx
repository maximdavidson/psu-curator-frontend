import { useState, useEffect } from "react";
import styles from "./surveys.module.scss";
import { SurveyCard } from "./components/survey-card/survey-card";
import {
  CreateSurveyModal,
  type CreateSurveyPayload
} from "./components/create-survey-modal/create-survey-modal";
import { useGetUserSurveysQuery, useCreateSurveyMutation } from "./survey.api";
import { getSearchText, subscribeToSearch } from "@/app/store/searchStore";

// Получаем userId из токена
const getUserIdFromToken = (): string => {
  const token = localStorage.getItem("token");
  if (!token) return "";

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId =
      payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"
      ];
    return userId || "";
  } catch (error) {
    console.error("Ошибка при декодировании токена:", error);
    return "";
  }
};

export const SurveysPage = () => {
  const userId = getUserIdFromToken();
  const [search, setSearch] = useState(getSearchText());

  const { data: surveys = [], refetch } = useGetUserSurveysQuery(userId, {
    skip: !userId
  });
  const [createSurvey] = useCreateSurveyMutation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToSearch(setSearch);
    return unsubscribe;
  }, []);

  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSurvey = async (data: CreateSurveyPayload) => {
    try {
      const requestData = {
        ...data,
        userId
      };

      await createSurvey(requestData).unwrap();
      refetch();
      setIsOpen(false);
    } catch (err) {
      console.error("Ошибка при создании опроса", err);
    }
  };

  const handleDelete = () => {
    refetch(); // обновляем список после удаления
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Опросы</h1>
        <button onClick={() => setIsOpen(true)}>Создать опрос</button>
      </div>

      <div className={styles.list}>
        {filteredSurveys.map((survey) => (
          <SurveyCard
            key={survey.id}
            survey={survey}
            onDeleted={handleDelete}
          />
        ))}
      </div>

      {isOpen && (
        <CreateSurveyModal
          onClose={() => setIsOpen(false)}
          onCreate={handleCreateSurvey}
        />
      )}
    </div>
  );
};
