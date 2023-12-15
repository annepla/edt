import {
    important,
    makeStylesEdt,
    responsesHourChecker,
    WeeklyPlannerSpecificProps,
} from "@inseefrlab/lunatic-edt";
import { Box, Button, Modal } from "@mui/material";
import InfoIcon from "assets/illustration/info.svg";
import arrowBackIos from "assets/illustration/mui-icon/arrow-back-ios-white.svg";
import arrowForwardIos from "assets/illustration/mui-icon/arrow-forward-ios-white.svg";
import arrowForward from "assets/illustration/mui-icon/arrow-forward.svg";
import expandLessWhite from "assets/illustration/mui-icon/expand-less-white.svg";
import expandLess from "assets/illustration/mui-icon/expand-less.svg";
import expandMoreWhite from "assets/illustration/mui-icon/expand-more-white.svg";
import expandMore from "assets/illustration/mui-icon/expand-more.svg";
import InfoTooltipIcon from "assets/illustration/mui-icon/info.svg";
import work from "assets/illustration/mui-icon/work-full.svg";
import FlexCenter from "components/commons/FlexCenter/FlexCenter";
import SurveyPage from "components/commons/SurveyPage/SurveyPage";
import { EdtRoutesNameEnum } from "enumerations/EdtRoutesNameEnum";
import { LocalStorageVariableEnum } from "enumerations/LocalStorageVariableEnum";
import { SourcesEnum } from "enumerations/SourcesEnum";
import { SurveysIdsEnum } from "enumerations/SurveysIdsEnum";
import { callbackHolder, OrchestratorForStories } from "orchestrator/Orchestrator";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    getCurrentNavigatePath,
    getIdSurveyContext,
    getNavigatePath,
    getOrchestratorPage,
    isPageGlobal,
    navToHelp,
    navToHome,
    saveAndNav,
} from "service/navigation-service";
import { getLanguage } from "service/referentiel-service";
import {
    getData,
    getPrintedFirstName,
    getSource,
    getSurveyDate,
    saveData,
} from "service/survey-service";

