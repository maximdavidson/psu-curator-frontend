import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch("http://localhost:8080/WeatherForecast");
        const newData = await resp.json();

        setData(newData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  });
  return (
    <>
      <p>hello</p>
      {data}
    </>
  );
}

export default App;
