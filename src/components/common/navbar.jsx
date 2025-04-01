
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { b2cPolicies } from '../../authConfig';
import React from "react";
import { useState } from "react";
import { IoMdSearch, IoIosNotificationsOutline } from "react-icons/io";
import {
  TEDropdown,
  TEDropdownToggle,
  TEDropdownMenu,
  TEDropdownItem,
  TERipple,
} from "tw-elements-react";
import CreateProjectPopup from '../CreateProjectPopup'
import { FaRegUser, FaChevronDown } from 'react-icons/fa';
import '../../styles/editor.css'
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const { instance, inProgress } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const [showCreateProjectPopup, setShowCreateProjectPopup] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate()
  const handleLogoutRedirect = () => {
    instance.logoutRedirect();
  };

  const handleProfileEdit = () => {
    if (inProgress === InteractionStatus.None) {
      instance.acquireTokenRedirect(b2cPolicies.authorities.editProfile);
    }
  };

  const toggleCreateProjectPopup = () => {
    setShowCreateProjectPopup(!showCreateProjectPopup);
  };

  const handleNavigateToProfile = () => {
    navigate('/userProfileDetails');
  };

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  return (
    <>
      <div className="w-5/6 z-50 h-[91px] left-[16.8%] top-0 fixed bg-[#FCFCFC] opacity-1">
        <div className="flex flex-auto">
          <form className="relative mt-6 ml-8 flex  rounded-md flex-wrap items-stretch xl:mx-0 w-203px border border-0.5 border-solid border-gray-300 shadow-custom rounded-5 opacity-1">
            <IoMdSearch className="text-2xl m-2" />
            <input
              autoComplete="off"
              type="search"
              className="w-[600px] rounded-sm relative m-0 inline-block bg-transparent w-203px bg-clip-padding px-3 py-2 text-base font-normal text-gray-700 transition duration-300 ease-in-out focus:border-primary-600 focus:text-gray-700 focus:shadow-te-primary focus:outline-none dark:text-gray-200 dark:placeholder:text-gray-200"
              // className="w-[600px] rounded-md relative m-0 inline-block  bg-transparent w-203px bg-clip-padding px-3 py-2 text-base font-normal text-gray-700 transition duration-300 ease-in-out focus:border-primary-600 focus:text-gray-700 focus:shadow-te-primary focus:outline-none dark:text-gray-200 dark:placeholder:text-gray-200"
              // className="w-[600px] rounded-sm relative m-0 inline-block bg-transparent w-203px bg-clip-padding px-3 py-2 text-base font-normal text-gray-700 transition duration-300 ease-in-out focus:border-primary-600 focus:text-gray-700 focus:shadow-te-primary focus:outline-none dark:text-gray-200 dark:placeholder:text-gray-200"
              placeholder="Search"
            />
          </form>
          <ul className="absolute pr-24 right-0 flex items-center">
            <li className="px-2 mt-5">
              {/* <button className="bg-[#735AA7] text-white px-5 mr-8 py-2 rounded-[7px]" onClick={toggleCreateProjectPopup}>+ Add Project</button>
              <button className=" text-white px-5 mr-8 py-2 rounded-[7px]"  style={{backgroundColor:'#4E8FAB'}} onClick={toggleCreateProjectPopup}>+ Add Project</button> */}
              {/* <button className="bg-[#735AA7] text-white px-5 mr-8 py-2 rounded-[7px]" onClick={toggleCreateProjectPopup}>+ Add Project</button> */}
            </li>
            <li className="relative p-1 mt-4" data-te-dropdown-ref>
              <a
                className="flex items-center text-gray-500 hover:text-gray-700 focus:text-gray-700"
                href="#"
                id="navbarDropdownMenuLink"
                role="button"
                data-te-dropdown-toggle-ref
                aria-expanded="false"
              >
                <div className="relative">
                  {/* Notification Icon */}
                  <div
                    className=" pointer-events-none"
                    onClick={toggleModal}
                    onMouseEnter={() => setShowModal(true)} // Hover to show the modal


                  >
                    <Link to="/notifications">
                      <IoIosNotificationsOutline className="dark:text-gray-200 text-4xl" />
                    </Link>
                  </div>




                </div>
                <span className="absolute -mt-4 ml-4 rounded-full bg-red-600 px-1.5 py-[1px] text-[0.6rem] text-white">
                  1
                </span>
              </a>
              <ul
                className="absolute left-auto right-0 z-[1000] float-left m-0 mt-1 hidden min-w-[10rem] list-none overflow-hidden rounded-lg border-none bg-white bg-clip-padding text-left text-base shadow-lg dark:bg-zinc-700 [&[data-te-dropdown-show]]:block"
                aria-labelledby="navbarDropdownMenuLink"
                data-te-dropdown-menu-ref
              >
                <li>
                  <a
                    className="block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal text-gray-700 hover:bg-gray-100 active:text-zinc-800 active:no-underline disabled:pointer-events-none disabled:bg-transparent disabled:text-gray-400 dark:text-gray-200 dark:hover:bg-white/30"
                    href="#"
                    data-te-dropdown-item-ref
                  >
                    Some news
                  </a>
                </li>
                <li>
                  <a
                    className="block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal text-gray-700 hover:bg-gray-100 active:text-zinc-800 active:no-underline disabled:pointer-events-none disabled:bg-transparent disabled:text-gray-400 dark:text-gray-200 dark:hover:bg-white/30"
                    href="#"
                    data-te-dropdown-item-ref
                  >
                    Another news
                  </a>
                </li>
                <li>
                  <a
                    className="block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal text-gray-700 hover:bg-gray-100 active:text-zinc-800 active:no-underline disabled:pointer-events-none disabled:bg-transparent disabled:text-gray-400 dark:text-gray-200 dark:hover:bg-white/30"
                    href="#"
                    data-te-dropdown-item-ref
                  >
                    Something else here
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <TEDropdown className="flex items-center pl-2 ">
                <TERipple rippleColor="light">
                  <TEDropdownToggle className="pt-4 pl-2 flex items-center" >
                    <span className="user-icon ml-4 text-2xl border-2 rounded-full w-10 h-10 flex items-center justify-center">
                      <FaRegUser />
                    </span>
                    <span className="ml-2 text-sm font-medium">
                      {activeAccount?.name}
                    </span>
                    <span className="ml-2 text-sm">
                      <FaChevronDown />
                    </span>
                  </TEDropdownToggle>
                </TERipple>
                <TEDropdownMenu>
                  <TEDropdownItem as="button" onClick={handleProfileEdit}>
                    <div className="block w-full min-w-[160px] cursor-pointer whitespace-nowrap bg-transparent px-4 py-2 text-sm text-left font-normal pointer-events-auto text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 active:bg-neutral-100 focus:bg-neutral-100 focus:text-neutral-800 focus:outline-none active:no-underline dark:text-neutral-200 dark:hover:bg-neutral-600 dark:focus:bg-neutral-600 dark:active:bg-neutral-600">
                      {activeAccount?.name}<br /> <span className="text-xs text-gray-400">User</span>
                    </div>
                  </TEDropdownItem>
                  <TEDropdownItem as="button" onClick={handleNavigateToProfile}>
                    <div
                      href="#"
                      className="block w-full min-w-[160px]  cursor-pointer whitespace-nowrap bg-transparent px-4 py-2 text-sm text-left font-normal pointer-events-none text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 active:bg-neutral-100 focus:bg-neutral-100 focus:text-neutral-800 focus:outline-none active:no-underline dark:text-neutral-200 dark:hover:bg-neutral-600 dark:focus:bg-neutral-600 dark:active:bg-neutral-600"
                    >
                      Profile
                    </div>
                  </TEDropdownItem>
                  <TEDropdownItem as="button" onClick={handleLogoutRedirect}>
                    <div
                      className="block w-full min-w-[160px] cursor-pointer whitespace-nowrap bg-transparent px-4 py-2 text-sm text-left font-normal pointer-events-auto text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 active:bg-neutral-100 focus:bg-neutral-100 focus:text-neutral-800 focus:outline-none active:no-underline dark:text-neutral-200 dark:hover:bg-neutral-600 dark:focus:bg-neutral-600 dark:active:bg-neutral-600"
                    >
                      Logout
                    </div>
                  </TEDropdownItem>
                </TEDropdownMenu>
              </TEDropdown>
            </li>
          </ul>
          {showCreateProjectPopup && (
            <CreateProjectPopup onClose={toggleCreateProjectPopup} />
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
