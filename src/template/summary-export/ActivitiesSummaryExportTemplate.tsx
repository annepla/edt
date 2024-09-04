import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import logoInsee from "../../assets/illustration/logo.png";
import { ActivitiesSummaryExportData } from "../../interface/entity/ActivitiesSummary";
import { useTranslation } from "react-i18next";
import { ActivitiesPlanningExportTemplate } from "./ActivitiesPlanningExportTemplate.tsx";
import { DayCharacteristicsExportTemplate } from "./DayCharacteristicsExportTemplate.tsx";
import { DaySummaryExportTemplate } from "./DaySummaryExportTemplate.tsx";
import { GlobalOrganisationExportTemplate } from "./GlobalOrganisationExportTemplate.tsx";
import { RoutesPlanningExportTemplate } from "./RoutesPlanningExportTemplate.tsx";

interface ActivitiesSummaryExportTemplateProps {
    exportData: ActivitiesSummaryExportData;
}

const MyDocument: any = Document;
const MyPage: any = Page;

const ActivitiesSummaryExportTemplate = (props: ActivitiesSummaryExportTemplateProps) => {
    const { exportData } = props;
    const { t } = useTranslation();
    return (
        <MyDocument>
            <MyPage orientation="landscape" wrap size="A4" style={classes.body}>
                <View style={classes.headerBox}>
                    <View style={classes.headerRow}>
                        <View>
                            <Text style={classes.title}>
                                <Image style={classes.logo} src={logoInsee} />
                            </Text>
                        </View>
                        <View>
                            <Text style={classes.title}>
                                {t("export.activities-summary.header.edt-survey")}
                            </Text>
                            <Text style={classes.headerGreyColor}>
                                {t("export.activities-summary.header.house-reference")}{" "}
                                {exportData.houseReference}
                            </Text>
                            <Text>{exportData.firstName}</Text>
                        </View>
                    </View>
                    <View style={classes.headerRow}>
                        <View>
                            <Text>
                                <Text style={classes.headerGreyColor}>
                                    {t("export.activities-summary.header.survey-day")}
                                </Text>
                                <Text style={classes.valueColor}>{exportData.surveyDate}</Text>
                            </Text>
                        </View>
                        <View>
                            <Text style={classes.valueColor}>
                                {exportData.userActivitiesCharacteristics?.userMarkLabel}
                            </Text>
                        </View>
                    </View>
                </View>

                <GlobalOrganisationExportTemplate exportData={exportData} />

                <ActivitiesPlanningExportTemplate exportData={exportData} />

                <RoutesPlanningExportTemplate exportData={exportData} />

                <DayCharacteristicsExportTemplate exportData={exportData} />

                <DaySummaryExportTemplate exportData={exportData} />
            </MyPage>
        </MyDocument>
    );
};

const classes = StyleSheet.create({
    headerBox: {},
    title: {
        fontSize: 15,
    },
    logo: {
        width: "40px",
        height: "46px",
    },
    headerRow: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 10,
        padding: 3,
        marginBottom: 8,
    },
    body: {
        padding: 16,
    },
    valueColor: {
        color: "#4973D2",
    },
    headerGreyColor: {
        color: "#717171",
    },
});

export default ActivitiesSummaryExportTemplate;
