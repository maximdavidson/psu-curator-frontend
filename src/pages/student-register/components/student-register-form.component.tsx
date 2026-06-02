import { useState } from "react";
import type { FormEvent } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  studentRegisterSchema,
  type TStudentRegisterFormDto
} from "@/shared/model/schemas/student-register.schema";
import {
  useCreateStudentUserMutation,
  type CreateStudentUserRequest
} from "@/services/user.api";
import { useGetGroupsQuery } from "@/pages/groups/group.api";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
import { StudentFundingType } from "@/shared/constants/student-funding";
import styles from "../student-register.module.scss";

export const StudentRegisterForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { data: groups = [] } = useGetGroupsQuery();
  const [createStudent, { isLoading }] = useCreateStudentUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TStudentRegisterFormDto>({
    resolver: yupResolver(
      studentRegisterSchema
    ) as Resolver<TStudentRegisterFormDto>,
    defaultValues: {
      firstName: "",
      lastName: "",
      surname: "",
      email: "",
      password: "",
      studentCardNumber: "",
      courseNumber: 1,
      enrollmentYear: new Date().getFullYear(),
      groupId: "",
      fundingType: StudentFundingType.Budget
    }
  });

  const onSubmit = async (data: TStudentRegisterFormDto) => {
    setError(null);
    setSuccess(null);

    const body: CreateStudentUserRequest = {
      email: data.email.trim(),
      password: data.password,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      surname: data.surname?.trim() || undefined,
      studentCardNumber: data.studentCardNumber.trim(),
      courseNumber: data.courseNumber,
      enrollmentYear: data.enrollmentYear,
      groupId: data.groupId || undefined,
      fundingType: data.fundingType
    };

    try {
      await createStudent(body).unwrap();
      setSuccess(
        body.groupId
          ? "Студент зарегистрирован и добавлен в выбранную группу."
          : "Студент зарегистрирован. Добавьте его в группу на вкладке «Участники»."
      );
      reset({
        firstName: "",
        lastName: "",
        surname: "",
        email: "",
        password: "",
        studentCardNumber: "",
        courseNumber: 1,
        enrollmentYear: new Date().getFullYear(),
        groupId: data.groupId ?? "",
        fundingType: StudentFundingType.Budget
      });
    } catch (err) {
      setError(
        readApiErrorMessage(err) ?? "Не удалось зарегистрировать студента."
      );
    }
  };

  return (
    <form
      className={styles.card}
      onSubmit={(event: FormEvent) => void handleSubmit(onSubmit)(event)}
    >
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Фамилия</span>
          <input {...register("lastName")} />
          {errors.lastName && (
            <small className={styles.error}>{errors.lastName.message}</small>
          )}
        </label>

        <label className={styles.field}>
          <span>Имя</span>
          <input {...register("firstName")} />
          {errors.firstName && (
            <small className={styles.error}>{errors.firstName.message}</small>
          )}
        </label>

        <label className={styles.field}>
          <span>Отчество</span>
          <input {...register("surname")} />
        </label>

        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            {...register("email")}
            placeholder="ivanov@students.psu.by"
          />
          {errors.email && (
            <small className={styles.error}>{errors.email.message}</small>
          )}
        </label>

        <label className={styles.field}>
          <span>Временный пароль</span>
          <input
            type="password"
            {...register("password")}
            autoComplete="new-password"
          />
          {errors.password && (
            <small className={styles.error}>{errors.password.message}</small>
          )}
        </label>

        <label className={styles.field}>
          <span>Номер студенческого</span>
          <input {...register("studentCardNumber")} />
          {errors.studentCardNumber && (
            <small className={styles.error}>
              {errors.studentCardNumber.message}
            </small>
          )}
        </label>

        <label className={styles.field}>
          <span>Курс</span>
          <input type="number" min={1} max={6} {...register("courseNumber")} />
          {errors.courseNumber && (
            <small className={styles.error}>
              {errors.courseNumber.message}
            </small>
          )}
        </label>

        <label className={styles.field}>
          <span>Год поступления</span>
          <input type="number" {...register("enrollmentYear")} />
        </label>

        <fieldset className={`${styles.fundingField} ${styles.fieldWide}`}>
          <legend>Форма обучения</legend>
          <div className={styles.fundingOptions}>
            <label className={styles.fundingOption}>
              <input
                type="radio"
                value={StudentFundingType.Budget}
                {...register("fundingType", { valueAsNumber: true })}
              />
              <span>Бюджет</span>
            </label>
            <label className={styles.fundingOption}>
              <input
                type="radio"
                value={StudentFundingType.Contract}
                {...register("fundingType", { valueAsNumber: true })}
              />
              <span>Платник</span>
            </label>
          </div>
          {errors.fundingType && (
            <small className={styles.error}>{errors.fundingType.message}</small>
          )}
        </fieldset>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>Группа (необязательно)</span>
          <select {...register("groupId")} defaultValue="">
            <option value="">Без привязки к группе</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className={styles.formError}>{error}</p>}
      {success && <p className={styles.formSuccess}>{success}</p>}

      <button type="submit" className={styles.submit} disabled={isLoading}>
        {isLoading ? "Сохранение…" : "Зарегистрировать студента"}
      </button>
    </form>
  );
};
