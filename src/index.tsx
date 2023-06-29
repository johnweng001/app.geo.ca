import ReactDOM from "react-dom";

import { App } from "./app";
import "./assets/css/style.scss";
import { RenderMap } from "./components/map/render-map";
import { I18nextProvider } from "react-i18next";
import i18n from "./assets/i18n/i18n";

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <RenderMap />
  </I18nextProvider>,
  document.getElementById("root")
);
