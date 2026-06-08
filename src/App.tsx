import { useState } from "react";
import Homepage from "./pages/Homepage/Homepage";

function App() {
  const [page, setPage] = useState("base");

  return (
    <>
      {page !== "Home" && <button
        onClick={() => {
          setPage("Home");
        }}
      >
        Go To dashboard
      </button>}
      {page === "Home" && (
        <button
          onClick={() => {
            setPage("base");
          }}
        >
          Go Back
        </button>
      )}
      {page === "Home" && <Homepage />}
    </>
  );
}

export default App;
