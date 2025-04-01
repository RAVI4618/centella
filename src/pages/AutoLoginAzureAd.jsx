import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
 
const AutoRedirectToAzureB2C = () => {
    const { instance } = useMsal();
 
    useEffect(() => {
       
        instance.loginRedirect(loginRequest).catch((error) => {
            console.error("Login Redirect Error:", error);
        });
    }, [instance]);
 
    return null;
};
 
export default AutoRedirectToAzureB2C;