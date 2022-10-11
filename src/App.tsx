import { useEffect, useState } from "react";
import "./App.scss";

import { CssBaseline } from "@mui/material";
import { OrchestratorForStories } from "./orchestrator/Orchestrator";
import { ThemeProvider } from "lunatic-edt";
import Home from "./page/home/Home";
import { LunaticData, lunaticDatabase } from "service/lunatic-database";

const App = () => {
    const [data, setData] = useState(null as LunaticData | null);
    const [source, setSource] = useState(null as object | null);

    useEffect(() => {
        // this is temporary !!! TODO : replace when we know how we shoulmd do it ! This was to prenvent a source.json in the repo
        const url =
            "https://pogues-back-office-insee.k8s.keyconsulting.fr/api/persistence/questionnaire/json-lunatic/l8lq5lp6";

        fetch(url)
            .then(sourcePromise => sourcePromise.json())
            .then(source => setSource(source));

        lunaticDatabase.get("edt").then(d => {
            setData(d ? d : {});
        });
    }, []);

    return source && data ? (
        <ThemeProvider>
            <CssBaseline enableColorScheme />
            <Home />
            <OrchestratorForStories source={source} data={data}></OrchestratorForStories>
        </ThemeProvider>
    ) : (
        <div>Chargement du questionnaire...</div>
    );
};

export default App;
