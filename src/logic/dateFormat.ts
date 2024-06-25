type separatorOption = {
    date?: string;
    time?: string;
    dateAndTime?: string;
};

export const japaneseDateFormat = (
    date: Date = new Date(),
    separator?: separatorOption,
) => {
    const dateSeparator = separator?.date || "/";
    const timeSeparator = separator?.time || ":";
    const dateAndTimeSeparator = separator?.dateAndTime || " ";
    // 2021/1/1 0:0:0
    return `${date.getFullYear()}${dateSeparator}${
        date.getMonth() + 1
    }${dateSeparator}${date.getDate()}${dateAndTimeSeparator}${date.getHours()}${timeSeparator}${date.getMinutes()}${timeSeparator}${date.getSeconds()}`;
};
