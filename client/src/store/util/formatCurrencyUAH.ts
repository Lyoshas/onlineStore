// formatCurrencyUAH(4324) => "4 324 ₴"
// formatCurrencyUAH(55235) => "55 235 ₴"
// formatCurrencyUAH(43268723) => "43 268 723 ₴"
const formatCurrencyUAH = (monetaryValue: number) => {
    return (
        new Intl.NumberFormat('uk-UA', { useGrouping: true }).format(
            monetaryValue
        ) + ' ₴'
    );
};

export default formatCurrencyUAH;
