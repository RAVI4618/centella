import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useAtom } from 'jotai';
import { base_api_url, post_api_headers } from "../utils/Store";
import { toast } from 'sonner';
import { useMsal, AuthenticatedTemplate } from "@azure/msal-react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

const CreateProjectPopup = ({ onClose, fetchProjects, editingProject }) => {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const location = useLocation();
  const username = activeAccount?.name;
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState(location.pathname.split('/')[1]);
  const [ownerTransfer, setOwnerTransfer] = useState('');
  const [nameError, setNameError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const postapi_header = useAtom(post_api_headers)[0];

  useEffect(() => {
    if (editingProject) {
      setProjectName(editingProject.projectName);
      setProjectDescription(editingProject.projectDescription);
      setSelectedWorkflow(editingProject.workflow);
      setOwnerTransfer(editingProject.ownerTransfer); // Set owner transfer for editing
    } else {
      setProjectName("");
      setProjectDescription("");
      setSelectedWorkflow(location.pathname.split('/')[1]);
      setOwnerTransfer(''); // Reset owner transfer for creating
    }
  }, [editingProject, location.pathname]);

  const handleCloseClick = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleSave = async () => {
    // Validation logic...

    const productId = selectedWorkflow === "retrosynthesis"
      ? 1
      : selectedWorkflow === "admet"
        ? 2
        : selectedWorkflow === 'generativeai'
          ? 3
          : 4;

    const url = editingProject
      ? `https://caitapimus.azure-api.net/projectManagement-uat/api/projects?id=${editingProject.id}`
      : `https://caitapimus.azure-api.net/projectManagement-uat/api/projects`;

    const method = editingProject ? 'PUT' : 'POST';

    try {
      const response = await axios({
        method,
        url,
        headers: {
          'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
          'Content-Type': 'application/json',
        },
        data: {
          createdBy: username,
          createdDate: new Date().toISOString(),
          updatedBy: username,
          updatedDate: new Date().toISOString(),
          projectName,
          projectDescription,
          workflow: selectedWorkflow,
          ownerTransfer: ownerTransfer,
          projectResult: "In Progress",
          projectBlobStoragePath: "string",
          companyId: 15202,
          productId,
          active: true,
        },
      });

      if (response.status === 200 || response.status === 201) {
        // Ensure the popup closes after a successful save
        if (typeof onClose === "function") {
          onClose(response.data);  // Pass project data if needed
        }

        // Show success toast
        toast.success(`Project ${editingProject ? 'updated' : 'created'} in ${editingProject ? 'Owner Transfer' : selectedWorkflow} workflow`, {
          className: 'mt-6'
        });

      } else {
        throw new Error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };



  const availableWorkflows = () => {
    if (selectedWorkflow === "retrosynthesis") {
      return <option value="retrosynthesis">Retrosynthesis</option>;
    }
    if (selectedWorkflow === "admet") {
      return <option value="admet">ADMET</option>;
    }
    if (selectedWorkflow === "generativeai") {
      return <option value="generativeai">Generative AI</option>;
    }
    if (selectedWorkflow === "virtualscreening") {
      return <option value="virtualscreening">virtual screening</option>;
    }
    return null;
  };

  return (
    <AuthenticatedTemplate>
      <div className="fixed inset-0 flex justify-center items-center backdrop-filter backdrop-blur-sm">
        <div className="bg-white create-project rounded-lg shadow-lg overflow-hidden" style={{ width: "371px", height: "505px" }}>
          <div className="flex justify-between items-center p-4 border-b" style={{ backgroundColor: '#85AD4B' }}>
            <h3 className="text-lg font-semibold text-white">{editingProject ? 'Update Project' : 'Create Project'}</h3>
            <button className="text-xl text-white font-semibold" onClick={handleCloseClick}>
              <X className='h-6 w-6' />
            </button>
          </div>
          <div className="p-4">
            <div className="mt-8">
              <div>
                <h6>Name your project</h6>
                <input
                  className="w-full p-2 border rounded mb-2"
                  value={projectName}
                  onChange={(e) => { setProjectName(e.target.value); setNameError(null); }}
                  placeholder="Enter project name"
                />
                {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
              </div>
              <div className="mt-4">
                <h6>Project Description</h6>
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  value={projectDescription}
                  onChange={(e) => { setProjectDescription(e.target.value); setDescriptionError(null); }}
                  placeholder="Enter project description"
                  rows={2}
                  cols={5}
                />
                {descriptionError && <p className="text-red-500 text-sm">{descriptionError}</p>}
              </div>
              {editingProject ? (
                <div className="mt-4">
                  <h6>Owner Transfer</h6>
                  <input
                    className="w-full p-2 border rounded mb-2"
                    value={ownerTransfer}
                    onChange={(e) => setOwnerTransfer(e.target.value)}
                    placeholder="Enter owner transfer details"
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <h6>Workflow</h6>
                  <select
                    className="w-full p-2 border rounded mb-2"
                    value={selectedWorkflow}
                    onChange={(e) => setSelectedWorkflow(e.target.value)}
                  >
                    <option value="">Select a workflow</option>
                    {availableWorkflows()}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#4D4D4D] text-white rounded-md hover:bg-[#6f8d30] w-[100px]"
              >
                {editingProject ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

    </AuthenticatedTemplate>

  );
};

export default CreateProjectPopup;


