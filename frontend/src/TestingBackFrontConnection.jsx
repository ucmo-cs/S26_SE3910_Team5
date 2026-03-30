import { useEffect, useState } from "react";

export default function TestConnection() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed: " + response.status);
        }
        return response.json();
      })
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  return (
    <div>
      <h2>Backend Test</h2>
      <button
        onClick={() => {
          fetch("http://localhost:8080/branches", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              branchName: "Frontend Branch",
              address: "123 React St"
            }),
          })
            .then((res) => res.json())
            .then((data) => console.log("Created:", data))
            .catch((err) => console.error(err));
        }}
      >
        Create Branch
      </button>
      {error && <p>Error: {error}</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}