export const formatCompactNumber = (number: number) => {
        return Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 2,
        }).format(number);
    };