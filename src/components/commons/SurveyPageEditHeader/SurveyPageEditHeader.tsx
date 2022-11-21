import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Box, Button, Divider, Typography } from "@mui/material";
import { makeStylesEdt } from "lunatic-edt";
import { useTranslation } from "react-i18next";

interface SurveyPageEditHeaderProps {
    firstName: string;
    onNavigateBack(): void;
    onEdit(): void;
}

const SurveyPageEditHeader = (props: SurveyPageEditHeaderProps) => {
    const { firstName, onNavigateBack, onEdit } = props;
    const { classes } = useStyles();
    const { t } = useTranslation();
    return (
        <>
            <Box className={classes.headerBox}>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIosNewIcon />}
                        onClick={onNavigateBack}
                        aria-label={t("common.navigation.previous")}
                    ></Button>
                </Box>
                <Box>
                    <Typography className={classes.infoText}>
                        {t("component.survey-page-edit-header.week-of") + firstName}
                    </Typography>
                </Box>
                <Box>
                    <MoreHorizIcon className={classes.actionIcon} onClick={onEdit}></MoreHorizIcon>
                </Box>
            </Box>
            <Divider light />
        </>
    );
};

const useStyles = makeStylesEdt({ "name": { SurveyPageEditHeader } })(theme => ({
    headerBox: {
        display: "flex",
        flexGrow: "1",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        backgroundColor: theme.variables.white,
    },
    infoText: {
        fontSize: "14px",
        fontWeight: "bold",
    },
    actionIcon: {
        cursor: "pointer",
    },
}));

export default SurveyPageEditHeader;
