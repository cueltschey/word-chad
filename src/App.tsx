import { useEffect, useState } from 'react';
import './App.css'
import key from '../key.json'

const App = () => {
  const [highlightedText, setHighlightedText] = useState('humiliating');


  const apiUrl = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${highlightedText}?key=${key.keys[0]}`;
  const [isValid, setIsValid] = useState(true)
  const [pronounciation, setPronounciation] = useState("")
  let definitions: string[] = [] 
  let usages: string[] = []

  function getData(){
    console.log("fetching")
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPronounciation(data[0].hwi.prs[0].mw);
          const results = data[0].shortdef;
           for(var definitionObject in results){
            definitions.push(definitionObject);
            }
          for(var usageObject in results){
            usages.push(usageObject);
            }
          if(usages.length < 1 || definitions.length < 1) setIsValid(false)
        } else {
          setIsValid(false)
        }
      })
      .catch(error => {
        console.error('Error fetching pronunciation:', error);
        setIsValid(false)
      });
  }
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
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          let text : string | undefined = result[0].result
          if(text) setHighlightedText(text);
          getData()
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


  //testing
  getData()
  console.log(definitions)
  console.log(usages)
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
        {usages.map((usage: string) => (
          <li>{usage}</li>
        ))}
      </div>
    </div>
  )
}

export default App
