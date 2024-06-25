type supportSystemType = "windows" | "mac" | "linux" | "other";

export const supportSystemChecker = (): supportSystemType => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("windows") !== -1) {
        return "windows";
    } else if (userAgent.indexOf("mac") !== -1) {
        return "mac";
    } else if (userAgent.indexOf("linux") !== -1) {
        return "linux";
    } else {
        return "other";
    }
};

type supportDeviceType = "mobile" | "desktop" | "tablet";
export const supportDeviceChecker = (): supportDeviceType => {
    if (window.innerWidth < 600) {
        return "mobile";
    } else if (window.innerWidth < 1280) {
        return "tablet";
    }
    return "desktop";
};
