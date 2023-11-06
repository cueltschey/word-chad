import { useEffect, useState } from 'react';
import './App.css'
import key from '../key.json'

const App = () => {
  const [highlightedText, setHighlightedText] = useState("");
  const [isValid, setIsValid] = useState(true)
  const [pronounciation, setPronounciation] = useState("")
  const [definitions, setDefinitions] = useState([""])
  const [usages, setUsages] = useState([""])

  useEffect(() => {
    const getHighlightedText = (tab: any) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if(window.getSelection()){
            return window.getSelection()?.toString().split(" ")[0]
          }
          else{
            return ""
          }
        },
      },
      (result) => {
        let text : string | undefined = ""
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          text = result[0].result
          if(text != undefined){
              setHighlightedText(text)
              console.log(text)
            }
          const apiUrl = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${text}?key=${key.keys[0]}`;
    console.log(highlightedText)
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPronounciation(data[0].hwi.prs[0].mw);
          setDefinitions(data[0].shortdef)
          setUsages(data[0].meta.stems)
          if(usages.length < 1 || definitions.length < 1) setIsValid(false)
        } else {
          setIsValid(false)
        }
      })
      .catch(error => {
        console.error(error);
        setIsValid(false)
      });

        }
      });
    };


    // query the page for highlightedText
    try{
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs) {
        const tab = tabs[0];
        getHighlightedText(tab);
      } else {
        console.error("Unable to retrieve the current tab.");
      }
    });
  }catch(error){console.error("must have highlighted text"), setIsValid(false)}}, []); 


  return (
  <div className="main">
      {isValid? <div></div> : <div className='errormsg'>Error: word not found</div>}
      <h2>Word Chad</h2>
      <div className='wordwrap'>
        <div>{highlightedText === ""? "no highlighted text" : highlightedText}</div>
        <div>{pronounciation === ""? "invalid" : pronounciation}</div>
      </div>
      <div className='list'>
        {definitions.map((definition: string) => ( 
          <li>{definition}</li>
        ))}
      </div> 
      <div className='list'>
        {usages.slice(0,5).map((usage: string) => (
          <li>{usage}</li>
        ))}
      </div>
    </div>
  )
}

export default App
