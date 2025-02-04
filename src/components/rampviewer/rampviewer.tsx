/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-plusplus */
/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-filename-extension */
import { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { getQueryParams } from "../../common/queryparams";
import defaultMapConfig from "./canada-world-config.json";

const RampViewer = (): JSX.Element => {
  const queryParams = getQueryParams(location.search);
  const { t } = useTranslation();
  const language = t("app.language");

  const testDemo = queryParams.test === "y";
  const demoMapping = [
    "012d26bc-b741-449f-95e3-0114d2432473",
    "0083baf1-8145-4207-a84f-3d85ef2943a5",
    "000183ed-8864-42f0-ae43-c4313a860720",
    "01612b53-98a2-4c30-bba5-be74adfc0611",
    "01779d10-7a9a-4d9c-8b5c-80acc30dda81",
  ];
  const mapping = testDemo ? demoMapping : [];
  const appendScript = (attr: scriptAttr) => {
    const script = document.createElement("script");
    if (attr.id) {
      script.id = attr.id;
    }
    if (attr.scriptToAppend) {
      script.src = attr.scriptToAppend;
    }
    if (attr.integrity) {
      script.integrity = attr.integrity;
    }
    if (attr.crossorigin) {
      script.crossorigin = attr.crossorigin;
    }
    // script.async = true;
    if (attr.beforeElementName) {
      const beforeEl = document.getElementsByName(attr.beforeElementName);
      if (beforeEl.length > 0) {
        document.body.insertBefore(script, beforeEl[0]);
      } else {
        document.body.appendChild(script);
      }
    } else {
      document.body.appendChild(script);
    }
  };

  const addMapDiv = (attr: mapAttr) => {
    const mapDiv = document.createElement("div");
    mapDiv.id = attr.id;
    mapDiv.setAttribute("is", attr.is);
    mapDiv.setAttribute("rv-langs", attr.rvLangs);
    mapDiv.setAttribute(
      "rv-service-endpoint",
      "https://maps.canada.ca/geonetwork/srv/api/"
    );
    mapDiv.setAttribute(
      "rv-config",
      JSON.stringify(defaultMapConfig[language])
    );
    mapDiv.setAttribute("data-rv-keys", JSON.stringify(attr.rvKeys));

    // const rvMapPage = document.getElementById("rvMapPage");
    const rvMap = document.getElementById("rvMap");
    if (rvMap) {
      rvMap.replaceWith(mapDiv);
    } else {
      const rvMapPage = document.getElementById("rvMapPage");
      if (rvMapPage) {
        rvMapPage.prepend(mapDiv);
      }
    }
  };
  useEffect(() => {
    // console.log("rvmap refresh");
    const rvScript = document.getElementById("rvJS");
    if (rvScript) {
      rvScript.remove();
    }
    const rvApiScript = document.getElementById("rvApi");
    if (rvApiScript) {
      rvApiScript.remove();
    }
    const rvKeys = queryParams.rvKey ? [queryParams.rvKey] : mapping;
    addMapDiv({
      id: "rvMap",
      is: "rv-map",
      rvLangs: `["${language}-CA"]`,
      rvKeys,
    });
    appendScript({ id: "rvJS", scriptToAppend: "/assets/js/rv-main.js" });
    appendScript({ id: "rvApi", scriptToAppend: "/assets/js/legacy-api.js" });
  }, [language, testDemo]);

  return (
    <div id="rvMapPage" className="mapPage">
      <div
        id="rvMap"
        is="rv-map"
        rv-langs={`["${language}-CA"]`}
        rv-service-endpoint="https://gcgeo.gc.ca/geonetwork/srv/api/"
        rv-config={JSON.stringify(defaultMapConfig[language])}
        data-rv-keys={
          queryParams.rvKey
            ? JSON.stringify([queryParams.rvKey])
            : JSON.stringify(mapping)
        }
      />
    </div>
  );
};
interface scriptAttr {
  id?: string;
  scriptToAppend?: string;
  integrity?: string;
  crossorigin?: string;
  beforeElementName?: string;
}

interface mapAttr {
  id: string;
  is: string;
  rvLangs: string;
  rvKeys: string[];
}
export default RampViewer;
