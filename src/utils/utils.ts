import { EdtRoutesNameEnum } from "enumerations/EdtRoutesNameEnum";
import { OrchestratorContext } from "interface/lunatic/Lunatic";
import { Location } from "react-router-dom";
import { getCurrentSurveyRootPage } from "service/orchestrator-service";

function groupBy<T>(arr: T[], fn: (item: T) => any) {
    return arr.reduce<Record<string, T[]>>((prev, curr) => {
        const groupKey = fn(curr);
        const group = prev[groupKey] || [];
        group.push(curr);
        return { ...prev, [groupKey]: group };
    }, {});
}

function objectEquals(a: any, b: any) {
    for (let prop in a) {
        if (a != null && Object.prototype.hasOwnProperty.call(a, prop)) {
            if (b != null && Object.prototype.hasOwnProperty.call(b, prop)) {
                if (typeof a[prop] === "object") {
                    if (!objectEquals(a[prop], b[prop])) return false;
                } else {
                    if (a[prop] !== b[prop]) return false;
                }
            } else {
                return false;
            }
        }
    }
    return true;
}

function getSurveyIdFromUrl(context: OrchestratorContext, location: Location) {
    const pathSurveyRoot =
        getCurrentSurveyRootPage() == EdtRoutesNameEnum.ACTIVITY ? "activity/" : "work-time/";
    let idSurveyPath = location.pathname.split(pathSurveyRoot)[1]?.split("/")[0];
    let idSurvey = context?.idSurvey != idSurveyPath ? idSurveyPath : context?.idSurvey;
    return idSurvey;
}

function addItemToSession(idSurvey: string, item: any) {
    sessionStorage.setItem(idSurvey, JSON.stringify(item));
}

function getItemFromSession(idSurvey: string) {
    return JSON.parse(sessionStorage.getItem(idSurvey ?? "") ?? "{}");
}

function addArrayToSession(nameItem: string, array: any[]) {
    let copyArray = "";
    array.forEach(item => {
        if (copyArray != "") copyArray += ";;";
        copyArray += JSON.stringify(item);
    });
    let arrayToString = copyArray.toString();
    sessionStorage.setItem(nameItem, arrayToString);
}

function getArrayFromSession(nameItem: string): any[] {
    let stringArray = sessionStorage.getItem(nameItem);
    if (stringArray) {
        let copyArrayString = stringArray.split(";;");
        let array = copyArrayString.map(c => JSON.parse(c ?? "{}"));
        return array;
    } else return [];
}

function getUniquesValues(listValues: any[]): any[] {
    return listValues.filter((value, index, self) => self.indexOf(value) === index);
}

import {
    isAndroid,
    isChrome,
    isDesktop,
    isEdge,
    isFirefox,
    isIOS,
    isMacOs,
    isSafari,
} from "react-device-detect";

const getDevice = () => {
    if (isIOS || isMacOs) {
        return "ios";
    } else if (isAndroid || isDesktop) {
        return "android";
    } else return "";
};

const getNavigator = () => {
    if (isChrome) {
        return "chrome";
    } else if (isEdge) {
        return "edge";
    } else if (isFirefox) {
        return "firefox";
    } else if (isSafari) {
        return "safari";
    } else return "";
};

const getDeviceNavigatorIsAvaiableForInstall = () => {
    const device = getDevice();
    const navigator = getNavigator();

    if (device == "ios" && ["chrome", "edge", "safari"].includes(navigator)) {
        return true;
    } else if (device == "android" && ["chrome", "edge", "firefox"].includes(navigator)) {
        return true;
    } else {
        return null;
    }
};

function getCookie(name: string): string | null {
    const nameLenPlus = name.length + 1;
    return (
        document.cookie
            .split(";")
            .map(c => c.trim())
            .filter(cookie => {
                return cookie.substring(0, nameLenPlus) === `${name}=`;
            })
            .map(cookie => {
                return decodeURIComponent(cookie.substring(nameLenPlus));
            })[0] || null
    );
}

export {
    addArrayToSession,
    addItemToSession,
    getArrayFromSession,
    getCookie,
    getDevice,
    getDeviceNavigatorIsAvaiableForInstall,
    getItemFromSession,
    getNavigator,
    getSurveyIdFromUrl,
    getUniquesValues,
    groupBy,
    objectEquals,
};
