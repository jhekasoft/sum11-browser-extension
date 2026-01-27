import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.png';
import './App.css';
import { Article, getExplanation } from 'sum11';

function App() {
  // const [url, setUrl] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function getActiveTab() {
    let queryOptions = { active: true, currentWindow: true };
    let tabs = await chrome.tabs.query(queryOptions);
    return tabs[0].id;
  }

  async function searchArticle(keyword: string) {
    if (!keyword) {
      return;
    }

    setError(null);
    setIsLoading(true);

    getExplanation(keyword)
    .then(article => {
      setArticle(article);
    })
    .catch(error => {
      setError(error.message)
      console.log(error)
    }).finally(() => {
      setIsLoading(false);
    });
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
    if (!keyword) {
      return;
    }

    setError(null);
    setIsLoading(true);

    getExplanation(keyword)
    .then(article => {
      setIsLoading(false);

      if (!article?.url) {
        return;
      }
  
      // Open new tab
      chrome.tabs && chrome.tabs.create({url: article?.url, active: true});
    })
    .catch(error => {
      setError(error.message)
      console.log(error)
    }).finally(() => {
      setIsLoading(false);
    });
  }

  function clearHandler() {
    setKeyword('');
    setArticle(null);
    setError(null);
    setIsLoading(false);
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
          Словник української мови (СУМ-11)
        </p>
        { !isLoading && (
          <form onSubmit={submitFormHandler}>
            <input
              value={keyword}
              onChange={changeKeywordHandler}
              type="search"
              placeholder="Введіть чи виділіть слово"
              className="input styled-input"
              autoFocus
            />
            <button type="submit" className="btn styled-button" ref={refSubmitButtom}>Шукати</button>
            <button type="button" className="btn styled-button" title="Перейти за посиланням" onClick={submitLinkHandler}>🔗</button>
          </form>
        )}

        {/* Loader */}
        { isLoading && (
          <span className="loader"></span>
        )}

        {/* Error */}
        { error && (
          <div className="error">
            { error }
          </div>
        )}

        {/* Article */}
        { article && article.text && (
          <div className="article article-definition">
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
            href="https://jhekasoft.github.io/projects?utm_source=sum11-browser-extension&utm_medium=extension&utm_campaign=what-is-this"
            target="_blank"
            rel="noopener noreferrer"
          >
            Що це?
          </a>
        </p>
      </header>
    </div>
  );
}

export default App;
