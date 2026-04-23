import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./table-pagination.module.css";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function TablePagination({ page, totalPages, onPageChange }: Props) {
  return (
    <div className={styles.wrap}>
      <span className={styles.info}>Page {page} of {totalPages.toLocaleString()}</span>
      <div className={styles.btns}>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <button
          className={styles.btnPrimary}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
