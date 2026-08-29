import { Outlet } from "react-router-dom";
import { GlobalProgressBar } from "./components/GlobalProgressBar";

// The single ancestor of every route (see main.tsx) — whatever needs to be
// present on literally every page (the loading bar today, maybe a toast
// host or a command palette tomorrow) belongs here, not duplicated per page.
export default function RootLayout() {
  return (
    <>
      <GlobalProgressBar />
      <Outlet />
    </>
  );
}
