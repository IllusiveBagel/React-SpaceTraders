import styles from "./Pagination.module.css";

type PaginationProps = {
    page: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    isDisabled?: boolean;
};

const getPageRange = (current: number, totalPages: number) => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);

    pages.push(1);

    if (start > 2) {
        pages.push("ellipsis");
    }

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (end < totalPages - 1) {
        pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
};

const Pagination = ({
    page,
    total,
    limit,
    onPageChange,
    isDisabled = false,
}: PaginationProps) => {
    const totalPages = Math.max(1, Math.ceil(total / limit));

    if (totalPages <= 1) {
        return null;
    }

    const range = getPageRange(page, totalPages);

    return (
        <nav className={styles.pagination} aria-label="Pagination">
            <button
                type="button"
                className={styles.control}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={isDisabled || page === 1}
            >
                Previous
            </button>
            <div className={styles.pages}>
                {range.map((item, index) =>
                    item === "ellipsis" ? (
                        <span
                            key={`ellipsis-${index}`}
                            className={styles.ellipsis}
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            className={
                                item === page ? styles.pageActive : styles.page
                            }
                            onClick={() => onPageChange(item)}
                            disabled={isDisabled}
                        >
                            {item}
                        </button>
                    ),
                )}
            </div>
            <button
                type="button"
                className={styles.control}
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={isDisabled || page === totalPages}
            >
                Next
            </button>
            <span className={styles.summary}>
                Page {page} of {totalPages}
            </span>
        </nav>
    );
};

export default Pagination;
