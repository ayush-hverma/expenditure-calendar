# AeroBot & Expenditure Calendar & pyutils

This repository contains three separate projects: AeroBot, an application leveraging RAG (Retrieval-Augmented Generation) for question answering; Expenditure Calendar, a tool for tracking and visualizing personal expenses; and pyutils, a collection of Python utility functions. The target audience includes developers interested in RAG-based applications, personal finance management, and reusable Python code.

## Features

### AeroBot Features

1.  **Web Scraping:** Scrapes data from specified URLs using the `scraper.py` module.
2.  **Vector Store Creation:** Creates and manages a vector store using the `vectorstore.py` module.
3.  **RAG Chain Implementation:** Implements a Retrieval-Augmented Generation (RAG) chain for question answering using `rag_chain.py`.
4.  **Streamlit Frontend:** Provides a user interface built with Streamlit in `streamlit_app.py`.

### Expenditure Calendar Features

1.  **Frontend UI:** Provides a user interface for the expenditure calendar using React in `frontend/src/App.jsx`.
2.  **Backend API:** Exposes a backend API using Node.js in `backend/server.js`.

### pyutils Features

1.  **Data Utilities:** Provides utility functions for data manipulation in `data_utils.py`.
2.  **Date Utilities:** Offers utility functions for date-related operations in `date_utils.py`.
3.  **File Utilities:** Includes utility functions for file system operations in `file_utils.py`.
4.  **Logging:** Implements a logging mechanism in `logger.py`.
5.  **Math Utilities:** Provides mathematical utility functions in `math_utils.py`.
6.  **String Utilities:** Offers utility functions for string manipulation in `string_utils.py`.

## Deployment

### Expenditure Calendar Architecture

*   **Backend:** Node.js
*   **Frontend:** React
*   **Frontend Build Output:** The `frontend` directory contains the React application source code.

### Expenditure Calendar Deployment Instructions

*   **Backend:**
    ```bash
    cd expenditure-calendar/backend
    npm install
    npm start
    ```
*   **Frontend:**
    ```bash
    cd expenditure-calendar/frontend
    npm install
    npm run dev
    ```

## Credentials

Credentials are not explicitly defined in the provided code snippets.

## Clients

No specific clients are identified in the provided repository context.