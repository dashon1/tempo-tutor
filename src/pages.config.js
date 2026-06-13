import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Repertoire from './pages/Repertoire';
import Settings from './pages/Settings';
import Routines from './pages/Routines';
import Insights from './pages/Insights';
import PieceDetail from './pages/PieceDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Practice": Practice,
    "Repertoire": Repertoire,
    "Settings": Settings,
    "Routines": Routines,
    "Insights": Insights,
    "PieceDetail": PieceDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};