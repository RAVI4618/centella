import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate, Link ,useLocation} from 'react-router-dom';
import Loader from '../components/Loader';
import { IoCloudUploadOutline } from "react-icons/io5";
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
function VirtualScreeningStaticPage() {
    const [metFile, setMetFile] = useState(null);
    const [compoundFile, setCompoundFile] = useState(null);
    const [taskGenerated, setTaskGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const username = activeAccount?.name;
    const navigate = useNavigate();
    const location = useLocation();
 
    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
    };
 
    const handleRemoveFile = (setFile) => {
        setFile(null);
    };
 
    useEffect(() => {
        setIsButtonEnabled(metFile !== null && compoundFile !== null);
    }, [metFile, compoundFile]);
 
    const handleGetExampleFile = (setFile, fileName, fileType, content) => {
        const exampleFile = new File([content], fileName, { type: fileType });
        setFile(exampleFile);
    };
 
    const path = location.pathname.split('/');
    const projectId = path[path.length - 2];
 
 
    const handleClick = async () => {
        if (!metFile || !compoundFile) {
            toast.error('Please upload both files.');
            return;
        }
   
        const formData = new FormData();
        formData.append('met_file', metFile);
        formData.append('compound_file', compoundFile);
        formData.append('userId', '12'); // Add your userId here
        formData.append('projectId', projectId); // Add your projectId here
        formData.append('userName', username);
   
        setLoading(true);
   
        try {
            const response = await fetch('https://caitspringclusterapi-dev-virtualscreening-workflow-api.azuremicroservices.io/api/virtual-screening/upload', {
                method: 'POST',
                body: formData,
            });
   
            const responseText = await response.text(); // Get response as text
   
            console.log('Response Text:', responseText); // Log response text
   
            if (response.ok) {
                // Assuming the response is plain text and contains the task ID
                if (responseText.includes('Task Id:')) {
                    const taskId = responseText.split('Task Id:')[1].trim(); // Extract task ID
                    setTaskGenerated(true);
                    setTaskId(taskId);
                    toast.success(`Task generated successfully! Task ID: ${taskId}`, {
                        className: 'mt-16'
                    });
                    console.log(`task_id: ${taskId}`);
                } else {
                    toast.error('Unexpected response format.');
                }
            } else {
                console.error('Server response status:', response.status); // Log status code
                console.error('Server response text:', responseText); // Log response text for error
                toast.error('Failed to generate task. Server response error.');
            }
        } catch (error) {
            console.error('Network or server error:', error); // Log network or server error
            toast.error('An error occurred while generating the task.');
        } finally {
            setLoading(false);
        }
    };
   
 
    return (
   <AuthenticatedTemplate>
                <div>
                    <p className="mt-6 ml-4 flex flex-row"><Link className='  font-semibold text-[#3182CE]' to={`/`}>Home</Link> <img src="https://cdn-icons-png.flaticon.com/128/8591/8591654.png" height={20} width={20} alt="" className="mt-1" />
                        <Link className='  font-semibold text-[#3182CE]' to={`/${location.pathname.split('/')[1]}`}>  Projects</Link> <img src="https://cdn-icons-png.flaticon.com/128/8591/8591654.png" height={20} width={20} alt="" className="mt-1" /> <Link className='  font-semibold text-[#3182CE]' to={location.pathname.substring(0, location.pathname.lastIndexOf('/'))}>  ProjectDetails</Link> </p>
                </div>
<div className="relative flex flex-col items-center my-10 w-full bg-[#F4F4F4]">
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50">
                    <Loader />
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4">Now upload or drag & drop</h2>
            <p className="text-lg font-semibold mb-10">Proper Document</p>
           
            <div className="flex justify-center gap-16">
                {/* File upload for met file */}
                <div className="border-2 border-gray-300 rounded-2xl h-82 p-6 w-[400px] flex flex-col shadow-lg items-center">
                    <IoCloudUploadOutline size={50} />
                    <p className="text-gray-700 text-sm mb-2">csv, xlsx or txt, smaller than 10MB</p>
                    <p className="text-gray-500 text-xs mb-4">Drag and drop your files here or</p>
 
                    {!metFile ? (
                        <label className="w-full flex flex-col items-center">
                            <input
                                type="file"
                                accept=".csv,.xlsx,.txt"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, setMetFile)}
                            />
                            <div className="bg-purple-500 text-white text-center py-2 px-6 rounded-md cursor-pointer hover:bg-purple-600 mb-4">
                                Upload
                            </div>
                        </label>
                    ) : (
                        <div className="flex items-center w-full">
                            <input
                                type="text"
                                value={metFile.name}
                                readOnly
                                className="border p-2 w-full rounded-l-md"
                            />
                            <button
                                onClick={() => handleRemoveFile(setMetFile)}
                                className="bg-black text-white px-4 py-2 rounded-r-md "
                            >
                                X
                            </button>
                        </div>
                    )}
 
                    <button
                        className=" p-1 rounded-sm   text-sm mt-4 text-blue-500 text-center hover:underline "
                        onClick={() => handleGetExampleFile(setMetFile, "met_file.csv", "text/csv", "example met content")}
                    >
                        Get an Example File
                    </button>
                </div>
 
                {/* File upload for compound file */}
                <div className="border-2 border-gray-300 rounded-2xl h-82 p-6 w-[400px] shadow-lg flex flex-col items-center">
                    <IoCloudUploadOutline size={50} />
                    <p className="text-gray-700 text-sm mb-2">smi, csv, xlsx, or txt, smaller than 10MB</p>
                    <p className="text-gray-500 text-xs mb-4">Drag and drop your files here or</p>
 
                    {!compoundFile ? (
                        <label className="w-full flex justify-center">
                            <input
                                type="file"
                                accept=".smi,.csv,.xlsx,.txt"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, setCompoundFile)}
                            />
                            <div className="bg-purple-500 text-white text-center py-2 px-4 rounded-md cursor-pointer hover:bg-purple-600 mb-4">
                                Upload
                            </div>
                        </label>
                    ) : (
                        <div className="flex items-center w-full">
                            <input
                                type="text"
                                value={compoundFile.name}
                                readOnly
                                className="border p-2 w-full rounded-l-md"
                            />
                            <button
                                onClick={() => handleRemoveFile(setCompoundFile)}
                                className="bg-black text-white px-4 py-2 rounded-r-md "
                            >
                                X
                            </button>
                        </div>
                    )}
 
                    <button
                        className="text-blue-500 text-center hover:underline text-sm mt-4 "
                        onClick={() => handleGetExampleFile(setCompoundFile, "compound_file.smi", "text/plain", "example compound content")}
                    >
                        Get an Example File
                    </button>
                </div>
            </div>
 
            <div className="flex justify-end mt-10 w-full max-w-[800px]">
                <button
                    className={`bg-[#735AA7] text-white py-2 px-4 rounded ${!isButtonEnabled ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                    onClick={handleClick}
                    disabled={!isButtonEnabled || loading}
                >
                    Screen targets
                </button>
                {taskGenerated && (
                    <Link
                        to={`/virtualscreeningResults`}
                        className="bg-[#89AF3E] text-white py-2 px-4 rounded ml-4"
                    >
                        View results
                    </Link>
                )}
            </div>
 
        </div>
 
   </AuthenticatedTemplate>
   
   
    );
}
 
export default VirtualScreeningStaticPage;
 
 