import React, { useState, useEffect } from "react";
import { Link, useLocation,useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { useMsal } from "@azure/msal-react";
import { currentWorkflow } from "../../utils/Store";
import '../../styles/editor.css';
import '../../styles/components.css';
import logo from './../../images/Centella Logo 1.png';
import profile from '../../images/user-3-line.png'
import dashboard from '../../images/dashboard-line.png'
import admet from '../../images/capsule-fill.png'
import retro from '../../images/flask-line.png'
import genchem from '../../images/ai-generate.png'
import virtual from '../../images/filter-2-line.png'
import notifications from '../../images/notification-2-line.png'
import logout from '../../images/logout-circle-r-line.png'
import { logDOM } from "@testing-library/react";
 
const SideNav = () => {
  const { instance, inProgress } = useMsal();
  const currentWflow = useAtomValue(currentWorkflow);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);
 
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);
 
  const getLinkClasses = (path) => {
    if (activeLink.includes(path) || activeLink === path) {
      return "bg-[#7364AD] rounded-[50px] text-white font-semibold";
    } else if (activeLink === '/' && path === '/dashboard') {
      return "bg-[#7364AD] rounded-[50px] text-white font-semibold";
    } else {
      return "bg-[#FCFCFC] shadow-custom text-[#4A5568]";
    }
  };
 
  const handleLogoutRedirect= () => {
    instance.logoutRedirect();
  };
 
 
  return (
    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 bg-[#FCFCFC] shadow-custom">
      <div className="px-4">
        <a className="left-13 top-6 absolute justify-center items-center gap-2 inline-flex" href="/">
          <img
            src={logo}
            // style={{ height: '56px', width: '60px' }}
            className="h-12 w-10"
            alt="author"
          />
          <div className="heading-centella font-segoe tracking-[1.52px]  text-[#89AF3E] text-[19px] font-bold leading-9">
            CENTELLA
          </div>
        </a>
      </div>
      <div className="bg-[#FCFCFC] px-3 shadow-custom mt-16 w-full top-12 relative">
          {/* Dashboard Section */}
 
          <div className="px-3">
          <h3 className="text-xs font-bold text-[#735AA7] mt-6 mb-2">DASHBOARD</h3>
            <div className={getLinkClasses("/userProfileDetails")}>
          <Link to="/userProfileDetails" className="flex text-md items-center pl-4 sm:pl-12 py-3 pointer-events-none text-gray-400  ">
         
            <img
              src={profile}
              alt="user Icon"
              className="mr-2  h-6"
              style={{ height: '22px' }}
            />
            <div className="leading-normal text-sm font-segoe font-regular">
              Profile
            </div>
          </Link>
        </div>
        <div className={getLinkClasses("/dashboard")}>
          <Link to="/dashboard" className="flex text-md items-center pl-4 sm:pl-12 py-3">
            <img
              src={dashboard}
              alt="user Icon"
              className="mr-2  h-6"
              style={{ height: '22px' }}
            />
            <div className="leading-normal text-sm font-segoe font-regular">
              Overview
            </div>
          </Link>
        </div>
          </div>
 
      <div className="px-3">
      <h3 className="text-xs font-bold text-[#735AA7] mt-6 mb-2">HIT TO LEAD</h3>
      <div className={getLinkClasses('/admet')}>
          <Link to="/admet" className="flex text-md items-center pl-4 sm:pl-12 py-3 pointer-events-none text-gray-400  ">
            <img
              src={admet}
              alt="Projects Icon"
              className="mr-2"
              style={{ height: '20px' }}
            />
            <div className="leading-normal text-md mb-1  font-segoe ">
              ADMET
            </div>
          </Link>
        </div>
        <div className={getLinkClasses('/retrosynthesis')}>
          <Link to="/retrosynthesis" className="flex text-md items-center pl-4 sm:pl-12 py-3">
            <img
              src={retro}
              alt="Help Icon"
              className="mr-2"
              style={{ height: '20px' }}
            />
            <div className="leading-normal mb-1 text-sm font-segoe font-regular">
              Retro Synthesis
            </div>
          </Link>
        </div>
        <div className={getLinkClasses('/generativeai')}>
          <Link to="/generativeai" className="flex text-md items-center pl-4 sm:pl-12 py-3 pointer-events-none text-gray-400 ">
            <img
              src={genchem}
              alt="Settings Icon"
              className="mr-2 h-3.5"
              style={{ height: '24px' }}
            />
            <div className="leading-normal text-sm font-segoe font-regular">
              GenChem AI
            </div>
          </Link>
        </div>
        <div className={getLinkClasses('/virtualscreening')}>
          <Link to="/virtualscreening" className="flex text-md items-center pl-4 sm:pl-12 py-3 pointer-events-none text-gray-400 ">
            <img
              src={virtual}
              alt="Virtual Screening Icon"
              className="mr-2 h-3.5"
              style={{ height: '22px' }}
            />
            <div className="leading-normal text-sm font-segoe font-regular">
              Virtual Screening
            </div>
          </Link>
        </div>
      </div>
      <div className="px-3">
      <h3 className="text-xs font-bold text-[#735AA7] mt-6 mb-2">ACCOUNT</h3>
      <div className={getLinkClasses('/notifications')}>
          <Link to="/notifications" className="flex text-md items-center pl-4 sm:pl-12 py-3 pointer-events-none text-gray-400 ">
            <img
              src={notifications}
              alt="Notifications Icon"
              className="mr-2  h-6"
              style={{ height: '22px' }}
            />
            <div className="leading-normal  text-sm font-segoe font-regular">
              Notifications
            </div>
          </Link>
        </div>
        <div className={getLinkClasses('/logout')}>
          <Link to="/logout" className="flex text-md items-center pl-4 sm:pl-12 py-3 pointer-events-none text-gray-400 ">
            <img
              src={logout}
              alt="Notifications Icon"
              className="mr-2 h-3.5"
              style={{ height: '20px' }}
            />
            <div onClick={handleLogoutRedirect} className="leading-normal text-sm font-segoe font-regular">
              Logout
            </div>
          </Link>
        </div>
 
      </div>
      </div>
    </div>
  );
}
 
export default SideNav;
 
 
 
 
 
 
 
 