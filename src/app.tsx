import { Routes, Route, BrowserRouter } from "react-router-dom";
import { RenderMap } from "./components/map/render-map";
import { Map } from "./components/map/map";
import { TypeWindow } from "geoview-core-types";
import Header from "./components/header/header";
import MetaDataPage from "./components/search/metadatapage";
import RampViewer from "./components/rampviewer/rampviewer";
const w = window as TypeWindow;

export const cgpv = w["cgpv"];
const showMap = () => {
  if (window.location.pathname === "/") {
    return <Map />;
  }
};
const showMetaData = () => {
  if (window.location.pathname === "/result") {
    return <MetaDataPage />;
  }
};
const showRampView = () => {
  if (window.location.pathname === "/map") {
    return <RampViewer />;
  }
};
export const App = () => {
  return <div>{showMap()}</div>;
};
