import {
    AutoCompleteActiviteOption,
    CheckboxOneCustomOption,
    generateDateFromStringInput,
    getFrenchDayFromDate,
} from "@inseefrlab/lunatic-edt";
import { EdtRoutesNameEnum } from "enumerations/EdtRoutesNameEnum";
import { EdtUserRightsEnum } from "enumerations/EdtUserRightsEnum";
import { ErrorCodeEnum } from "enumerations/ErrorCodeEnum";
import { FieldNameEnum } from "enumerations/FieldNameEnum";
import { LocalStorageVariableEnum } from "enumerations/LocalStorageVariableEnum";
import { ReferentielsEnum } from "enumerations/ReferentielsEnum";
import { SourcesEnum } from "enumerations/SourcesEnum";
import { StateDataStateEnum } from "enumerations/StateDataStateEnum";
import { SurveysIdsEnum } from "enumerations/SurveysIdsEnum";
import { t } from "i18next";
import { TabData } from "interface/component/Component";
import { StateData, SurveyData, UserSurveys } from "interface/entity/Api";
import {
    Collected,
    LunaticData,
    LunaticModel,
    LunaticModelComponent,
    LunaticModelVariable,
    REFERENTIELS_ID,
    ReferentielData,
    SOURCES_MODELS,
    SURVEYS_IDS,
    SourceData,
    SurveysIds,
} from "interface/lunatic/Lunatic";
import { lunaticDatabase } from "service/lunatic-database";
import { LABEL_WORK_TIME_SURVEY, getCurrentPageSource } from "service/orchestrator-service";
import {
    fetchReferentiels,
    fetchSurveysSourcesByIds,
    fetchUserSurveysInfo,
    remoteGetSurveyData,
    remotePutSurveyData,
} from "./api-service";
import { getFlatLocalStorageValue } from "./local-storage-service";
import { getScore } from "./survey-activity-service";
import { getUserRights } from "./user-service";

const datas = new Map<string, LunaticData>();
const oldDatas = new Map<string, LunaticData>();

const NUM_MAX_ACTIVITY_SURVEYS = process.env.REACT_APP_NUM_ACTIVITY_SURVEYS ?? 6;
const NUM_MAX_WORKTIME_SURVEYS = process.env.REACT_APP_NUM_WORKTIME_SURVEYS ?? 2;

let referentielsData: ReferentielData;
let sourcesData: SourceData;
let surveysIds: SurveysIds;
let userDatasActivity: UserSurveys[] = [];
let userDatasWorkTime: UserSurveys[] = [];
let userDatas: UserSurveys[] = [];

const toIgnoreForRoute = [
    FieldNameEnum.PLACE,
    FieldNameEnum.MAINACTIVITY_ID,
    FieldNameEnum.MAINACTIVITY_SUGGESTERID,
    FieldNameEnum.MAINACTIVITY_LABEL,
    FieldNameEnum.MAINACTIVITY_ISFULLYCOMPLETED,
    FieldNameEnum.INPUT_SUGGESTER,
    FieldNameEnum.ACTIVITY_SELECTER_HISTORY,
    FieldNameEnum.GOAL,
];

const toIgnoreForActivity = [
    FieldNameEnum.GOAL,
    FieldNameEnum.ROUTE,
    FieldNameEnum.MEANOFTRANSPORT,
    FieldNameEnum.MAINACTIVITY_ISFULLYCOMPLETED,
];

const initializeDatas = (setError: (error: ErrorCodeEnum) => void): Promise<boolean> => {
    const promisesToWait: Promise<any>[] = [];
    return new Promise(resolve => {
        promisesToWait.push(initializeRefs(setError));
        if (getUserRights() === EdtUserRightsEnum.REVIEWER) {
            promisesToWait.push(initializeSurveysIdsAndSourcesDemo(setError));
        } else {
            promisesToWait.push(initializeSurveysIdsAndSources(setError));
        }
        Promise.all(promisesToWait).then(() => {
            resolve(true);
        });
    });
};

const initializeRefs = (setError: (error: ErrorCodeEnum) => void) => {
    return lunaticDatabase.get(REFERENTIELS_ID).then(refData => {
        if (!refData) {
            return fetchReferentiels(setError).then(refs => {
                saveReferentiels(refs);
            });
        } else {
            referentielsData = refData as ReferentielData;
        }
    });
};

