import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import FlexCenter from "components/commons/FlexCenter/FlexCenter";
import { makeStylesEdt } from "lunatic-edt";

interface ActivityButtonsProps {
    onClickFinish(): void;
    onClickAdd(): void;
    finishLabel?: string;
    addLabel?: string;
    isSubchildDisplayedAndDesktop?: boolean;
}

const ActivityButtons = (props: ActivityButtonsProps) => {
    const { onClickFinish, onClickAdd, finishLabel, addLabel, isSubchildDisplayedAndDesktop } = props;
    const widthPercent = isSubchildDisplayedAndDesktop ? "30%" : "100%";
    const { classes } = useStyles({ "width": widthPercent });
    return (
        <>
            <FlexCenter className={classes.ButtonsBox}>
                <>
                    {!addLabel && (
                        <Button variant="outlined" onClick={onClickFinish} className={classes.buttons}>
                            {finishLabel}
                        </Button>
                    )}
                </>
                <Button
                    variant="contained"
                    onClick={onClickAdd}
                    className={addLabel === undefined ? classes.buttons : classes.aloneAddButton}
                >
                    <AddIcon />
                    {addLabel}
                </Button>
            </FlexCenter>
        </>
    );
};

const useStyles = makeStylesEdt<{ width: string }>({ "name": { ActivityButtons } })(
    (theme, { width }) => ({
        ButtonsBox: {
            width: "100%",
            backgroundColor: theme.variables.white,
            padding: "0.75rem",
        },
        aloneAddButton: {
            width: "80%",
            maxWidth: "18rem",
        },
        buttons: {
            width: "40%",
            maxWidth: "9rem",
            margin: "0 1rem",
            lineHeight: "1.25rem",
        },
    }),
);

export default ActivityButtons;
