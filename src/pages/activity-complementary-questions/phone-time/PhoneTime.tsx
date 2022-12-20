import FlexCenter from "components/commons/FlexCenter/FlexCenter";
import SurveyPage from "components/commons/SurveyPage/SurveyPage";
import { OrchestratorContext } from "interface/lunatic/Lunatic";
import { callbackHolder, OrchestratorForStories } from "orchestrator/Orchestrator";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getPrintedFirstName, saveData } from "service/survey-service";
import { getStepData } from "service/stepper.service";
import { EdtRoutesNameEnum } from "routes/EdtRoutesMapping";
import { getFullNavigatePath } from "service/navigation-service";
import FelicitationModal from "components/commons/Modal/FelicitationModal/FelicitationModal";
import { SetStateAction, useState } from "react";

const validateAndNav = (
    forceQuit: boolean,
    setIsModalDisplayed: (value: SetStateAction<boolean>) => void,
    saveAndGoHome: () => void,
): void => {
    if (forceQuit) {
        saveAndGoHome();
    } else {
        setIsModalDisplayed(true);
    }
};

const PhoneTimePage = () => {
    const context: OrchestratorContext = useOutletContext();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const currentPage = EdtRoutesNameEnum.PHONE_TIME;
    const stepData = getStepData(currentPage);
    const [isModalDisplayed, setIsModalDisplayed] = useState<boolean>(false);
    console.log(stepData);

    const saveAndGoHome = (): void => {
        saveData(context.idSurvey, callbackHolder.getData()).then(() => {
            navigate("/");
        });
    };

    const onPrevious = (e: React.MouseEvent) => {
        saveData(context.idSurvey, callbackHolder.getData()).then(() => {
            navigate(getFullNavigatePath(context.idSurvey, EdtRoutesNameEnum.TRAVEL_TIME));
        });
    };

    return (
        <SurveyPage
            validate={() => validateAndNav(false, setIsModalDisplayed, saveAndGoHome)}
            onNavigateBack={() => validateAndNav(false, setIsModalDisplayed, saveAndGoHome)}
            onPrevious={onPrevious}
            firstName={getPrintedFirstName(context.idSurvey)}
            firstNamePrefix={t("component.survey-page-edit-header.week-of")}
            simpleHeader={true}
            simpleHeaderLabel={t("page.kind-of-week.simple-header-label")}
            displayStepper={true}
            currentStepNumber={stepData.stepNumber}
            currentStepLabel={stepData.stepLabel}
        >
            <FlexCenter>
                <FelicitationModal
                    isModalDisplayed={isModalDisplayed}
                    onCompleteCallBack={() => validateAndNav(true, setIsModalDisplayed, saveAndGoHome)}
                    content={t("component.modal-edt.modal-felicitation.activity-content")}
                />
                <OrchestratorForStories
                    source={context.source}
                    data={context.data}
                    callbackHolder={callbackHolder}
                    page="8"
                ></OrchestratorForStories>
            </FlexCenter>
        </SurveyPage>
    );
};

export default PhoneTimePage;
