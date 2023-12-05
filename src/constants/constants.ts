export const START_TIME_DAY = "04:00";
export const FORMAT_TIME = "HH:mm";
export const MINUTE_LABEL = "minute";
export const DAY_LABEL = "day";
export const HOURS_LABEL = "hours";

export const HOME_CATEGORY_PLACE_LIST = ["11"];
export const SLEEPING_CATEGORIES_ACTIVITES_LIST = ["111", "114"];
export const WORKING_CATEGORIES_ACTIVITES_LIST = ["200"];
export const SKIP_WORKING_CATEGORIES_ACTIVITES_LIST = ["232", "234", "241", "271", "272"];
export const DOMESTIC_CATEGORIES_ACTIVITES_LIST = ["300"];
export const OTHER_FAMILY_CATEGORIES_ACTIVITES_LIST = ["441"];
export const EAT_CATEGORIES_ACTIVITES_LIST = ["140"];

//activites filtred
export const CODES_ACTIVITY_IGNORE_SOMEONE = ["111", "114"];
export const CODES_ACTIVITY_IGNORE_SECONDARY_ACTIVITY = ["111", "114"];
export const CODES_ACTIVITY_IGNORE_GOAL = [
    "110", //111,114,112,113
    "140",
    "210", //"215,213,221,223,231,232,233,234,241,251,264"
    "270",
    "260", //261,262,263, 264, 271,272
    "516",
    "531",
    "532",
    "510",
    "601", //620,623,624,625,627
    "631", //633,632
    "639",
    "641",
    "649",
    "652",
    "656",
    "658",
    "674",
    "664",
    "680", //671,668,662,663
];
export const CODES_ACTIVITY_IGNORE_SCREEN = ["111", "114", "674", "649", "671"];
export const CODES_ACTIVITY_IGNORE_LOCATION = ["652"];

//quality score
export const MAX_SCORE = 20;
export const MIN_THRESHOLD = {
    MIN_THRESHOLD_PROVIDED_HOURS: 1,
    MIN_THRESHOLD_MISSING_HOURS: 1,
    MIN_THRESHOLD_OVERLAPS_HOURS: 2,
    MIN_THRESHOLD_ROUTES: 1,
    MIN_THRESHOLD_SLEEP_ACTIVITES_HOURS: 5,
    MIN_THRESHOLD_EAT_ACTIVITES_HOURS: 2,
    MIN_THRESHOLD_ACTIVITIES: 10,
    MIN_THRESHOLD_ACTIVITIES_2: 15,
    MIN_THRESHOLD_MISSING_TIME: 60,
    MIN_THRESHOLD_MISSING_TIME_2: 120,
    MIN_THRESHOLD_OVER_TIME: 180,
};
export const POINTS_REMOVE = {
    POINTS_REMOVE_PROVIDED_HOURS: 5,
    POINTS_REMOVE_MISSING_HOURS: 1,
    POINTS_REMOVE_OVERLAPS_HOURS: 1,
    POINTS_REMOVE_ROUTES: 2,
    POINTS_REMOVE_MISSING_SOMEONE: 1,
    POINTS_REMOVE_MISSING_SCREEN: 1,
    POINTS_REMOVE_MISSING_PLACE: 1,
    POINTS_REMOVE_MISSING_MEANOFTRANSPORT: 1,
    POINTS_REMOVE_SLEEP_ACTIVITES_HOURS: 3,
    POINTS_REMOVE_EAT_ACTIVITES_HOURS: 3,
    POINTS_REMOVE_MANDATORY_START_CODES_ACTIVIY: 3,
    POINTS_REMOVE_MIN_ACTIVITES: 5,
    POINTS_REMOVE_MIN_ACTIVITES_2: 3,
    POINTS_REMOVE_MISSING_TIME: 1,
    POINTS_REMOVE_MISSING_TIME_2: 3,
    POINTS_REMOVE_MISSING_TIME_3: 5,
    POINTS_REMOVE_OVER_TIME: 1,
    POINTS_REMOVE_OVER_TIME_2: 2,
};
export const PERCENT_MIN_THRESHOLD = {
    PERCENT_MIN_THRESHOLD_SOMEONE: 20,
    PERCENT_MIN_THRESHOLD_SCREEN: 20,
    PERCENT_MIN_THRESHOLD_PLACE: 20,
    PERCENT_MIN_THRESHOLD_GOAL: 20,
};
export const MINUTES_DAY = 1440;
export const SEPARATOR_DEFAUT = ";";

export const MANDATORY_START_CODES_ACTIVIY = ["3", "4", "5", "6"];