const initializeSurveysIdsAndSources = (setError: (error: ErrorCodeEnum) => void): Promise<any> => {
    const promises: Promise<any>[] = [];
    return lunaticDatabase.get(SURVEYS_IDS).then(data => {
        if (!data) {
            promises.push(
                fetchUserSurveysInfo(setError).then(userSurveyData => {
                    const distinctSources = Array.from(
                        new Set(userSurveyData.map(surveyData => surveyData.questionnaireModelId)),
                    );
                    let activitySurveysIds: string[] = [];
                    let userSurveyDataActivity: UserSurveys[] = [];
                    let workingTimeSurveysIds: string[] = [];
                    let userSurveyDataWorkTime: UserSurveys[] = [];
                    userSurveyData.forEach(surveyData => {
                        if (surveyData.questionnaireModelId === SourcesEnum.ACTIVITY_SURVEY) {
                            activitySurveysIds.push(surveyData.surveyUnitId);
                            userSurveyDataActivity.push(surveyData);
                            userDatas.push(surveyData);
                        }
                        if (surveyData.questionnaireModelId === SourcesEnum.WORK_TIME_SURVEY) {
                            workingTimeSurveysIds.push(surveyData.surveyUnitId);
                            userSurveyDataWorkTime.push(surveyData);
                            userDatas.push(surveyData);
                        }
                    });
                    userDatasActivity = userSurveyDataActivity;
                    userDatasWorkTime = userSurveyDataWorkTime;

                    let allSurveysIds = [...activitySurveysIds, ...workingTimeSurveysIds];
                    const surveysIds: SurveysIds = {
                        [SurveysIdsEnum.ALL_SURVEYS_IDS]: allSurveysIds,
                        [SurveysIdsEnum.ACTIVITY_SURVEYS_IDS]: activitySurveysIds,
                        [SurveysIdsEnum.WORK_TIME_SURVEYS_IDS]: workingTimeSurveysIds,
                    };

                    const innerPromises: Promise<any>[] = [
                        getRemoteSavedSurveysDatas(allSurveysIds, setError).then(() => {
                            return initializeSurveysDatasCache();
                        }),
                        saveSurveysIds(surveysIds),
                        fetchSurveysSourcesByIds(distinctSources, setError).then(sources => {
                            saveSources(sources);
                        }),
                    ];

                    return Promise.all(innerPromises);
                }),
            );
        } else {
            surveysIds = data as SurveysIds;
            promises.push(
                lunaticDatabase.get(SOURCES_MODELS).then(data => {
                    if (sourcesData == undefined) {
                        sourcesData = data as SourceData;
                    }
                }),
            );
            promises.push(
                getRemoteSavedSurveysDatas(surveysIds[SurveysIdsEnum.ALL_SURVEYS_IDS], setError).then(
                    () => {
                        return initializeSurveysDatasCache();
                    },
                ),
            );
        }
        return Promise.all(promises);
    });
};

const initializeSurveysIdsAndSourcesDemo = (setError: (error: ErrorCodeEnum) => void): Promise<any> => {
    let activitySurveysIds: string[] = [];
    userDatasActivity = [];
    let numInterviewer = 0;
    for (let i = 1; i <= Number(NUM_MAX_ACTIVITY_SURVEYS); i++) {
        if (i % 2 != 0) {
            numInterviewer += 1;
        }
        const userSurvey: UserSurveys = {
            interviewerId: "interviewer" + numInterviewer,
            surveyUnitId: "activitySurvey" + i,
            questionnaireModelId: SourcesEnum.ACTIVITY_SURVEY,
            campaignId: "",
            id: i,
            reviewerId: "",
        };
        activitySurveysIds.push("activitySurvey" + i);
        userDatasActivity.push(userSurvey);
        userDatas.push(userSurvey);
    }
    numInterviewer = 0;
    let workingTimeSurveysIds: string[] = [];
    userDatasWorkTime = [];

    for (let i = 1; i <= Number(NUM_MAX_WORKTIME_SURVEYS); i++) {
        const userSurvey: UserSurveys = {
            interviewerId: "interviewer" + i,
            surveyUnitId: "workTimeSurvey" + i,
            questionnaireModelId: SourcesEnum.WORK_TIME_SURVEY,
            campaignId: "",
            id: i,
            reviewerId: "",
        };
        workingTimeSurveysIds.push("workTimeSurvey" + i);
        userDatasWorkTime.push(userSurvey);
        userDatas.push(userSurvey);
    }

    let distinctSources = [SourcesEnum.ACTIVITY_SURVEY, SourcesEnum.WORK_TIME_SURVEY];
    let allSurveysIds = [...activitySurveysIds, ...workingTimeSurveysIds];
    const surveysIds: SurveysIds = {
        [SurveysIdsEnum.ALL_SURVEYS_IDS]: allSurveysIds,
        [SurveysIdsEnum.ACTIVITY_SURVEYS_IDS]: activitySurveysIds,
        [SurveysIdsEnum.WORK_TIME_SURVEYS_IDS]: workingTimeSurveysIds,
    };

    const innerPromises: Promise<any>[] = [
        saveSurveysIds(surveysIds),
        initializeSurveysDatasCache(),
        fetchSurveysSourcesByIds(distinctSources, setError).then(sources => {
            saveSources(sources);
        }),
    ];
    return Promise.all(innerPromises);
};