const HelpWorkTime = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { classes, cx } = useStyles();

    const [displayDayOverview, setDisplayDayOverview] = React.useState<boolean>(false);
    const [isPlaceWorkDisplayed, setIsPlaceWorkDisplayed] = React.useState<boolean>(false);
    const [displayedDayHeader, setDisplayedDayHeader] = React.useState<string>("");
    const [helpStep, setHelpStep] = React.useState(1);

    const currentPage = EdtRoutesNameEnum.WEEKLY_PLANNER;
    const idSurvey = getIdSurveyContext(SurveysIdsEnum.WORK_TIME_SURVEYS_IDS);
    const source = getSource(SourcesEnum.WORK_TIME_SURVEY);
    const data = getData(idSurvey || "");

    const navToWeeklyPlannerHome = useCallback(() => {
        if (helpPageGlobal) {
            navigate(getNavigatePath(EdtRoutesNameEnum.SURVEYED_HOME));
        } else {
            let idSurvey = localStorage.getItem(LocalStorageVariableEnum.IDSURVEY_CURRENT) ?? "";
            navigate(
                getCurrentNavigatePath(
                    idSurvey,
                    EdtRoutesNameEnum.WORK_TIME,
                    getOrchestratorPage(EdtRoutesNameEnum.WEEKLY_PLANNER),
                    source,
                ),
            );
        }
    }, []);

    const specificProps: WeeklyPlannerSpecificProps = {
        surveyDate: getSurveyDate(idSurvey),
        isSubChildDisplayed: displayDayOverview,
        setIsSubChildDisplayed: setDisplayDayOverview,
        isPlaceWorkDisplayed: isPlaceWorkDisplayed,
        setIsPlaceWorkDisplayed: setIsPlaceWorkDisplayed,
        displayedDayHeader: displayedDayHeader,
        setDisplayedDayHeader: setDisplayedDayHeader,
        labels: {
            title: t("component.weekly-planner.title"),
            workSumLabel: t("component.weekly-planner.work-sum-label"),
            presentButtonLabel: t("component.weekly-planner.present-button-label"),
            futureButtonLabel: t("component.weekly-planner.future-button-label"),
            editButtonLabel: t("common.navigation.edit"),
            infoLabels: {
                normalText: t("page.weekly-planner.info-light"),
                boldText: t("page.weekly-planner.info-bold"),
                infoIconAlt: t("accessibility.asset.info.info-alt"),
                infoIcon: InfoIcon,
                infoIconTooltip: InfoTooltipIcon,
                infoIconTooltipAlt: t("accessibility.asset.info.info-alt"),
                border: true,
            },
            dates: "DATES",
            datesStarted: "DATES_STARTED",
        },
        saveAll: () => saveData(idSurvey, data),
        language: getLanguage(),
        helpStep: helpStep,
        moreIcon: expandMore,
        moreIconAlt: t("accessibility.asset.mui-icon.expand-more"),
        expandLessIcon: expandLess,
        expandLessIconAlt: t("accessibility.asset.mui-icon.expand-less"),
        expandMoreIcon: expandMore,
        expandMoreIconAlt: t("accessibility.asset.mui-icon.expand-more"),
        expandLessWhiteIcon: expandLessWhite,
        expandMoreWhiteIcon: expandMoreWhite,
        workIcon: work,
        workIconAlt: t("accessibility.asset.mui-icon.work"),
        saveHours: (response: responsesHourChecker) => {
            console.log(response);
        },
        optionsIcons: {
            "1": {
                icon: "",
                altIcon: "",
            },
        },
    };

    const navToBackPage = useCallback(
        () =>
            isPageGlobal() ? navigate(getNavigatePath(EdtRoutesNameEnum.HELP_CHECKBOX)) : navToHome(),
        [helpStep],
    );

    const navToNextPage = useCallback(() => (isPageGlobal() ? navigate("/") : navToHome()), [helpStep]);

    const previousHelpStep = useCallback(() => {
        helpStep > 1 ? setHelpStep(helpStep - 1) : navToBackPage();
    }, [helpStep]);

    const nextHelpStep = useCallback(() => {
        helpStep < 4 ? setHelpStep(helpStep + 1) : navToNextPage();
    }, [helpStep]);

    const helpPageGlobal = isPageGlobal();

    const renderHelp = () => {
        return (
            <Modal disableEnforceFocus open={true}>
                <Box className={classes.rootHelp}>
                    <Box className={classes.headerHelpBox}>
                        {
                            <Button
                                className={cx(classes.buttonBox, classes.buttonHelpBox)}
                                variant="outlined"
                                onClick={previousHelpStep}
                                startIcon={
                                    <img
                                        src={arrowBackIos}
                                        alt={t("accessibility.asset.mui-icon.arrow-back-ios")}
                                    />
                                }
                            >
                                {t("common.navigation.previous")}
                            </Button>
                        }
                        {helpStep < 4 && (
                            <Button
                                className={cx(classes.buttonBox, classes.buttonHelpBox)}
                                variant="outlined"
                                onClick={nextHelpStep}
                                endIcon={
                                    <img
                                        src={arrowForwardIos}
                                        alt={t("accessibility.asset.mui-icon.arrow-forward-ios")}
                                    />
                                }
                            >
                                {t("common.navigation.next")}
                            </Button>
                        )}
                    </Box>
                    <Box>
                        <Button
                            className={cx(classes.buttonBox, classes.buttonSkipBox)}
                            variant="outlined"
                            onClick={navToWeeklyPlannerHome}
                            endIcon={
                                <img
                                    src={arrowForward}
                                    alt={t("accessibility.asset.mui-icon.arrow-forward")}
                                />
                            }
                        >
                            {helpPageGlobal && helpStep == 4
                                ? t("common.navigation.skip-final")
                                : t("common.navigation.skip")}
                        </Button>
                    </Box>
                    {renderHelpStep()}
                </Box>
            </Modal>
        );
    };

    const renderHelpStep = () => {
        return (
            <>
                {helpStep == 1 && (
                    <Box id="help-step-1" className={cx(classes.stepHelpBox, classes.stepHelpOne)}>
                        {t("component.help.help-page-6.help-step-1")}
                    </Box>
                )}
                {helpStep == 2 && (
                    <Box id="help-step-2" className={cx(classes.stepHelpBox, classes.stepHelpTwo)}>
                        {t("component.help.help-page-6.help-step-2")}
                    </Box>
                )}
                {helpStep == 3 && (
                    <Box id="help-step-3" className={cx(classes.stepHelpBox, classes.stepHelpThree)}>
                        {t("component.help.help-page-6.help-step-3")}
                    </Box>
                )}
                {helpStep == 4 && (
                    <Box id="help-step-4" className={cx(classes.stepHelpBox, classes.stepHelpFour)}>
                        {t("component.help.help-page-6.help-step-4")}
                    </Box>
                )}
            </>
        );
    };

    return (
        <Box className={classes.root}>
            {renderHelp()}
            <SurveyPage
                idSurvey={idSurvey}
                validate={useCallback(() => console.log(""), [])}
                onNavigateBack={useCallback(() => console.log(""), [])}
                onPrevious={useCallback(() => saveAndNav(idSurvey), [])}
                onEdit={useCallback(() => console.log(""), [])}
                onHelp={navToHelp}
                firstName={getPrintedFirstName(idSurvey)}
                firstNamePrefix={t("component.survey-page-edit-header.week-of")}
                simpleHeader={displayDayOverview}
                simpleHeaderLabel={displayedDayHeader}
                backgroundWhiteHeader={displayDayOverview}
            >
                <FlexCenter>
                    <OrchestratorForStories
                        source={source}
                        data={data}
                        cbHolder={callbackHolder}
                        page={getOrchestratorPage(currentPage)}
                        componentSpecificProps={specificProps}
                        idSurvey={idSurvey}
                    ></OrchestratorForStories>
                </FlexCenter>
            </SurveyPage>
        </Box>
    );
};

const useStyles = makeStylesEdt({ "name": { HelpWorkTime } })(theme => ({
    root: {
        height: "100vh",
        maxHeight: "100vh",
    },
    headerHelpBox: {
        display: "flex",
    },
    rootHelp: {
        padding: "0.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        marginTop: "0.5rem",
    },
    buttonBox: {
        color: theme.variables.white,
        borderColor: "transparent",
        marginBottom: "1rem",
        marginRight: "1rem",
        width: "10rem",
        "&:hover": {
            color: theme.variables.white,
            borderColor: important(theme.variables.white),
        },
    },
    buttonHelpBox: {
        backgroundColor: "#2c2e33",
        "&:hover": {
            backgroundColor: "#2c2e33",
        },
    },
    buttonSkipBox: {
        backgroundColor: "#707070",
        "&:hover": {
            backgroundColor: "#707070",
        },
    },
    stepHelpBox: {
        fontWeight: "bold",
        borderRadius: "1rem",
        padding: "1rem",
        backgroundColor: "#707070",
        color: theme.variables.white,
    },
    stepHelpOne: {
        width: "24rem",
        marginTop: "1.5rem",
    },
    stepHelpTwo: {
        width: "24rem",
        marginTop: "10.5rem",
    },
    stepHelpThree: {
        width: "24rem",
        marginTop: "14.5rem",
    },
    stepHelpFour: {
        width: "24rem",
        marginTop: "12.5rem",
    },
}));

export default HelpWorkTime;
