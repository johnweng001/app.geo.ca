import axios from "axios";

import React, { ChangeEvent, createRef, useState } from "react";
import { useTranslation } from "react-i18next";
import BeatLoader from "react-spinners/BeatLoader";
import { envglobals } from "../../common/envglobals";

import Pagination from "../pagination/pagination";

import SearchIcon from "@mui/icons-material/Search";
import { useMediaQuery } from "@mui/material";
import { View } from "ol";
import { Extent, createEmpty, extendCoordinate } from "ol/extent";
import { toLonLat } from "ol/proj";
import { cgpv } from "../../app";
import "./geosearch.scss";
import Sorting, { SortingOptionInfo } from "./sorting";
const EnvGlobals = envglobals();
const GeoSearch = (
  showing: boolean,
  ksOnly: boolean,
  setKeyword: (kw: string) => void,
  setKSOnly: (kso: boolean) => void,
  initKeyword: string
): JSX.Element => {
  const { t } = useTranslation();
  const [stateLoaded, setStateLoaded] = useState(false);

  const spatialLabelParams = [];

  const stacLabelParams = [];
  const rpp = 10;
  const [ppg, setPPG] = useState(
    window.innerWidth > 600 ? 8 : window.innerWidth > 400 ? 5 : 3
  );
  const inputRef: React.RefObject<HTMLInputElement> = createRef();
  let mapCount = 0;
  const view: View = cgpv.api.maps.mapWM.getView();
  const bounds = view.calculateExtent(cgpv.api.maps.mapWM.map.getSize());

  const extent: Extent = createEmpty();
  extendCoordinate(extent, bounds);
  const center1 = view.getCenter();
  const centerPoint = toLonLat(center1, view.getProjection());
  const southwest = toLonLat([bounds[0], bounds[1]], view.getProjection());
  const northeast = toLonLat([bounds[2], bounds[3]], view.getProjection());
  const [initBounds, setBounds] = useState([
    northeast[1],
    northeast[0],
    southwest[1],
    southwest[0],
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [cpn, setPn] = useState(false);
  const [pn, setPageNumber] = useState(1);
  const [cnt, setCount] = useState(0);
  const [selected, setSelected] = useState("search");
  const [open, setOpen] = useState(false);
  const language = t("app.language");
  const analyticParams = {
    loc: "/",
    lang: language,
    type: "search",
    event: "search",
  };
  const [zoom, setZoom] = useState(null);
  const [center, setCenter] = useState(null);
  const [fReset, setFReset] = useState(false);
  const [filterbyshown, setFilterbyshown] = useState(false);
  const [ofOpen, setOfOpen] = useState(false);
  const [allkw, setKWShowing] = useState<string[]>([]);
  const [sortbyValue, setSortbyValue] = useState("title");

  const handleSelect = (event: string) => {
    // const {selectResult} = this.props;
    const cardOpen = selected === event ? !open : true;
    const result =
      Array.isArray(results) && results.length > 0 && cardOpen
        ? results.find((r: SearchResult) => r.id === event)
        : undefined;

    setSelected(event);
    setOpen(cardOpen);
    selectResult(result);
  };

  const selectResult = (result: SearchResult | undefined) => {
    cgpv.api.map("mapWM").layer.vector?.setActiveGeometryGroup();
    cgpv.api.map("mapWM").layer.vector?.deleteGeometryGroup();
    if (result) {
      cgpv.api
        .map("mapWM")
        .layer.vector?.addPolygon(JSON.parse(result.coordinates), {
          style: {
            strokeColor: "blue",
            fillColor: "blue",
            fillOpacity: 0.1,
          },
        });
    }
  };

  const setLoadingStatus = (flag: boolean) => {
    setLoading(flag);
  };

  const handleChange = (e: ChangeEvent) => {
    e.preventDefault();
    setKeyword((e.target as HTMLInputElement).value);
  };

  const eventHandler = (event: unknown, passkw: string) => {
    const mbounds = event.target.getBounds();
    // console.log(mbounds,bounds);
    // console.log(passkw);
    // map.off('moveend');
    if (!loading && mapCount === 0 && !Object.is(mbounds, initBounds)) {
      // console.log('research:', loading, keyword, mapCount);
      mapCount++;
      setLoadingStatus(true);
      handleSearch(passkw, mbounds);
    }
  };

  const handleSearch = (keyword: string, bounds: number[], pnum?: number) => {
    const cpr = pnum !== undefined ? true : false;
    setPn(cpr);
    !loading && setLoadingStatus(true);
    const pageNumber = pnum !== undefined ? pnum : 1;

    const searchParams: SearchParams = {
      north: bounds[0],
      east: bounds[1],
      south: bounds[2],
      west: bounds[3],
      keyword: keyword.replace(/"/g, '\\"'),
      lang: language,
      min: (pageNumber - 1) * rpp + 1,
      max: pageNumber * rpp,
      sort: sortbyValue,
    };
    const aParams = Object.assign(analyticParams);
    aParams.search = keyword;
    // aParams.geo = JSON.stringify(bounds);

    axios
      .get(
        `${EnvGlobals.APP_API_DOMAIN_URL}${EnvGlobals.APP_API_ENDPOINTS.SEARCH}`,
        { params: searchParams }
      )
      .then((resp) => {
        // console.log(data);
        const res = resp.data.Items;
        const rcnt = res.length > 0 ? res[0].total : 0;
        setResults(res);
        setCount(rcnt);
        setPageNumber(pageNumber);
        if (
          selected !== "search" &&
          open &&
          res.find((r: SearchResult) => r.id === selected)
        ) {
          setSelected("search");
          setOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setResults([]);
        setCount(0);
        setPn(false);
        setPageNumber(1);
        setSelected("search");
        setOpen(false);
      })
      .finally(() => {
        setKeyword(keyword);
        setKWShowing([]);
        setLoadingStatus(false);
        mapCount = 0;
      });
  };

  const handleSubmit = (event?: React.MouseEvent | undefined) => {
    if (event) {
      event.preventDefault();
    }

    const keyword = (inputRef.current as HTMLInputElement).value;
    // setPageNumber(1);
    if (ksOnly) {
      handleKOSearch(keyword);
    } else {
      handleSearch(keyword, initBounds);
    }
  };

  const handleKeyDown = (e) => {
    console.log(e.key);
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const ksToggle = (kso: boolean) => {
    kso;
    setKSOnly(kso);
  };

  const applyFilters = () => {
    setFReset(false);
  };

  const clearAll = () => {
    setFReset(false);
  };

  const handleKOSearch = (keyword: string, pnum?: number) => {};

  const handleKwshowing = (rid: string) => {
    const newOpen = allkw.map((o: string) => o);
    const hIndex = allkw.findIndex((os) => os === rid);
    if (hIndex < 0) {
      newOpen.push(rid);
    } else {
      newOpen.splice(hIndex, 1);
    }
    setKWShowing(newOpen);
  };

  const handleKeyword = (keyword: string) => {
    window.open(
      `/?keyword=${encodeURI(keyword.trim())}&ksonly&lang=${language}`,
      `_blank`
    );
  };

  const handleOrg = (filters: unknown): void => {
    setFReset(true);
  };

  const handleType = (filters: unknown): void => {
    setFReset(true);
  };

  const handleTheme = (filters: unknown): void => {
    setFReset(true);
  };

  const handleSpatial = (filters: unknown): void => {
    setFReset(true);
  };

  const handleStac = (filters: unknown): void => {
    setFReset(true);
  };

  const handleFound = (found: unknown): void => {
    setFReset(true);
  };

  const clearOrgFilter = (filter: number) => {
    setFReset(false);
  };

  const clearTypeFilter = (filter: number) => {
    setFReset(false);
  };

  const clearThemeFilter = (filter: number) => {
    setFReset(false);
    // handleSearch(initKeyword);
  };

  const clearSpatialFilter = (filter: number) => {
    setFReset(false);
  };

  const clearStacFilter = (filter: number) => {
    setFReset(false);
    // handleSearch(initKeyword);
  };

  const clearSpatempFilter = (filter: number) => {
    setFReset(false);
  };

  const clearFound = () => {
    setFReset(false);
  };
  const isMobile = useMediaQuery("(max-width: 760px)");
  const sortingOptions: SortingOptionInfo[] = [
    {
      label: "appbar.sortby.date.desc",
      value: "date-desc",
      sortDirection: "desc",
    },
    {
      label: "appbar.sortby.date.asc",
      value: "date-asc",
      sortDirection: "asc",
    },
    {
      label: "appbar.sortby.popularity.desc",
      value: "popularity-desc",
      sortDirection: "desc",
    },
    {
      label: "appbar.sortby.popularity.asc",
      value: "popularity-asc",
      sortDirection: "asc",
    },
    { label: "appbar.sortby.title", value: "title" },
  ];

  const handleSorting = (value: string) => {
    setSortbyValue(value);
    console.log("sorting by", value);
    // !loading && handleSortFilter();
  };

  const handleView = (
    evt: React.MouseEvent<HTMLButtonElement>,
    id: string,
    title: string
  ) => {
    console.log(evt);
    evt.stopPropagation();

    const metadataState = {
      lang: `${language}`,
      id: `${encodeURI(id.trim())}`,
      title: `${encodeURI(title.trim().toLowerCase().replaceAll(" ", "-"))}`,
      stateKO: ksOnly,
      stateKeyword: initKeyword,
      statePn: pn,
      stateBounds: initBounds,
    };
    localStorage.setItem("metadataState", JSON.stringify(metadataState));
    window.open(
      `/result?id=${encodeURI(id.trim())}&lang=${language}`,
      "_blank",
      "noreferrer"
    );
  };

  return (
    <div className="geoSearchContainer">
      <div
        className={
          ksOnly
            ? "container-fluid container-search input-container"
            : "searchInput input-container"
        }
      >
        <div className={ksOnly ? "col-12 col-search-input" : "searchInput"}>
          <input
            placeholder={t("page.search")}
            type="text"
            ref={inputRef}
            disabled={loading}
            onKeyUp={handleKeyDown}
            aria-label={t("appbar.search")}
          />
          <button
            type="button"
            className="icon-button"
            aria-label={t("appbar.search")}
            disabled={loading}
            onClick={!loading ? handleSubmit : undefined}
          >
            <SearchIcon />
          </button>
        </div>
        <div
          className={
            ksOnly
              ? "col-12 col-advanced-filters-button"
              : "col-advanced-filters-button"
          }
        >
          <div
            className={ksOnly ? "geo-padding-right-30" : "geo-padding-right-10"}
          >
            <span>{t("appbar.keywordonly")}</span>
            <label className="switch">
              <input
                type="checkbox"
                disabled={loading}
                checked={ksOnly}
                onChange={() => ksToggle(!ksOnly)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div
            className={ksOnly ? "geo-padding-right-30" : "geo-padding-right-5"}
          >
            {!loading && (
              <Sorting
                label="appbar.sortby.label"
                labelClassName="sorting-label"
                selectClassName="sorting-select"
                optionClassName="sorting-option"
                iconClassName="sorting-icon"
                defaultValue={sortbyValue}
                options={sortingOptions}
                onSorting={handleSorting}
              />
            )}
          </div>
        </div>
      </div>

      <div
        className="container-fluid container-results"
        aria-live="assertive"
        aria-busy={loading ? "true" : "false"}
      >
        {cnt > 0 && (!loading || cpn) && (
          <Pagination
            rpp={rpp}
            ppg={ppg}
            rcnt={cnt}
            current={pn}
            loading={loading}
            selectPage={
              ksOnly
                ? (pnum: number) => handleKOSearch(initKeyword, pnum)
                : (pnum: number) => handleSearch(initKeyword, initBounds, pnum)
            }
          />
        )}
        {loading ? (
          <div className="col-12 col-beat-loader">
            <BeatLoader color="#515aa9" />
          </div>
        ) : !Array.isArray(results) ||
          results.length === 0 ||
          results[0].id === undefined ? (
          <div className="col-12 col-search-message">{t("page.noresult")}</div>
        ) : (
          <div className="row row-results rowDivider">
            {results.map((result: SearchResult, mindex: number) => (
              <div
                key={result.id}
                className={
                  selected === result.id && open === true
                    ? "col-sm-12 searchResult selected"
                    : "col-sm-12 searchResult"
                }
              >
                <h3 className="searchTitle">{result.title}</h3>
                <div>
                  <p className="searchFields">
                    <strong>{t("page.organisation")}:</strong>{" "}
                    {result.organisation}
                  </p>
                  <p className="searchFields">
                    <strong>{t("page.published")}:</strong> {result.published}
                  </p>
                  <p className="searchDesc">
                    {result.description
                      .replace(/\\n\\n/g, " ")
                      .replace(/\\n/g, " ")
                      .substr(0, 240)}{" "}
                    {result.description
                      .replace(/\\n\\n/g, " ")
                      .replace(/\\n/g, " ").length > 240 ? (
                      <span>...</span>
                    ) : (
                      ""
                    )}
                  </p>
                  <div className="searchResultButtons">
                    <button
                      type="button"
                      className="btn btn-sm searchButton"
                      onClick={() => handleSelect(result.id)}
                      aria-label={result.id}
                      autoFocus={cpn && mindex === 0 ? true : false}
                    >
                      {selected === result.id && open === true
                        ? t("page.removefootprint")
                        : t("page.viewfootprint")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm searchButton"
                      onMouseUp={(e) => handleView(e, result.id, result.title)}
                      aria-label={result.title}
                    >
                      {t("page.viewrecord")}{" "}
                      <i className="fas fa-long-arrow-alt-right" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {cnt > 0 && (!loading || cpn) && (
          <Pagination
            rpp={rpp}
            ppg={ppg}
            rcnt={cnt}
            current={pn}
            loading={loading}
            selectPage={
              ksOnly
                ? (pnum: number) => handleKOSearch(initKeyword, pnum)
                : (pnum: number) => handleSearch(initKeyword, initBounds, pnum)
            }
          />
        )}
      </div>
      {!ksOnly && loading && <div className="searching-cover" />}
    </div>
  );
};

interface SearchParams {
  keyword: string;
  north: number;
  east: number;
  south: number;
  west: number;
  lang: string;
  min: number;
  max: number;
  theme?: string;
  org?: string;
  type?: string;
  spatial?: string;
  foundational?: "true";
  sort?: string;
  stac?: string;
  datetime?: string;
  bbox?: string;
}
interface KOSearchParams {
  keyword: string;
  keyword_only: "true" | "false";
  lang: string;
  min: number;
  max: number;
  theme?: string;
  org?: string;
  type?: string;
  foundational?: "true";
  sort?: string;
  spatial?: string;
  stac?: string;
  datetime?: string;
  bbox?: string;
}

interface SearchResult {
  row_num: number;
  id: string;
  coordinates: string;
  title: string;
  description: string;
  published: string;
  keywords: string;
  options: [];
  contact: [];
  created: string;
  spatialRepresentation: string;
  type: string;
  temporalExtent: unknown;
  graphicOverview: [];
  language: string;
  organisation: string;
  total: number;
}

export default GeoSearch;
