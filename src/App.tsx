import React, { useEffect, useState } from 'react';
import logo from './logo.png';
// import logo from './sum11.jpg';
import './App.css';

function App() {
  // const [url, setUrl] = useState<string>('');
  const [keyword, setKeyword] = useState('');

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();

    // Open new tab
    chrome.tabs && chrome.tabs.create({url: `http://sum.in.ua/?swrd=${keyword}`, selected: true, active: true});
  }

  async function getActiveTab() {
    let queryOptions = { active: true, currentWindow: true };
    let tabs = await chrome.tabs.query(queryOptions);
    return tabs[0].id;
  }

  /**
 * Get current URL
 */
  useEffect(() => {
    const fetchData = async () => {
      const tabId = await getActiveTab();
      chrome.scripting && tabId && chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const selection = window.getSelection();
          return selection ? selection.toString() : "";
        }
      }, (res) => {
        if (res.length) {
          setKeyword(res[0].result);
        }
      });
    }

    fetchData().catch(console.error);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          СУМ-11. Словник української мови
        </p>
        <form onSubmit={submitForm}>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            type="text"
            placeholder="Введіть чи виділіть слово"
            className="input"
            autoFocus
          />
          <button type="submit" className="btn">Шукати</button>
        </form>
        <p>
          <a
            className="App-link"
            href="https://efremov.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            efremov.dev
          </a>
        </p>
      </header>
    </div>
  );
}

export default App;
