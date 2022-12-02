import { EdtRoutesNameEnum, mappingPageOrchestrator } from "routes/EdtRoutes";
import { getCurrentLoopPage, getLoopInitialPage, LoopEnum } from "service/loop-service";
import { getCurrentPage, getData } from "service/survey-service";

const getNavigatePath = (page: EdtRoutesNameEnum): string => {
    return "/" + page;
};

const getParameterizedNavigatePath = (page: EdtRoutesNameEnum, param: string): string => {
    return "/" + page.split(":")[0] + param;
};

// Function to retrieve the last completed step to go back to the right activity subpage
const getCurrentNavigatePath = (
    idSurvey: string,
    rootPage: EdtRoutesNameEnum,
    maxPage: string,
    loop?: LoopEnum,
    iteration?: number,
): string => {
    const surveyData = getData(idSurvey);
    const subpage = getCurrentLoopPage(surveyData, loop, iteration);
    console.log(`subpage : ${subpage}`);
    let page: EdtRoutesNameEnum | undefined;
    let parentPage: EdtRoutesNameEnum | undefined;
    if (subpage !== 0 && loop) {
        const loopPage = getLoopInitialPage(loop);
        const pageOrchestrator = mappingPageOrchestrator.find(
            link => link.surveyPage === loopPage && link.surveySubPage === subpage.toString(),
        );
        page = pageOrchestrator?.page;
        parentPage = pageOrchestrator?.parentPage;
    } else {
        const lastFilledPage = getCurrentPage(surveyData);
        const firstEmptyPage = lastFilledPage + 1;
        page = mappingPageOrchestrator.find(
            link =>
                link.surveyPage ===
                (firstEmptyPage > Number(maxPage) ? maxPage : firstEmptyPage).toString(),
        )?.page;
    }
    if (page && subpage && iteration !== undefined) {
        console.log(`currentNavigatePath page:${page} subpage:${subpage} iteration:${iteration}`);
        return (
            getParameterizedNavigatePath(rootPage, idSurvey) +
            (parentPage ? getNavigatePath(parentPage) : "") +
            getParameterizedNavigatePath(page, iteration.toString())
        );
    } else if (page) {
        return getParameterizedNavigatePath(rootPage, idSurvey) + getNavigatePath(page);
    } else {
        return EdtRoutesNameEnum.ERROR;
    }
};

export { getNavigatePath, getParameterizedNavigatePath, getCurrentNavigatePath };
