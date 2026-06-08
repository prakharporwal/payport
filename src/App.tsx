import { useState } from "react";
import Homepage from "./pages/Homepage/Homepage";

function App() {
  const [page, setPage] = useState("base");

  return (
    <>
       <Homepage />
    </>
  );
}

export default App;
