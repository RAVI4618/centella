import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { EventType } from "@azure/msal-browser";
import { PageLayout } from "./components/common/PageLayout";
import { Home } from "./pages/Home";
import { b2cPolicies, protectedResources } from "./authConfig";
import { compareIssuingPolicy } from "./utils/claimUtils";
import 'react-toastify/dist/ReactToastify.css';
import "./styles/App.css";
import { Toaster } from "sonner";
import AdmetPage from "./pages/AdmetPage";
import RetrosynthesisPage from "./pages/RetrosynthesisPage";
import GenerativeAIPage from "./pages/GenerativeAIPage";
import VirtualScreeningPage from "./pages/VirtualScreeningPage";
import Retrosynthesis from "./pages/bkp/Retrosynthesis";
import SettingsPaage from "./pages/SettingsPage";
import projectDetailsAndHistory from "./pages/bkp/ProjectDetailAndHistoy";
import Projects from "./pages/bkp/Projects";
import ProjectRoutes from "./pages/bkp/ProjectRoutes";
import GemChemProjectList from "../src/components/gem-chem/genChemProjectList"
import NewProject from "./components/NewProject";
import Results from "./components/retro/RetroResultPage";
import ComparisonPage from "./pages/bkp/ComparisonPage";
import GemChemValidateProtien from "./pages/gen-chem/GemChemValidateProtien";
import GenChemSelectMolecule from "./pages/gen-chem/GemChemSelectMolecule";
import GenChemResults from "./pages/gen-chem/GenChemResults";
import GenChemSmilesAndTargetsTable from "./pages/gen-chem/GenChemSmilesAndTargetsTable";
import AdmetRoutes from "./pages/bkp/AdmetRoutes";
import AdmetProjects from "./pages/bkp/AdmetProjects";
import RetroResultPage from "./components/retro/RetroResultPage";
import RetroProjects from "./pages/bkp/RetroProjects";
import RetroSingleTypeStatic from "./components/retro/RetroVendor";
import ProjectDetailsAndHistory from "./pages/bkp/ProjectDetailAndHistoy";
import UserProfileDetails from "./pages/UserProfileDetails"
import ProjectDetailsAndHistoryAdmet from "./pages/bkp/ProjectDetailAndHistoryAdmet";
import ProjectDetailsAndHistoryAGenChem from "./pages/bkp/ProjectDetailsAndHistoryGenChem";
import ProjectDetails from "./pages/ProjectDetails";
import PredictRouteComponent from "./components/retro/PredictRouteComponent";
import PredictComponent from "./components/admet/PredictComponent";
import AdmetResultPage from "./components/admet/AdmetResultPage";
import TargetsTable from "./components/gem-chem/targetsTable";
import SmilesTable from "./components/gem-chem/smilesTable";
import VirtualScreeningStaticPage from "./pages/VirtualScreeningStaticPage";
import VirtualScreeningResults from "./pages/VirtualScreenStaticResults";
import RetroVendorScreen from "./components/retro/RetroVendor";
import Notifications from "./pages/Notifications";
import SmilesAndTargetsTable from "./pages/gen-chem/GenChemSmilesAndTargetsTable";
import RetroUploadResults from "./components/RetroUploadResults";
import UploadedFileStrings from "./components/UploadedFileSmiles";
import PropertiesTable from "./components/admet/AdmetFullscreen";




