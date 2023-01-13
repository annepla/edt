import {
    AutoCompleteActiviteOption,
    CheckboxOneCustomOption,
    findItemInAutoCompleteRef,
    findItemInCategoriesNomenclature,
    NomenclatureActivityOption,
    SelectedActivity,
} from "lunatic-edt";

import { getReferentiel, ReferentielsEnum } from "./survey-service";

export const getAutoCompleteRef = (): AutoCompleteActiviteOption[] => {
    return getReferentiel(ReferentielsEnum.ACTIVITYAUTOCOMPLETE) as AutoCompleteActiviteOption[];
};

export const getNomenclatureRef = (): NomenclatureActivityOption[] => {
    return getReferentiel(ReferentielsEnum.ACTIVITYNOMENCLATURE) as NomenclatureActivityOption[];
};

export const getActivitySecondaryActivityRef = (): CheckboxOneCustomOption[] => {
    return getReferentiel(ReferentielsEnum.ACTIVITYSECONDARYACTIVITY) as CheckboxOneCustomOption[];
};

export const getRouteSecondaryActivityRef = (): CheckboxOneCustomOption[] => {
    return getReferentiel(ReferentielsEnum.ROUTESECONDARYACTIVITY) as CheckboxOneCustomOption[];
};

export const getPlaceRef = (): CheckboxOneCustomOption[] => {
    return getReferentiel(ReferentielsEnum.LOCATION) as CheckboxOneCustomOption[];
};

export const getRouteRef = (): CheckboxOneCustomOption[] => {
    return getReferentiel(ReferentielsEnum.ROUTE) as CheckboxOneCustomOption[];
};

export const getKindOfWeekRef = (): CheckboxOneCustomOption[] => {
    return getReferentiel(ReferentielsEnum.KINDOFWEEK) as CheckboxOneCustomOption[];
};

export const getKindOfDayRef = (): CheckboxOneCustomOption[] => {
    return getReferentiel(ReferentielsEnum.KINDOFDAY) as CheckboxOneCustomOption[];
};

export const findActivityInAutoCompleteReferentiel = (
    selectedActivity: SelectedActivity,
): AutoCompleteActiviteOption | undefined => {
    return findItemInAutoCompleteRef(selectedActivity?.suggesterId, getAutoCompleteRef());
};

export const findActivityInNomenclatureReferentiel = (
    selectedActivity: SelectedActivity,
): NomenclatureActivityOption | undefined => {
    return findItemInCategoriesNomenclature(selectedActivity.id, getNomenclatureRef())?.item;
};

export const findSecondaryActivityInRef = (id: string): CheckboxOneCustomOption | undefined => {
    return getActivitySecondaryActivityRef().find(a => a.value === id);
};

export const findPlaceInRef = (id: string): CheckboxOneCustomOption | undefined => {
    return getPlaceRef().find(a => a.value === id);
};

export const findRouteInRef = (id: string): CheckboxOneCustomOption | undefined => {
    return getRouteRef().find(a => a.value === id);
};
