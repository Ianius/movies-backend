export const elapsedInHours = (from: Date, to: Date) => {
    const seconds = (to.getTime() - from.getTime()) / 1000;
    return Math.round(seconds / (60 * 60));
};