const getRemoteSavedSurveysDatas = (
    surveysIds: string[],
    setError: (error: ErrorCodeEnum) => void,
): Promise<any> => {
    const promises: Promise<any>[] = [];
    surveysIds.forEach(surveyId => {
        promises.push(
            remoteGetSurveyData(surveyId, setError).then((remoteSurveyData: SurveyData) => {
                const regexp = new RegExp(
                    process.env.REACT_APP_HOUSE_REFERENCE_REGULAR_EXPRESSION || "",
                );
                remoteSurveyData.data.houseReference = surveyId.replace(regexp, "");
                return lunaticDatabase.get(surveyId).then(localSurveyData => {
                    if (
                        remoteSurveyData.stateData?.date &&
                        remoteSurveyData.stateData?.date > 0 &&
                        (localSurveyData === undefined ||
                            (localSurveyData.lastLocalSaveDate ?? 0) < remoteSurveyData.stateData.date)
                    ) {
                        return lunaticDatabase.save(surveyId, remoteSurveyData.data);
                    }
                });
            }),
        );
    });
    return Promise.all(promises);
};

const initializeSurveysDatasCache = (): Promise<any> => {
    const promises: Promise<any>[] = [];
    return lunaticDatabase.get(SURVEYS_IDS).then(data => {
        surveysIds = data as SurveysIds;
        for (const idSurvey of surveysIds[SurveysIdsEnum.ALL_SURVEYS_IDS]) {
            promises.push(
                lunaticDatabase.get(idSurvey).then(data => {
                    if (data != null) {
                        const regexp = new RegExp(
                            process.env.REACT_APP_HOUSE_REFERENCE_REGULAR_EXPRESSION || "",
                        );
                        data.houseReference = idSurvey.replace(regexp, "");
                        datas.set(idSurvey, data || {});
                        oldDatas.set(idSurvey, data || {});
                    }
                    return data;
                }),
            );
        }
        return Promise.all(promises);
    });
};

const getDatas = (): Map<string, LunaticData> => {
    return datas;
};

const getData = (idSurvey: string): LunaticData => {
    return datas.get(idSurvey) || {};
};

const dataIsChange = (idSurvey: string, data: LunaticData) => {
    const currentData = oldDatas.get(idSurvey);
    const currentDataCollected = currentData && currentData.COLLECTED;
    const dataCollected = data && data.COLLECTED;

    let isChange = false;

    if (dataCollected && currentDataCollected) {
        const keys = Object.keys(dataCollected);
        keys?.forEach(key => {
            if (dataCollected[key].COLLECTED != currentDataCollected[key].COLLECTED) {
                if (Array.isArray(dataCollected[key].COLLECTED)) {
                    const currentDataCollectedArray = currentDataCollected[key].COLLECTED as string[];
                    const dataCollectedArray = dataCollected[key].COLLECTED as string[];
                    dataCollectedArray?.forEach((data, i) => {
                        if (currentDataCollectedArray == null || currentDataCollectedArray[i] != data) {
                            isChange = true;
                        }
                    });
                    if (dataCollectedArray.length != currentDataCollectedArray.length) {
                        isChange = true;
                    }
                } else {
                    isChange = true;
                }
            }
        });
    }
    return isChange;
};

