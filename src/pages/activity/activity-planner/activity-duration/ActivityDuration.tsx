import FlexCenter from "components/commons/FlexCenter/FlexCenter";
import LoopSurveyPage from "components/commons/LoopSurveyPage/LoopSurveyPage";
import { OrchestratorContext } from "interface/lunatic/Lunatic";
import { callbackHolder, OrchestratorForStories } from "orchestrator/Orchestrator";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getStepData } from "service/loop-stepper-service";
import { getCurrentNavigatePath } from "service/navigation-service";
import { LoopPage } from "service/survey-service";

const ActivityDurationPage = () => {
    const navigate = useNavigate();
    const context = useOutletContext() as OrchestratorContext;
    const stepData = getStepData(1);

    const onNext = () => {
        navigate(
            getCurrentNavigatePath(
                context.idSurvey,
                context.surveyRootPage,
                context.source.maxPage,
                LoopPage.ACTIVITY,
                context.iteration,
            ),
        );
    };

    const onPrevious = () => {
        //TODO : see nav on previous
        navigate("");
    };

    return (
        <LoopSurveyPage
            onNext={onNext}
            onPrevious={onPrevious}
            currentStepIcon={stepData.stepIcon}
            currentStepIconAlt={stepData.stepIconAlt}
            currentStepNumber={stepData.stepNumber}
            currentStepLabel={stepData.stepLabel}
        >
            <FlexCenter>
                <OrchestratorForStories
                    source={context.source}
                    data={context.data}
                    callbackHolder={callbackHolder}
                    page={LoopPage.ACTIVITY}
                    subPage={(stepData.stepNumber + 1).toString()}
                    iteration={context.iteration ?? 0}
                ></OrchestratorForStories>
            </FlexCenter>
        </LoopSurveyPage>
    );
};

export default ActivityDurationPage;
