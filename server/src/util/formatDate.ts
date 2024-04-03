// Examples:
// formatDate(new Date(2024, 3, 3, 9, 6, 5), 'dd.mm.yyyy') => "03.04.2024"
// formatDate(new Date(2024, 3, 3, 9, 6, 5), 'dd.mm.yyyy hh:mm') => "03.04.2024 09:06"
const formatDate = (date: Date, format: 'dd.mm.yyyy' | 'dd.mm.yyyy hh:mm') => {
    const formattedDate = new Intl.DateTimeFormat('uk-UA').format(date);

    if (format === 'dd.mm.yyyy') return formattedDate;

    let hours: string | number = date.getHours();
    hours = hours < 10 ? '0' + hours : hours;
    let minutes: string | number = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${formattedDate} ${hours}:${minutes}`;
};

export default formatDate;