const saveData = (
    idSurvey: string,
    data: LunaticData,
    localSaveOnly = false,
    sendRequest?: boolean,
): Promise<LunaticData> => {
    data.lastLocalSaveDate = Date.now();
    if (!data.houseReference) {
        const regexp = new RegExp(process.env.REACT_APP_HOUSE_REFERENCE_REGULAR_EXPRESSION || "");
        data.houseReference = idSurvey.replace(regexp, "");
    }
    const isDemoMode = getFlatLocalStorageValue(LocalStorageVariableEnum.IS_DEMO_MODE) === "true";
    const isChange = dataIsChange(idSurvey, data) || sendRequest;
    return lunaticDatabase.save(idSurvey, data).then(() => {
        datas.set(idSurvey, data);
        if (isChange) {
            //We try to submit each time the local database is updated if the user is online
            if (!isDemoMode && !localSaveOnly && navigator.onLine) {
                const surveyData: SurveyData = {
                    stateData: getSurveyStateData(data, idSurvey),
                    data: data,
                };
                remotePutSurveyData(idSurvey, surveyData)
                    .then(surveyData => {
                        data.lastRemoteSaveDate = surveyData.stateData?.date;
                        //set the last remote save date inside local database to be able to compare it later with remote data
                        lunaticDatabase.save(idSurvey, data).then(() => {
                            datas.set(idSurvey, data);
                            oldDatas.set(idSurvey, data);
                        });
                    })
                    .catch(() => {
                        //We ignore the error because user is stuck on EndSurveyPage if he couldn't submit in any moment his survey.
                    });
            }
        }
        return data;
    });
};

const getSurveyStateData = (data: LunaticData, idSurvey: string): StateData => {
    const isSent = getValue(idSurvey, FieldNameEnum.ISENVOYED) as boolean;
    const stateData: StateData = {
        state: isSent ? StateDataStateEnum.VALIDATED : StateDataStateEnum.INIT,
        date: Date.now(),
        currentPage: getCurrentPage(data),
    };
    return stateData;
};

const saveReferentiels = (data: ReferentielData): Promise<ReferentielData> => {
    return lunaticDatabase.save(REFERENTIELS_ID, data).then(() => {
        referentielsData = data;
        return data;
    });
};

const saveSources = (data: SourceData): Promise<SourceData> => {
    return lunaticDatabase.save(SOURCES_MODELS, data).then(() => {
        if (sourcesData == undefined) {
            sourcesData = data;
        }
        return data;
    });
};

const saveSurveysIds = (data: SurveysIds): Promise<SurveysIds> => {
    return lunaticDatabase.save(SURVEYS_IDS, data).then(() => {
        surveysIds = data;
        return data;
    });
};

const getUserDatasActivity = () => {
    return userDatasActivity;
};

const getUserDatasWorkTime = () => {
    return userDatasWorkTime;
};

const addToSecondaryActivityReferentiel = (
    referentiel: ReferentielsEnum.ACTIVITYSECONDARYACTIVITY | ReferentielsEnum.ROUTESECONDARYACTIVITY,
    newItem: CheckboxOneCustomOption,
) => {
    lunaticDatabase.get(REFERENTIELS_ID).then((currentData: any) => {
        currentData[referentiel].push(newItem);
        saveReferentiels(currentData);
    });
};

const addToAutocompleteActivityReferentiel = (newItem: AutoCompleteActiviteOption) => {
    lunaticDatabase.get(REFERENTIELS_ID).then((currentData: any) => {
        currentData[ReferentielsEnum.ACTIVITYAUTOCOMPLETE].push(newItem);
        saveReferentiels(currentData);
    });
};

const getReferentiel = (refName: ReferentielsEnum) => {
    return referentielsData[refName];
};

const getSource = (refName: SourcesEnum) => {
    return sourcesData && sourcesData[refName];
};

const getVariable = (source: LunaticModel, dependency: string): LunaticModelVariable | undefined => {
    return source.variables.find(v => v.variableType === "COLLECTED" && v.name === dependency);
};

//Return the last lunatic model page that has been fill with data
const getCurrentPage = (data: LunaticData | undefined, source?: LunaticModel): number => {
    if (data == null || !source?.components) {
        return -1;
    }
    const components = (source ?? getCurrentPageSource())?.components;
    let currentPage = 0;
    let notFilled = false;
    let i = 0;

    while (!notFilled && i < components.length) {
        const component = components[i];
        if (component.componentType != "Loop")
            notFilled = haveVariableNotFilled(component, source, data);
        if (notFilled) currentPage = Number(component.page ?? 0);
        i++;
    }
    if (currentPage == 0) {
        const firstName = data.COLLECTED?.[FieldNameEnum.FIRSTNAME].COLLECTED;
        if (firstName) currentPage = Number(components[components.length - 2].page);
        if (source.label == LABEL_WORK_TIME_SURVEY) currentPage = 3;
    }
    return currentPage;
};

