import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
 
import SideNav from './sidenav';
 
import Navbar from './navbar';
import { Outlet } from 'react-router-dom';
import Login from '../../pages/Login';
import AutoRedirectToAzureB2C from '../../pages/AutoLoginAzureAd';
 
 
export const PageLayout = () => {
 
    return (
        <>
            <>
 
                <AuthenticatedTemplate>
                    <div className="flex flex-row h-screen overflow-hidden bg-[#F4F4F4]">
                        <div className=' basis-1/6 bg-[#FCFCFC] '>
                            <SideNav />
                        </div>
                        <div className="basis-5/6 ">
                            <Navbar />
                            {/* {JSON.stringify(props.account)} */}
                            {/* added bg-#F4F4F4 for this layout */}
                            <div className='mt-2 relative top-20 p-3 rounded-2xl bg-[#F4F4F4] h-[89vh] overflow-y-auto'>
                                <Outlet />
                            </div>
                        </div>
                    </div>
 
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    {/* <Login/> */}
                    <AutoRedirectToAzureB2C />
                </UnauthenticatedTemplate>
            </>
 
        </>
    );
}










