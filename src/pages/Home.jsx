import { AuthenticatedTemplate } from "@azure/msal-react";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { currentWorkflow, post_api_headers } from "../utils/Store";
import '../styles/editor.css';
import '../styles/shadows.css';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import dashboardPath from '../images/wave.svg';

export const Home = () => {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const [currentPage, setCurrentPage] = useAtom(currentWorkflow);
  const postapi_header = useAtom(post_api_headers)[0];
  const navigate = useNavigate();

  const [ADMETData, setADMETData] = useState(null);
  const [retrosynthesisData, setRetrosynthesisData] = useState(null);
  const [genChemData, setGenChemData] = useState(null);
  const [virtualScreeningData, setVirtualScreeningData] = useState(null);
  const [recentProjects, setRecentProjects] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null); // Track selected card
  const [hoveredCard, setHoveredCard] = useState(null); // Track hovered card
  const [isDisabled, setIsDisabled] = useState(false);
  // Define product IDs here
  const ADMET_productId = 2;
  const retro_productId = 1;
  const genChem_productId = 3;
  const virtualScreening_productId = 4;

  useEffect(() => {
    // Fetch data for each workflow
    fetchData(ADMET_productId, setADMETData);
    fetchData(retro_productId, setRetrosynthesisData);
    fetchData(genChem_productId, setGenChemData);
    fetchData(virtualScreening_productId, setVirtualScreeningData);
    fetchRecentProjects();
  }, []);

  const getWorkflowName = (productId) => {
    switch (productId) {
      case 1: return 'Retrosynthesis';
      case 2: return 'ADMET';
      case 3: return 'Genchem';
      case 4: return 'Virtual Screening';
      default: return 'Unknown Workflow';
    }
  };

  const fetchData = async (productId, setData) => {
    try {
      const response = await fetch(`https://caitapimus.azure-api.net/projectManagement-uat/api/projects/get-project-status?productId=${productId}&companyId=15202`, {
        headers: postapi_header,
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchRecentProjects = async () => {
    try {
      const response = await fetch(`https://caitapimus.azure-api.net/projectManagement-uat/api/projects/get-recent-projects?companyId=15202`, {
        headers: postapi_header,
      });
      if (!response.ok) throw new Error('Failed to fetch recent projects');
      const data = await response.json();
      setRecentProjects(data);
    } catch (error) {
      console.error('Error fetching recent projects:', error);
    }
  };

  const handleCardClick = (productId) => {
    setSelectedCard(productId);
    switch (productId) {
      case ADMET_productId:
        navigate('/admet');
        break;
      case retro_productId:
        navigate('/retrosynthesis');
        break;
      case genChem_productId:
        navigate('/generativeai');
        break;
      case virtualScreening_productId:
        navigate('/virtualscreening');
        break;
      default:
        console.log('Unknown productId');
    }
  };

  const getCardBgColor = (productId) => {
    if (selectedCard === productId) return '#89AF3E';
    if (hoveredCard === productId) return '#89AF3E';
    return '#A0AEC0';
  };

  const renderWorkflowCard = (title, data, productId) => {
    const isClickable = productId === retro_productId; // Only Retrosynthesis card is clickable
    return (
      <div
        className={`px-4 w-[278px] rounded-[7px] cursor-pointer transition-colors duration-300 bg-slate-400 dashboard-background ${isClickable ? 'hover:bg-lime-600' : 'pointer-events-none opacity-50'
          } dashboard-background`}
        onClick={isClickable ? () => handleCardClick(productId) : undefined}
        onMouseEnter={() => setHoveredCard(productId)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <h2 className=" py-2 text-base font-thin font-bold text-left text-white">{title}</h2>
        {data && (
          <div className="mt-6 " >
            <div className="flex justify-between items-center">
              <span className="text-white text-sm font-thin font-semibold">No. Of Projects</span>
              <span className="text-lg font-bold text-white">{data.totalNoOfProjects}</span>
            </div>
            <div className="flex justify-between items-center mt-5 mb-7">
              <div className="flex flex-col items-center">
                <span className="text-white text-xs font-thin">In-Progress</span>
                <span className="rounded-full dashboard-huge-shadow font-bold mt-2 bg-white w-8 h-8 flex items-center justify-center  text-[#4A5568] hover:text-lime-600">{data.inprogressProjects}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-white text-xs font-thin">Completed</span>
                <span className="rounded-full dashboard-huge-shadow font-bold mt-2 bg-white w-8 h-8 flex items-center justify-center text-[#4A5568] hover:text-lime-600">{data.completedProjects}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-white text-xs font-thin">Pending</span>
                <span className="rounded-full dashboard-huge-shadow font-bold mt-2 bg-white w-8 h-8 flex items-center justify-center  text-[#4A5568] hover:text-lime-600">{data.pendingProjects}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecentProjects = () => (
    <div className="space-y-4 w-full h-[370px] font-Segoe overflow-y-scroll">
      {recentProjects && recentProjects.map((project, index) => (
        <div key={index} className="p-4">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>Project Name:</span>
            <span className="font-normal text-end">{project.projectName}</span>
          </div>
          <div className="border-b my-2"></div>
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>Workflow:</span>
            <span className="font-normal">{getWorkflowName(project.productId)}</span>
          </div>
          <div className="border-b my-2"></div>
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>Status:</span>
            <span className="font-normal">{project.projectResult}</span>
          </div>
          <div className="border-b my-2"></div>
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>Updated By:</span>
            <span className="font-normal">{project.updatedBy}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="ml-4 mt-4 text-2xl">
        <span className="opacity-75">Welcome to Centella AI!</span>
        <span className="ml-2 text-3xl font-medium font-sans font-Segoe UI Emoji ">
          {activeAccount?.name}
        </span>
      </div>
      <AuthenticatedTemplate>
        {activeAccount && (
          <div className="pt-12 mx-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
              <div className="md:col-span-2 grid grid-cols-2 gap-x-12 gap-y-16">
                {renderWorkflowCard('ADMET', ADMETData, ADMET_productId)}
                {renderWorkflowCard('Generative AI', genChemData, genChem_productId)}
                {renderWorkflowCard('Retrosynthesis', retrosynthesisData, retro_productId)}
                {renderWorkflowCard('Virtual Screening', virtualScreeningData, virtualScreening_productId)}
              </div>
              <div className="relative top-197 left-954 w-352 h-389 bg-white shadow-md rounded-md ">
                <div className="absolute top-0 left-0 w-full h-12 bg-[#4A5568] rounded-t-md flex items-center justify-start">
                  <h2 className="text-lg text-white px-3 my-auto">Recent Project History</h2>
                </div>
                <div className="ml-2 mt-12">
                  {renderRecentProjects()}
                </div>
              </div>
            </div>
          </div>
        )}
      </AuthenticatedTemplate>
    </>
  );
};