const haveVariableNotFilled = (
    component: LunaticModelComponent | undefined,
    source: LunaticModel,
    data: LunaticData | undefined,
) => {
    const variables = component?.bindingDependencies;
    if (variables == null || variables.length == 0) return false;
    let filled = false;

    variables.forEach(v => {
        const variable = getVariable(source, v);
        if (variable) {
            const value = data?.COLLECTED?.[variable.name]?.COLLECTED;
            if (value != null && !Array.isArray(value)) {
                filled = false;
            } else if (Array.isArray(value)) {
                const arrayWeeklyPlanner = value as { [key: string]: string }[];
                filled = arrayWeeklyPlanner.find((val: any) => val != null) == null;
            } else filled = true;
        }
    });
    return filled;
};

const getComponentId = (variableName: FieldNameEnum, source: LunaticModel) => {
    return source?.variables.find(variable => variable.name === variableName)?.componentRef;
};

const getComponentsOfVariable = (
    variableName: FieldNameEnum,
    source: LunaticModel,
): LunaticModelComponent[] => {
    return source?.components.filter(
        component => component.response && component.response["name"] == variableName,
    );
};

const getValue = (idSurvey: string, variableName: FieldNameEnum, iteration?: number) => {
    if (iteration != null) {
        let value = datas.get(idSurvey)?.COLLECTED?.[variableName]?.COLLECTED;
        return Array.isArray(value) ? value[iteration] : null;
    } else {
        return datas.get(idSurvey)?.COLLECTED?.[variableName]?.COLLECTED;
    }
};

const setValue = (
    idSurvey: string,
    variableName: FieldNameEnum,
    value: string | boolean | null,
    iteration?: number,
) => {
    const dataAct = datas.get(idSurvey);
    if (dataAct && dataAct.COLLECTED && dataAct.COLLECTED[variableName]) {
        if (iteration != null && value != null) {
            const dataAsArray = dataAct.COLLECTED[variableName].COLLECTED;
            if (dataAsArray && Array.isArray(dataAsArray)) {
                dataAsArray[iteration] = value;
            }
        } else {
            const variable: Collected = {
                COLLECTED: value,
                EDITED: null,
                FORCED: null,
                INPUTED: null,
                PREVIOUS: null,
            };
            dataAct.COLLECTED[variableName] = variable;
        }
    }
    datas.set(idSurvey, dataAct || {});
    return dataAct;
};

const getLastName = (idSurvey: string) => {
    return getValue(idSurvey, FieldNameEnum.LASTNAME)?.toString();
};

const getFirstName = (idSurvey: string) => {
    return getValue(idSurvey, FieldNameEnum.FIRSTNAME)?.toString();
};

const getSurveyDate = (idSurvey: string) => {
    return getValue(idSurvey, FieldNameEnum.SURVEYDATE)?.toString();
};

// return survey firstname if exist or default value
const getPrintedFirstName = (idSurvey: string): string => {
    return getFirstName(idSurvey) || t("common.user.person") + " " + getPersonNumber(idSurvey);
};

const getIdSurveyActivity = (interviewer: string, numActivity: number): string => {
    return getUserDatasActivity().filter(data => data.interviewerId == interviewer)[numActivity]
        ?.surveyUnitId;
};

const getIdSurveyWorkTime = (interviewer: string) => {
    return getUserDatasWorkTime().filter(data => data.interviewerId == interviewer)[0]?.surveyUnitId;
};

const createTabData = (idSurvey: string, t: any, isActivitySurvey: boolean) => {
    let tabData: TabData = {
        idSurvey: idSurvey,
        surveyDateLabel: getPrintedSurveyDate(
            idSurvey,
            isActivitySurvey ? EdtRoutesNameEnum.ACTIVITY : EdtRoutesNameEnum.WORK_TIME,
        ),
        firstNameLabel: getPrintedFirstName(idSurvey),
        score: getScore(idSurvey, t),
        isActivitySurvey: isActivitySurvey,
    };
    return tabData;
};

const getTabsDataReviewer = (t: any) => {
    let tabsData: TabData[] = [];

    const interviewers = getUserDatasActivity().map(data => data.interviewerId);
    const interviewersUniques = interviewers.filter(
        (value, index, self) => self.indexOf(value) === index,
    );

    interviewersUniques.forEach(interviewer => {
        let tabData1 = createTabData(getIdSurveyActivity(interviewer, 0), t, true);
        tabsData.push(tabData1);
        const tabData2 = createTabData(getIdSurveyActivity(interviewer, 1), t, true);
        tabsData.push(tabData2);
        if (getIdSurveyWorkTime(interviewer)) {
            const tabData3 = createTabData(getIdSurveyWorkTime(interviewer), t, false);
            tabsData.push(tabData3);
        }
    });

    return tabsData;
};

