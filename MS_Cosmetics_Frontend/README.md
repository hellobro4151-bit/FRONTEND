# MS Cosmetics – Frontend

## Run
1. Install Node.js LTS.
2. Open this folder in VS Code.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the Vite URL shown in the terminal (usually http://localhost:5173).

## Backend connection
The frontend sends API requests to `/api`. The supplied `vite.config.js` proxies these requests to `http://localhost:5000`.
Run the backend separately in another terminal. Keep the backend running while using login, product loading, checkout, contact and newsletter features.
