import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.png';
// import logo from './sum11.jpg';
import './App.css';
import { getExplanation } from './ukr-dict-parser';
import { Article } from './ukr-dict-parser/interfaces/Article';

function App() {
  // const [url, setUrl] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [article, setArticle] = useState<Article | null>(null);

  async function getActiveTab() {
    let queryOptions = { active: true, currentWindow: true };
    let tabs = await chrome.tabs.query(queryOptions);
    return tabs[0].id;
  }

  async function searchArticle(keyword: string) {
    if (!keyword) {
      return;
    }

    const article = await getExplanation(keyword);
    setArticle(article);
  }

  async function submitFormHandler(event: React.FormEvent<HTMLFormElement>) {
    // Preventing the page from reloading
    event.preventDefault();

    searchArticle(keyword);
  }

  function changeKeywordHandler(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.value) {
      clearHandler();
    }

    setKeyword(event.target.value);
  }

  async function submitLinkHandler() {
    // Open new tab
    chrome.tabs && chrome.tabs.create({url: `http://sum.in.ua/?swrd=${keyword}`, active: true});
  }

  function clearHandler() {
    setKeyword('');
    setArticle(null);
  }

  function alternativeClickHandler(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    event.preventDefault();

    const keyword = event.currentTarget.innerText;
    setKeyword(keyword);
    searchArticle(keyword);
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
      }, async (res) => {
        if (res.length) {
          const selectedText = res[0]?.result;
          setKeyword(selectedText);
          searchArticle(selectedText)
        }
      });
    }

    fetchData().catch(console.error);
  }, []);

  const refSubmitButtom = useRef<HTMLButtonElement>(null);

  return (
    <div className="App">
      <header className="App-header">
        { !article && (
          <img src={logo} className="App-logo" alt="logo" />
        )}
        <p>
          СУМ-11. Словник української мови
        </p>
        <form onSubmit={submitFormHandler}>
          <input
            value={keyword}
            onChange={changeKeywordHandler}
            type="search"
            placeholder="Введіть чи виділіть слово"
            className="input"
            autoFocus
          />
          <button type="submit" className="btn" ref={refSubmitButtom}>Шукати</button>
          <button type="button" className="btn" title="Перейти за посиланням" onClick={submitLinkHandler}>🔗</button>
        </form>

        {/* Article */}
        { article && article.text && (
          <div className="article">
            { article.text }
          </div>
        )}

        {/* Alternatives */}
        { article && article.alternatives && (
          <div className="article">
            <p>Слово не знайдено. Але є варіанти. Можливо ви шукали:</p>
            <ul>
              { article.alternatives.map(alternative =>
                <li>
                  <a
                    key={alternative}
                    className="alternatives-link"
                    href="#"
                    onClick={alternativeClickHandler}
                  >
                    {alternative}
                  </a>
                </li>
              ) }
            </ul>
          </div>
        )}
        
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