const getTabsDataInterviewer = (t: any) => {
    let tabsData: TabData[] = [];

    surveysIds[SurveysIdsEnum.ACTIVITY_SURVEYS_IDS].forEach(idSurvey => {
        const tabData = createTabData(idSurvey, t, true);
        tabsData.push(tabData);
    });
    surveysIds[SurveysIdsEnum.WORK_TIME_SURVEYS_IDS].forEach(idSurvey => {
        const tabData = createTabData(idSurvey, t, false);
        tabsData.push(tabData);
    });
    return tabsData;
};

const getTabsData = (t: any): TabData[] => {
    if (isDemoMode()) {
        return getTabsDataReviewer(t);
    } else {
        return getTabsDataInterviewer(t);
    }
};

// return survey date in french format (day x - dd/mm) if exist or default value
const getPrintedSurveyDate = (idSurvey: string, surveyParentPage?: EdtRoutesNameEnum): string => {
    const savedSurveyDate = getSurveyDate(idSurvey);
    const label =
        surveyParentPage === EdtRoutesNameEnum.WORK_TIME
            ? t("component.week-card.week")
            : t("component.day-card.day");
    if (savedSurveyDate) {
        const dayName = getFrenchDayFromDate(generateDateFromStringInput(savedSurveyDate));
        const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        const splittedDate = savedSurveyDate.split("-");
        return capitalizedDayName + " " + [splittedDate[2], splittedDate[1]].join("/");
    } else {
        const isDemoMode = getFlatLocalStorageValue(LocalStorageVariableEnum.IS_DEMO_MODE) === "true";
        if (isDemoMode) {
            const dataUserSurvey = userDatas.filter(data => data.surveyUnitId == idSurvey)[0];
            const indexInterviewerId = userDatas
                .filter(
                    data =>
                        data.interviewerId == dataUserSurvey?.interviewerId &&
                        data.questionnaireModelId == dataUserSurvey?.questionnaireModelId,
                )
                .map(data => data.surveyUnitId)
                .indexOf(idSurvey);
            return label + " " + (indexInterviewerId + 1);
        } else return label + " 1";
    }
};

//Return date with full french format dd/MM/YYYY
const getFullFrenchDate = (surveyDate: string): string => {
    const splittedDate = surveyDate?.split("-");
    return [splittedDate[2], splittedDate[1], splittedDate[0]].join("/");
};

const getPersonNumber = (idSurvey: string) => {
    //const isDemoMode = getFlatLocalStorageValue(LocalStorageVariableEnum.IS_DEMO_MODE) === "true";

    const index =
        surveysIds[SurveysIdsEnum.ACTIVITY_SURVEYS_IDS].indexOf(idSurvey) !== -1
            ? surveysIds[SurveysIdsEnum.ACTIVITY_SURVEYS_IDS].indexOf(idSurvey)
            : surveysIds[SurveysIdsEnum.WORK_TIME_SURVEYS_IDS].indexOf(idSurvey);

    const interviewerId = userDatas.filter(data => data.surveyUnitId == idSurvey)[0]?.interviewerId;
    const indexDemo = interviewerId?.split("interviewer")[1];

    return isDemoMode() ? indexDemo : index + 1;
};

const isDemoMode = () => {
    return getFlatLocalStorageValue(LocalStorageVariableEnum.IS_DEMO_MODE) === "true";
};

export {
    getData,
    getDatas,
    initializeDatas,
    saveData,
    getCurrentPage,
    getLastName,
    getFirstName,
    getPrintedFirstName,
    getSurveyDate,
    getPrintedSurveyDate,
    getFullFrenchDate,
    getValue,
    setValue,
    getReferentiel,
    getSource,
    getComponentId,
    getComponentsOfVariable,
    getVariable,
    getTabsData,
    surveysIds,
    toIgnoreForRoute,
    toIgnoreForActivity,
    addToSecondaryActivityReferentiel,
    addToAutocompleteActivityReferentiel,
    initializeSurveysDatasCache,
    getUserDatasActivity,
    getUserDatasWorkTime,
    isDemoMode,
    getIdSurveyActivity,
    getIdSurveyWorkTime,
};