const Pages = () => {

  /**
   * useMsal is hook that returns the PublicClientApplication instance,
   * an array of all accounts currently signed in and an inProgress value
   * that tells you what msal is currently doing. For more, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
   */
  const { instance } = useMsal();
  useEffect(() => {
    const callbackId = instance.addEventCallback((event) => {
      if (
        (event.eventType === EventType.LOGIN_SUCCESS ||
          event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
        event.payload.account
      ) {
        if (
          compareIssuingPolicy(
            event.payload.idTokenClaims,
            b2cPolicies.names.editProfile
          )
        ) {
          // retrieve the account from initial sing-in to the app
          const originalSignInAccount = instance
            .getAllAccounts()
            .find(
              (account) =>
                account.idTokenClaims.oid === event.payload.idTokenClaims.oid &&
                account.idTokenClaims.sub === event.payload.idTokenClaims.sub &&
                compareIssuingPolicy(
                  account.idTokenClaims,
                  b2cPolicies.names.signUpSignIn
                )
            );

          let signUpSignInFlowRequest = {
            authority: b2cPolicies.authorities.signUpSignIn.authority,
            account: originalSignInAccount,
          };

          // silently login again with the signUpSignIn policy
          instance.ssoSilent(signUpSignInFlowRequest);
        }

        if (
          compareIssuingPolicy(
            event.payload.idTokenClaims,
            b2cPolicies.names.forgotPassword
          )
        ) {
          let signUpSignInFlowRequest = {
            authority: b2cPolicies.authorities.signUpSignIn.authority,
            scopes: [
              ...protectedResources.apiTodoList.scopes.read,
              ...protectedResources.apiTodoList.scopes.write,
            ],
          };
          instance.loginRedirect(signUpSignInFlowRequest);
        }
      }

      if (event.eventType === EventType.LOGIN_FAILURE) {
        // Check for forgot password error
        // Learn more about AAD error codes at https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes
        if (event.error && event.error.errorMessage.includes("AADB2C90118")) {
          const resetPasswordRequest = {
            authority: b2cPolicies.authorities.forgotPassword.authority,
            scopes: [],
          };
          instance.loginRedirect(resetPasswordRequest);
        }
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
    // eslint-disable-next-line
  }, [instance]);

  return (
    <Routes>
      <Route path="/" element={<PageLayout />}>
      {/* <Route path="/" element={<SideMenu/>}> */}
        
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/userProfileDetails" element={<UserProfileDetails />} />
        <Route path = '/notifications' element={<Notifications/>}/>
        <Route path="/admet" element={<AdmetPage />} />
        <Route path="/admet/projectdetail/:id" element={<ProjectDetails/>}/>
        <Route path="/admet/projectdetail/:id/Predict" element={<PredictComponent />} />
        <Route path = '/retrosynthesis' element={<RetrosynthesisPage/>}/>
        <Route path="/retrosynthesis/projectdetail/:id" element={<ProjectDetails/>}/>
        <Route path="/retrosynthesis/projectdetail/:id/Predictroute" element={<PredictRouteComponent />} />
        <Route path = '/generativeai' element={<GenerativeAIPage/>}/>
        <Route path="/generativeai/projectdetail/:id" element={<ProjectDetails/>}/>
        <Route path="/generativeai/projectdetail/:id/GenerateSmiles" element={<GemChemValidateProtien />} />
        <Route path = '/virtualscreening' element={<VirtualScreeningPage/>}/>
        <Route path="/virtualscreeningpage" element={<VirtualScreeningStaticPage/>}/>
        <Route path="/virtualscreening/projectdetail/:id/ScreenTargets" element={<VirtualScreeningStaticPage/>}/>
        <Route path ='/virtualscreening/projectdetail/:id' element={<ProjectDetails/>}/>
        <Route path="/virtualscreeningResults" element={<VirtualScreeningResults/>}/>
        <Route path="/projects/generativeai/smilesandtargets/:projectId" element={<SmilesAndTargetsTable />} />
 
        <Route path="/retrosynthesis/vendor" element={<RetroVendorScreen/>}/>
        <Route path="/projects" element={<Projects />} />
        <Route path="/Admetprojects/projectdetail/:id" element={<ProjectDetailsAndHistoryAdmet/>}/>
        {/* <Route path="/projects/projectdetails/:id" element={<ProjectDetails />} /> */}
        <Route path="/Retroprojects/projectdetail/:id" element={<ProjectDetailsAndHistory/>} />
        <Route path="/admetresultspage"  element={<AdmetResultPage/>}/>
        <Route path="/projects/projectroute/:id" element={<ProjectRoutes />} />
        <Route path = '/RetroProjects' element={<RetroProjects/>}/>
        <Route path="/Retroprojects/projectroute/:id" element={<Retrosynthesis/>} />
        <Route path="/retrosynthesis/vendor" element={<RetroVendorScreen/>}/>
        <Route path="/settings" element={<SettingsPaage />} />
        <Route path="/new-project" element={<NewProject />} />
        <Route path="/projects/aat1/resultspage" element={<Results />} />
        <Route path="/projects/aat1/smilestring" element={<ProjectRoutes />} />
        <Route path ='/Retro/history-results' element={<Retrosynthesis/>}/>
        {/* retro results   */}
        {/* <Route path="/upload" element={<UploadedFileStrings />} />  */}
        {/* <Route path="/retro-upload-results" element={<RetroUploadResults />} />  */}

        <Route path="/admet/compareresults" element={<ComparisonPage />} />
        <Route path="/admet/properties-table" element={<PropertiesTable />} /> 
        <Route path="/projects/genchem/validate-protien/:id" element={<GemChemValidateProtien />} />
        <Route path="/projects/generativeai/select-molecule/:id" element={<GenChemSelectMolecule />} />
        <Route path="/projects/generativeai/results" element={<GenChemResults />} />
        <Route path="/projects/genchem/smiles-target-selection" element={<GenChemSmilesAndTargetsTable />} />
        <Route path = "/RetroResults" element={<Results />}/>
        <Route path="/GemChemProjectList" element={<GemChemProjectList/>}/>
        <Route path="/GenChemprojects/projectdetail/:id" element={<ProjectDetailsAndHistoryAGenChem />}/>
        <Route path="/projects/generativeai/smiles/:id" element={<SmilesTable/>}/> 
        <Route path="projects/generativeai/targets/:id" element={<TargetsTable/>}/> 
        <Route path="/projects/generativeai/smile&targets/:id" element={<SmilesTable/>}/>
        <Route path="/projects/generativeai/smiles&targets/:id" element={<TargetsTable/>}/>
      </Route>
     
    </Routes>
    
   
  );
};

const App = ({ instance }) => {
  return (
    <>
    
      <MsalProvider instance={instance}>
        <Pages />
        
      </MsalProvider>
      <Toaster richColors closeButton="true" position="top-right" />
     
    </>
  );
};

export default App;
