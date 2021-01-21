import React, { useState, createRef } from "react";
// reactstrap components
import {
  Button,
  Card,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import SearchIcon from '@material-ui/icons/Search';
import axios from "axios";
import BeatLoader from "react-spinners/BeatLoader";
import { css } from "@emotion/core";

const KeywordSearch = () => {
  const inputRef = createRef();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState("search");
  const [open, setOpen] = useState(false);
  //const [initKeyword, setKeyword] = useState("");
  const [modal, setModal] = useState(false);  
   
  const handleSelect = (event) => {
    //const {selectResult} = this.props;  
    const cardOpen = selected === event ? !open : true;
    const result = Array.isArray(results) && results.length>0 && cardOpen ? results.find(r=>r.id===event): null;
    
    setSelected(event);
    setOpen(cardOpen);
  };

  const handleModal = () => {
    setModal(!modal);
  };

  const handleSearch = (keyword) => {
    setLoading(true);  
    
    const searchParams = {
        keyword: keyword,
        keyword_only: 'true',
        lang: 'en'
    }
    //console.log(searchParams);
    axios.get("https://hqdatl0f6d.execute-api.ca-central-1.amazonaws.com/dev/geo", { params: searchParams})
    .then(response => response.data)
    .then((data) => {
        console.log(data);
        const results = data.Items;
        setResults(results);
        //setKeyword(keyword);
        setLoading(false);
    })
    .catch(error=>{
        console.log(error);
        setResults([]);
        //setKeyword(keyword);
        setLoading(false);
    });
    
  }; 

  const handleSubmit = (event) => {
    if (event) {
        event.preventDefault();
    }
    const keyword = inputRef.current.value; 
    handleSearch(keyword);
  };

  return (
        <div className="pageContainer">
        <h1>NRCan GEO Keyword Search</h1>
        <div className="searchInput">
            <input
                placeholder="Search ..."
                id="search-input"
                type="search"
                ref={inputRef}
                disabled = {loading}
                //onChange={this.handleChange}
            />
            <button className="icon-button" disabled = {loading} type="button" onClick={!loading ? handleSubmit : null}><SearchIcon /></button>
        </div>
        <div className="container">
            {loading ?
                <div className="d-flex justify-content-center">
                <BeatLoader
                color={'#0074d9'}
                />
                </div>
                :
                (!Array.isArray(results) || results.length===0 || results[0].id===undefined ? 
                (Array.isArray(results) && results.length===0 ? 'Input keyword to search' : 'No result') : 
                results.map((result) => (  
                <div className="row" key={result.id}>
                    <div className="col-lg-12 d-flex align-items-stretch">
                    <Card className="p-0 col-lg-12">
                    {(selected === result.id && open === true ?
                    <div>
                        <div onClick={() => handleSelect(result.id)}>
                            <h6 className="text-left font-weight-bold pt-2 pl-2">{result.title}</h6>
                            <p className="text-left pt-2 pl-2">{result.description.substr(0,240)} <span onClick={handleModal}>...show more</span></p>
                            <p className="text-left pt-1 pl-2"><strong>Organisation: </strong>{result.organisation}</p>
                            <p className="text-left pl-2"><strong>Published: </strong>{result.published}</p>
                            <p className="text-left pl-2"><strong>Keywords: </strong>{result.keywords.substring(0, result.keywords.length - 2)}</p>
                        </div>
                        <div className="pt-2 pl-2 pb-3"><Button color="primary" size="sm" className="on-top" onClick={handleModal}>Show Metadata</Button></div>
                        <Modal isOpen={modal} toggle={handleModal}>
                        <ModalHeader toggle={handleModal}>{result.title}</ModalHeader>
                        <ModalBody>
                            <p><strong>Description:</strong></p>
                            <p>{result.description}</p>
                            <p><strong>Organisation:</strong> {result.organisation}</p>
                            <p><strong>Published:</strong> {result.published}</p>
                            <p><strong>Keywords:</strong> {result.keywords.substring(0, result.keywords.length - 2)}</p>
                        </ModalBody>
                        <ModalFooter>
                            <a href={`https://cgp-meta-l1-geojson-dev.s3.ca-central-1.amazonaws.com/` + result.id + `.geojson`} target="_blank" ><Button color="primary">View Full Metadata</Button></a>{' '}
                            <Button color="secondary" onClick={handleModal}>Close</Button>
                        </ModalFooter>
                        </Modal>
                    </div>
                    :
                    <div onClick={() => handleSelect(result.id)}>
                        <h6 className="text-left font-weight-bold pt-2 pl-2">{result.title}</h6>
                        <p className="text-left pt-2 pl-2 text-truncate">{result.description}</p>
                    </div>
                    )}
                    <div className="p-1 text-center">
                        <small onClick={() => handleSelect(result.id)}>
                        {selected === result.id && open === true ? "Click to Close":"Click for More" }
                        </small>
                    </div>
                    </Card>
                </div>
                </div>
                )))
            }
        </div>
        </div>
    );
}

export default KeywordSearch;
