import { useEffect } from "react";

import AppRoutes from "./routes";
import { pedirArmazenamentoPersistente } from "./utils/backup";

function App() {
  useEffect(() => {
    pedirArmazenamentoPersistente();
  }, []);

  return <AppRoutes />;
}

export default App;
