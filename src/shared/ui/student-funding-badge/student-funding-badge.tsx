import {
  getStudentFundingLabel,
  StudentFundingType,
  type StudentFundingTypeValue
} from "@/shared/constants/student-funding";
import styles from "./student-funding-badge.module.scss";

interface StudentFundingBadgeProps {
  fundingType?: StudentFundingTypeValue | number | null;
}

export const StudentFundingBadge = ({
  fundingType
}: StudentFundingBadgeProps) => {
  const label = getStudentFundingLabel(fundingType);
  if (label === null) {
    return null;
  }

  const isContract = fundingType === StudentFundingType.Contract;

  return (
    <span
      className={`${styles.badge} ${isContract ? styles.contract : styles.budget}`}
    >
      {label}
    </span>
  );
};
