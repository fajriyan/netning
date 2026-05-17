import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import NotFound from "./pages/error/NotFound";
import SpeedTestPage from "./pages/SpeedTest/SpeedTestPage";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<SpeedTestPage />} />
        <Route path="/ip" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
