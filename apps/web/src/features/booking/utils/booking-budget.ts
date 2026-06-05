export const BUDGET_MIN_VND = 500000;
export const BUDGET_STEP_VND = 100000;

export interface BudgetRangeValue {
    from: number;
    to: number;
}

export const formatVndAmount = (amount?: number | null) => {
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
        return "";
    }

    return new Intl.NumberFormat("vi-VN").format(amount);
};

export const formatBudgetRange = (
    budgetFrom?: number | null,
    budgetTo?: number | null,
) => {
    if (
        typeof budgetFrom !== "number" ||
        typeof budgetTo !== "number" ||
        !Number.isFinite(budgetFrom) ||
        !Number.isFinite(budgetTo)
    ) {
        return "Select budget";
    }

    return `${formatVndAmount(budgetFrom)} VND - ${formatVndAmount(budgetTo)} VND`;
};

export const serializeBudgetRange = (budgetFrom: number, budgetTo: number) => {
    return `${budgetFrom}-${budgetTo}`;
};

export const parseBudgetRangeValue = (
    value?: string | null,
): BudgetRangeValue | null => {
    if (!value) {
        return null;
    }

    const [fromValue, toValue] = value.split("-");
    const from = Number(fromValue);
    const to = Number(toValue);

    if (!Number.isFinite(from) || !Number.isFinite(to)) {
        return null;
    }

    return {
        from,
        to,
    };
};

export const normalizeBudgetToStep = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : BUDGET_MIN_VND;
    const clampedValue = Math.max(safeValue, BUDGET_MIN_VND);

    return Math.round(clampedValue / BUDGET_STEP_VND) * BUDGET_STEP_VND;
};
