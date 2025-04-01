
import React, { useEffect, useState, useRef } from "react";
import './../../styles/editor.css'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAtom } from 'jotai';
import projData from '../../json/projects.json'
import { base_api_url, currentWorkflow, post_api_headers, post_api_file_headers, default_api_headers } from "../../utils/Store";
import Loader from "../Loader";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";
import Switch from 'react-switch';
import RetroSingleTypeResults from "./RetroSingleTypeResults";
import RetroResultPage from "./RetroResultPage";
import UploadFiles from "../UploadFiles";
import UploadedFileStrings from "../UploadedFileSmiles";
import { toast } from "sonner";
import RetroUploadResults from "../RetroUploadResults";
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { IoIosClose } from "react-icons/io";
import { BiSolidCopy } from "react-icons/bi";
import loaders from '../../images/molecular-structure-12929249-1-unscreen.gif'
import CASNumber from "./CasNumber";
import RetroVendorScreen from "./RetroVendor";
import { useSmileValidation } from "../smileValidation";




const structServiceProvider = new StandaloneStructServiceProvider();


const PredictRouteComponent = () => {
    const location = useLocation();
    const baseurl = useAtom(base_api_url)[0]
    const defaultheaders = useAtom(default_api_headers)[0]
    const { state } = location;
    const navigate = useNavigate();
    const oid = location.pathname.split('/')[3];
    const projectDetails = projData.filter((e) => e.id === oid)[0];
    const [currentWflow] = useAtom(currentWorkflow);
    const [smileString, setSmileString] = useState(''); //current smile string
    const [predictionResult, setPredictionResult] = useState(null); //the result of the prediction API call
    const [showPredictButton, setShowPredictButton] = useState(false); //controls the visibility of the predict button
    const [showPopup, setShowPopup] = useState(false); //controls the visibility of the result popup
    const [activeTab, setActiveTab] = useState('smile'); //tracks which tab is active (smile,visual,upload)
    const [isPredictDisabled, setIsPredictDisabled] = useState(false); //disables the predict button when necessary
    const [loader, setLoader] = useState(false); //Controls the visibility of the loader during API calls.
    const apiUrl = useAtom(base_api_url)[0];
    const postapi_header = useAtom(post_api_headers)[0];
    const post_api_file_header = useAtom(post_api_file_headers)[0];
    const [showResults, setShowResults] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showResultPage, setShowResultPage] = useState(false); // State to toggle showing result page
    const [drawnSmiles, setDrawnSmiles] = useState(true)
    const [selectedModel, setSelectedModel] = useState('multi-step'); // State for selected model
    const [isMultiStep, setIsMultiStep] = useState(true); // State for toggle switch
    const [selectedOption, setSelectedOption] = useState('automatic');
    const [selecetdPredictionResultList, setSelecetdPredictionResultList] = useState([]);


    const [uploadedStringsFromFiles, setUploadedStringsFromFiles] = useState([]); // State to store uploaded files
    const [selectedSmileStrings, setSelectedSmileStrings] = useState([]); // State to store selected smile strings
    const predictResultRef = useRef(null); // Ref to the predict result component
    const { validateSmileString } = useSmileValidation();
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const username = activeAccount?.name;
    const userId = activeAccount?.id;
    const resultSectionRef = useRef(null); // Reference for result section
    const [reactant, setReactant] = useState('');

    const quotes = [
        "“The art of discovery lies in trying the unknown. Start your prediction journey now!”",
        "“Innovation is the key to unlocking the mysteries of drug discovery.”",
        "“Great discoveries often come from asking the right questions.”",
        "“In science, curiosity fuels the journey towards breakthrough solutions.”",
        "“Drug discovery is the poetry of molecules and imagination.”",
        "“The smallest step in discovery can lead to the biggest leap for humanity.”",
        "“Exploration is the essence of scientific discovery.”",
        "“From hypothesis to healing: the journey of drug discovery.”",
        "“Discovery begins where certainty ends.”",
        "“Behind every cure is the courage to explore the unknown.”",
        "“Research transforms dreams into medical realities.”",
        "“Drug discovery: bridging the gap between nature and innovation.”",
        "“In every molecule lies the promise of a better future.”",
        "“The beauty of discovery lies in its potential to change lives.”",
        "“Innovation and determination fuel the progress of drug discovery.”",
        "“Science is the art of turning challenges into breakthroughs.”"
    ];

    const [currentQuote, setCurrentQuote] = useState(quotes[0]);



    const handleActiveTab = (tab) => {
        setActiveTab(tab);
    };


    useEffect(() => {
        // Check if state is available and set the reactant string
        if (location.state && location.state.reactant) {
            setReactant(location.state.reactant);
        }
    }, [location]);


    const handleToggleChange = (checked) => {
        setIsMultiStep(checked);
        if (checked) {
            setSelectedModel('multi-step');
        } else {
            setSelectedModel('single-step');
            setIsPredictDisabled(false)
        }
    };

    const getDescription = () => {
        if (selectedModel === 'multi-step') {
            return 'Predict the routes using multi-step model';
        } else if (selectedModel === 'single-step') {
            return 'Predict the routes using single-step model';
        }
    };

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleExampleClick = async () => {
        const exampleSmile =
            ["CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",

                "CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",
                "CN(C)CCNC(=O)c1ccc(Nc2ncnc3cc(C=CC(=O)NO)ccc23)cc1-c1ccc(F)cc1",
                "CCCC(=O)C(C)C(NC(=O)C(CC1CCCCC1)NC(=O)C(C)CC1CCCC1)C(C)C",
            ];
        const randomSmile = exampleSmile.sort(() => Math.random() - Math.random()).slice(0, 1)[0];
        setSmileString(randomSmile);

        // toast.info('Example SMILE string is set.');
        // setTimeout(() => {
        //     if (window.ketcher) {
        //         window.ketcher.setMolecule(randomSmile);
        //     }
        // }, 500);
    };

    const handleStructChange = (struct) => {
        const smilesString = struct.ketcher.smi;
        setSmileString(smilesString);
        // Optionally, update drawnSmiles if needed
        setDrawnSmiles(smilesString);
    };

    useEffect(() => {
        const smilesInputEle = document.getElementById('smiles-string-input');

        // Check if the element exists
        if (smilesInputEle) {
            const handlePaste = (e) => {
                e.preventDefault();
                let contentOnBlur = (e.clipboardData || window.clipboardData).getData('text/plain');
                contentOnBlur = contentOnBlur.replaceAll(" ", '');
                smilesInputEle.value = contentOnBlur;
            };

            smilesInputEle.addEventListener('paste', handlePaste);

            // Cleanup function
            return () => {
                smilesInputEle.removeEventListener('paste', handlePaste);
            };
        }
    }, []);

    const validateSmileStringFile = async (smileStringsFile) => {
        // setIsPredictDisabled(true); // Disable predict button during validation
        const smileStringFormData = new FormData();
        smileStringFormData.append('file', smileStringsFile);

        try {
            const response = await fetch(`http://40.81.20.121/upload_smiles`, {
                method: 'POST',
                body: smileStringFormData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();

            if (responseData === "Not valid") {
                toast.error('Please upload a valid SMILES strings file.');
            }

            console.log(responseData)

            let validStrings = [];
            for (let i = 0; i < responseData.length; i++) {
                if (responseData[i]['result'] !== "Valid") {
                    console.error(responseData[i]['sequence'], ' - invalid SMILE string.', responseData[i]['result']);
                    toast.error(`${responseData[i]['sequence']} - invalid SMILE string.`);
                } else {
                    validStrings.push(responseData[i]['sequence']);
                }
            }

            return validStrings;
        } catch (error) {
            console.error('Error validating SMILES strings file:', error);
            toast.error(`Error validating SMILES strings file: ${error.message}`);
            return (false);
        }

    }


    const handlePredictClick = async () => {
        setIsPredictDisabled(true);

        // Scroll to loader
        const loaderElement = document.getElementById('loader');
        if (loaderElement) {
            loaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (!smileString.trim()) {
            toast.error('SMILE string is empty. Please enter a valid SMILE string.');
            setIsPredictDisabled(false);
            return;
        }

        if (activeTab === 'visual') {
            await getMolecule();
        }

        if (selectedModel === 'multi-step') {
            RetroApiCall();
        } else if (selectedModel === 'single-step') {
            try {
                setLoader(true);
                const response = await fetch('https://caitapimus.azure-api.net/retro-uat/single-step', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...postapi_header,
                    },
                    body: JSON.stringify({
                        userId: userId,
                        userName: username,
                        projectId: oid,
                        smile: smileString
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const resultData = await response.json();
                setPredictionResult(resultData);
                setShowPopup(true);
                predictResultRef.current?.scrollIntoView({
                    behavior: 'smooth',
                });
            } catch (error) {
                console.error('Error fetching single-step prediction results:', error);
                toast.error(`Error fetching single-step results: ${error.message}`);
            } finally {
                setLoader(false);
                setIsPredictDisabled(false); // Enable predict button regardless of success or failure
                setActiveTab("smile");
            }
        }
    };

    const handleSingleStepFilePredict = async () => {
        setLoader(true);
        setIsPredictDisabled(true);

        const loaderElement = document.getElementById('loader');
        if (loaderElement) {
            loaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const selectedSmiles = uploadedStringsFromFiles.filter((smile, index) => selectedSmileStrings[index]);

        if (selectedSmiles.length === 0) {
            toast.error('Please select at least one SMILES string to predict.');
            setIsPredictDisabled(false);
            setLoader(false);
            return;
        }

        // create new file with selected smiles each on new line
        const smilesContent = selectedSmiles.join('\n');
        const selectedSmilesFile = new File([smilesContent], 'selected_smiles.txt', { type: 'text/plain' });
        const content = await selectedSmilesFile.text();
        console.log(content.split('\n'));
        console.log(selectedSmilesFile);
        const formData = new FormData();

        formData.append('file', selectedSmilesFile);
        formData.append('userName', username);
        formData.append('projectId', oid);

        const res = await fetch(baseurl + 'retro-uat/single-file-predict', {
            method: 'POST',
            headers: defaultheaders,
            body: formData,
        });

        if (!res.ok) {
            toast.error('Error predicting selected SMILES strings.');
            setIsPredictDisabled(false);
            setLoader(false);
            return;
        }

        const data = await res.json();

        if (res.status === 200) {
            setSelecetdPredictionResultList(data);
            setShowResultPage(true);
            setIsPredictDisabled(false);
            setLoader(false);
        }

    }


    const RetroApiCall = async () => {
        try {
            setLoader(true);
            const predictResponse = await fetch('https://caitspringcluster-api-uat-retro-worflow-api.azuremicroservices.io/api/retro/predict', {
                method: 'POST',
                headers: postapi_header,
                body: JSON.stringify({
                    userId: userId,
                    userName: username,
                    projectId: oid,
                    smile: smileString
                }),
            });

            if (!predictResponse.ok) {
                const message = await predictResponse.text();
                throw new Error(`Prediction request failed: ${predictResponse.status} ${message}`);
            }

            const resultData = await predictResponse.json();
            console.log("Prediction Result:", resultData);

            setPredictionResult(resultData);
            setShowPopup(true);
            setLoader(false);
            setIsPredictDisabled(false);
            setActiveTab("smile");

            // Scroll to result section
            if (resultSectionRef.current) {
                resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (error) {
            console.error('Error during the prediction process:', error);
            toast.error(`Error during prediction: ${error.message}`);
            setLoader(false);
            setIsPredictDisabled(false);
        }
    }

    // Additionally, hide the Predict button if the textarea becomes empty
    const handleInputChange = (e) => {
        setSmileString(e.target.value);
        setDrawnSmiles(e.target.value)
        setShowPredictButton(false); // Hide predict button and results popup immediately when input changes
        setShowPopup(false);
        setReactant(e.target.value)
        setPredictionResult(null); // Clear previous prediction results
    };
    const setMolecule = async () => {
        if (window.ketcher && smileString) {
            try {
                await window.ketcher.setMolecule(smileString);
            } catch (error) {
                console.error("Error setting molecule in Ketcher:", error);
                // toast.error(`Error setting molecule: ${error.message}`);
            }
        }
    };
    const getMolecule = async () => {
        if (window.ketcher) {
            try {
                const newSmile = await window.ketcher.getMolecule();
                if (newSmile !== smileString) {
                    setSmileString(newSmile);
                    validateSmileString();
                }
            } catch (error) {
                console.error("Error getting molecule from Ketcher:", error);
                // toast.error(`Error getting molecule: ${error.message}`);
            }
        }
    };
    useEffect(() => {
        // Calls setMolecule once component mounts and whenever smileString changes
        setMolecule();
    }, [smileString]);

    const handleactiveTab = (e) => {
        setActiveTab(e); // Update the active tab

        if (e === 'smile') {
            getMolecule(); // Fetch molecule data when switching to "smile" tab
        } else if (e === 'upload') {
            // Clear both SMILE input and the prediction result when switching to the "Upload File" tab
            setSmileString('');
            setPredictionResult(null); // Clear the previous prediction result
            setShowPopup(false); // Hide any result popup that might be open
            setLoader(false); // Reset the loader in case it's still active
            setIsPredictDisabled(false); // Enable the predict button again if it was disabled
        }
    };



    const setSmileStringsFromFiles = async (files) => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // check if the file is a text file or csv file
            if (file.type !== 'text/plain' && file.type !== 'text/csv') {
                toast.error('Please upload a valid file format (text or csv).');
            }

            const validStrings = await validateSmileStringFile(file);
            setUploadedStringsFromFiles([...uploadedStringsFromFiles, ...new Set(validStrings)]);
        }

        setSelectedSmileStrings(new Array(uploadedStringsFromFiles.length).fill(false));
    }

    const handleDragOver = (dragOverEvent) => {
        dragOverEvent.preventDefault();
        setSmileStringsFromFiles(dragOverEvent.dataTransfer.files);
    }

    const handleDrop = (dropEvent) => {
        dropEvent.preventDefault();
        setSmileStringsFromFiles(dropEvent.dataTransfer.files);
    }

    const handleUpload = (uploadEvent) => {
        const files = uploadEvent.target.files;
        setSmileStringsFromFiles(files);
    }

    const handleExample = () => {
        const exampleSmile =
            ["CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",

                "CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",
                "CN(C)CCNC(=O)c1ccc(Nc2ncnc3cc(C=CC(=O)NO)ccc23)cc1-c1ccc(F)cc1",
                "CCCC(=O)C(C)C(NC(=O)C(CC1CCCCC1)NC(=O)C(C)CC1CCCC1)C(C)C",
            ];

        setUploadedStringsFromFiles([...uploadedStringsFromFiles, ...exampleSmile]);
        setSelectedSmileStrings(new Array(uploadedStringsFromFiles.length + exampleSmile.length).fill(false));
    }

    const handleClearResults = () => {
        setUploadedStringsFromFiles([]);
        setSelectedSmileStrings([]);
    }

    const handleRemoveSmileString = (index) => {
        const removedString = uploadedStringsFromFiles[index];

        const updatedUploadedStrings = [...uploadedStringsFromFiles];
        updatedUploadedStrings.splice(index, 1);
        setUploadedStringsFromFiles(updatedUploadedStrings);

        const updatedSelectedSmileStrings = [...selectedSmileStrings];
        updatedSelectedSmileStrings.splice(index, 1);
        setSelectedSmileStrings(updatedSelectedSmileStrings);

        toast.success(`Successfully removed SMILES string: ${removedString}`);
    }

    function isStringSelected(index) {
        return selectedSmileStrings[index];
    }

    const onSelectAllSimleStrings = (selectAll) => {
        setSelectedSmileStrings(new Array(uploadedStringsFromFiles.length).fill(selectAll));
    }

    const onChangeSmileString = (index) => {
        const updatedSelectedSmileStrings = [...selectedSmileStrings];
        updatedSelectedSmileStrings[index] = !selectedSmileStrings[index];
        setSelectedSmileStrings(updatedSelectedSmileStrings);

        setSmileString(uploadedStringsFromFiles[index]);
    }

    const clearInput = async () => {
        console.log("Clearing input..."); // Debug log
        setSmileString(''); // Clear SMILES string
        setDrawnSmiles(''); // Clear drawn SMILES string
        setShowPopup(false); // Hide results popup
        setPredictionResult(null); // Clear previous prediction results

        if (window.ketcher) {
            try {
                await window.ketcher.setMolecule(''); // Clear the editor structure
            } catch (error) {
                console.error("Error clearing molecule in Ketcher:", error);
            }
        }
    };


    const handleGetSmiles = async () => {
        if (window.ketcher) {
            try {
                const smilesString = await window.ketcher.getSmiles();
                console.log("SMILES string:", smilesString);
                if (smilesString !== smileString) {  // Avoid unnecessary state updates
                    setSmileString(smilesString);
                }
                // No need to set the structure again in the editor
            } catch (error) {
                console.error("Error getting SMILES string:", error);
            }
        }
    };


    return (
        <>
            <AuthenticatedTemplate>
                <div>
                    <p className=" mt-4 ml-4 flex flex-row"><Link className='  font-semibold text-[#3182CE]' to={`/`}>Home</Link> <img src="https://cdn-icons-png.flaticon.com/128/8591/8591654.png" height={20} width={20} alt="" className="mt-1" />
                        <Link className='  font-semibold text-[#3182CE]' to={`/${location.pathname.split('/')[1]}`}>  Projects</Link> <img src="https://cdn-icons-png.flaticon.com/128/8591/8591654.png" height={20} width={20} alt="" className="mt-1" /> <Link className='  font-semibold text-[#3182CE]' to={location.pathname.substring(0, location.pathname.lastIndexOf('/'))}>  ProjectDetails</Link> </p>
                </div>
                <div className=" mx-auto px-4 sm:px-8  bg-[#F4F4F4]">
                    {/* {container page-dashboard max-w-screen-xl} */}
                    <div className="path-editors flex flex-wrap justify-start sm:justify-start">
                        <p
                            className={`${activeTab === 'smile' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF] '}`}
                            onClick={() => handleactiveTab('smile')}
                            style={{ cursor: "pointer" }}
                        >
                            Paste Smile
                        </p>
                        <p className="px-1">|</p>
                        <p
                            className={`${activeTab === 'cas' &&
                                'text-[#000000] font-semibold border-b-2 border-[#746AAF]'
                                }`}
                            onClick={() => handleActiveTab('cas')}
                            style={{ cursor: 'pointer' }}
                        >
                            CAS Number
                        </p>
                        <p className="px-1">|</p>

                        <p
                            className={`${activeTab === 'visual' && 'text-[#000000]  font-semibold border-b-2 border-[#746AAF]'}`}
                            onClick={() => handleactiveTab('visual')}
                            style={{ cursor: "pointer" }}
                        >
                            Draw structure
                        </p>
                        <p className="px-1">|</p>
                        <p
                            className={`${activeTab === 'upload' && 'text-[#000000] cursor-pointer font-semibold border-b-2 border-[#746AAF]'}`}
                            onClick={() => handleactiveTab('upload')}
                            style={{ cursor: "pointer" }}
                        >
                            Upload file
                        </p>
                        <p className="px-1">|</p>
                        <p
                            className={`${activeTab === 'vendor' &&
                                'text-[#000000] font-semibold border-b-2 border-[#746AAF]'
                                }`}
                            onClick={() => handleActiveTab('vendor')}
                            style={{ cursor: 'pointer' }}
                        >
                            Vendor List
                        </p>
                    </div>

                    {activeTab === 'cas' && (
                        <CASNumber
                            setSmileString={setSmileString}
                            setActiveTab={setActiveTab}
                        />
                    )}

                    {/* Conditional rendering of RetroVendorScreen */}
                    {activeTab === 'vendor' && <RetroVendorScreen
                        showBackButton={false} // Hide back button
                    />}

                    {activeTab !== 'cas' && activeTab !== 'vendor' && (
                        <div className="flex flex-row sm:flex-row items-end w-full align-bottom">
                       <div className="w-full relative">
   <div className="hover:text-[#74A8C4] text-[#4E8FAB] font-semibold text-lg mb-1 text-right cursor-pointer"
       onClick={handleExampleClick}>
       Get an example
   </div>
    <div className="relative flex items-center">
       <div className="w-full overflow-hidden">
           <input 
               type="text"
               id="smiles-string-input"
               className="w-full h-[32px] rounded-[5px] font-bold px-3 py-[5px] border cursor-pointer pr-10 truncate"
               value={smileString}
               onPaste={handleInputChange}
               onChange={handleInputChange}
               title={smileString} // Shows full text on hover
           />
       </div>
        {smileString && (
           <div className="absolute right-0 h-[32px] rounded-r-[5px] border flex items-center bg-white px-2">
               <IoIosClose
                   className="text-[#000000] font-semibold cursor-pointer"
                   onClick={clearInput}
                   size={28}
               />
           </div>
       )}
   </div>
</div>

                            <div className="flex flex-row items-start sm:ml-2 sm:mt-0">
                                <button
                                    className="rounded-[5px] text-white px-4 h-[32px] ml-2 mb-2 sm:mb-0"
                                    style={{
                                        backgroundColor: smileString ? '#735AA7' : '#A0AEC0',
                                        color: smileString ? 'white' : '',
                                    }}
                                    onClick={() => validateSmileString(smileString, activeTab, setActiveTab)}
                                    disabled={!smileString || isPredictDisabled}
                                >
                                    Validate
                                </button>

                                {activeTab === 'visual' && (
                                    <button
                                        className="rounded-[5px] text-white px-4 h-[32px] w-[120px] bg-[#735AA7] ml-2 mb-2 sm:mb-0 text-nowrap"
                                        onClick={handleGetSmiles}
                                    >
                                        Get SMILES
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Image Display (conditionally renders if input is empty) */}
                    {(activeTab === 'smile' && smileString === '') && (
                        <div className="w-full h-auto mt-16 flex flex-col justify-center items-center">
                            {/* Image */}
                            <img src={loaders} alt="" className="h-44 w-44 opacity-25" />

                            {/* Text */}
                            <i className="mt-4 opacity-75 text-gray-500 text-2xl text-center">
                                {currentQuote}
                            </i>
                        </div>

                    )}


                    {(activeTab === 'visual' || (activeTab === 'upload' && uploadedStringsFromFiles.length !== 0)) && (
                        <div className="mt-6 flex flex-row">
                            <div className="editor flex" style={{ width: '100%', height: '474px' }}>
                                <Editor
                                    staticResourcesUrl=""
                                    structServiceProvider={structServiceProvider}
                                    onInit={(ketcher) => {
                                        window.ketcher = ketcher;
                                        setMolecule();
                                    }}
                                />

                                <div className="relative right-0 bg-white p-4 shadow-lg flex flex-col justify-between" style={{ width: '280px', }}>
                                    <div className="border-b pb-5"></div>
                                    <div className="pt-4 w-[280px]">
                                        <h1 className="text-lg font-semibold mb-2"> Number of steps</h1>
                                        <div className="mb-4 mt-4">
                                            <label className="flex items-center">
                                                <span className="mr-2">Single-Step</span>
                                                <Switch
                                                    onChange={handleToggleChange}
                                                    checked={isMultiStep}
                                                    onColor="#89AF3E"
                                                    offColor="#89AF3E"
                                                    onHandleColor="#fff"
                                                    offHandleColor="#fff"
                                                    uncheckedIcon={false}
                                                    checkedIcon={false}
                                                    height={20}

                                                />
                                                <span className="ml-2">Multi-Step</span>
                                            </label>
                                        </div>

                                        <p className="text-md font-semibold mb-2 mt-3">Select AI Model</p>
                                        <div className="flex items-center ">
                                            <label className="mr-4">
                                                <input
                                                    type="radio"
                                                    value="automatic"
                                                    checked={selectedOption === 'automatic'}
                                                    onChange={handleOptionChange}
                                                    className="form-radio h-3.5 w-3.5 text-[#89AF3E] focus:ring-[#89AF3E]"
                                                />
                                                Automatic
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    value="custom"
                                                    checked={selectedOption === 'custom'}
                                                    onChange={handleOptionChange}
                                                    className="form-radio h-3.5 w-3.5 text-[#89AF3E] focus:ring-[#89AF3E]"
                                                />
                                                Custom
                                            </label>
                                        </div>
                                        <div className="mb-4">
                                            <div className="mb-4 mt-4 ">
                                                <select className="w-[158px] h-[30px] border-[0.4px] border-gray-500 rounded-[5px] opacity-100">
                                                    <option>Template</option>
                                                    <option>Text</option>
                                                </select>
                                            </div>

                                            <h2 className="text-sm font-semibold">Model Description</h2>
                                            <p className="mt-4">{getDescription()}</p>
                                        </div>



                                    </div>
                                    {/* Predict Button */}
                                    {activeTab !== 'upload' && < div className="w-[250px] relative mr-4">
                                        <button
                                            onClick={handlePredictClick}
                                            disabled={isPredictDisabled}
                                            style={{ backgroundColor: !showPredictButton || isPredictDisabled ? '#735AA7' : '' }}
                                            className="w-[250px] text-white px-16 p-2 bg-[#735AA7] hover:bg-[#8A7DB8] active:bg-[#8A7DB8] focus:outline-none focus:ring focus:ring-violet-300 rounded-md"
                                        >
                                            {/* Predict Retrosynthestic Route */}
                                            Predict Route

                                        </button>
                                    </div>}
                                </div>
                            </div>
                            {
                                (activeTab === 'upload' && uploadedStringsFromFiles.length !== 0) && (
                                    <div className="ml-6">
                                        <UploadedFileStrings
                                            smileStrings={uploadedStringsFromFiles}
                                            isStringSelected={isStringSelected}
                                            onChangeSmileString={onChangeSmileString}
                                            onRemoveSmileString={handleRemoveSmileString}
                                            onSelectAllSimleStrings={onSelectAllSimleStrings}
                                            predictSelected={handleSingleStepFilePredict}
                                            clearResults={handleClearResults}
                                        />
                                    </div>
                                )
                            }
                        </div>
                    )}

                    {
                        (activeTab === 'upload' && uploadedStringsFromFiles.length === 0) && (
                            <div className="mt-6 w-full flex justify-end">
                                <UploadFiles onDragOver={handleDragOver} onDrop={handleDrop} onUpload={handleUpload} onExample={handleExample} />
                            </div>
                        )
                    }
                    <section ref={predictResultRef}>
                        {!loader ? (
                            <>
                                {/* Display the Popup based on selected model */}
                                {showPopup && selectedModel === 'single-step' ? (
                                    <RetroSingleTypeResults
                                        predictionResult={predictionResult}
                                        onClose={() => setShowPopup(false)}
                                        smileString={smileString}
                                    />
                                ) : (
                                    showPopup && (
                                        <RetroResultPage
                                            predictionResult={predictionResult}
                                            onClose={() => setShowPopup(false)}
                                            smileString={smileString}
                                        />
                                    )
                                )}

                                {/* Render Results when available */}
                                {showResultPage && selecetdPredictionResultList && (
                                    <RetroUploadResults predictions={selecetdPredictionResultList} />
                                )}
                            </>
                        ) : (
                            <div className="fixed inset-0  flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50">
                                <Loader />
                            </div>
                        )}
                    </section>
                </div>
            </AuthenticatedTemplate >
        </>
    )
}

export default PredictRouteComponent

