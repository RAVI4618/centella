
import React, { useEffect, useRef, useState } from "react";
import './../../styles/editor.css'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAtom } from 'jotai';
import projData from '../../json/projects.json'
import { base_api_url, currentWorkflow, post_api_headers, default_api_headers } from "../../utils/Store";
import Loader from "../Loader";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";
import Switch from 'react-switch';
import RetroSingleTypeResults from "../retro/RetroSingleTypeResults";
import RetroResultPage from "../retro/RetroResultPage";
import { toast } from "sonner";
import AdmetResultPage from "./AdmetResultPage";
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { IoIosClose } from "react-icons/io";
// import { BiSolidCopy } from "react-icons/bi";
import CASNumber from "../retro/CasNumber";
import { useSmileValidation } from "../smileValidation";



const structServiceProvider = new StandaloneStructServiceProvider();


const PredictComponent = () => {
    const location = useLocation();
    const baseurl = useAtom(base_api_url)[0]
    const defaultheaders = useAtom(default_api_headers)[0]
    const postapi_header = useAtom(post_api_headers)[0];
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
    const resultRef = useRef(null); //for scrolling results automatically
    const { validateSmileString } = useSmileValidation();

    const admetResultPageRef = useRef(null); // Ref for AdmetResultPage

    const [showResults, setShowResults] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showResultPage, setShowResultPage] = useState(false); // State to toggle showing result page
    const [drawnSmiles, setDrawnSmiles] = useState(""); // State to store the drawn SMILES string
    const [selectedModel, setSelectedModel] = useState('multi-step'); // State for selected model
    const [isMultiStep, setIsMultiStep] = useState(true); // State for toggle switch
    const [selectedOption, setSelectedOption] = useState('automatic');
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const username = activeAccount?.name;





    const handleExampleClick = async () => {
        const exampleSmile =
            ["CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",

                "CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",
                "CN(C)CCNC(=O)c1ccc(Nc2ncnc3cc(C=CC(=O)NO)ccc23)cc1-c1ccc(F)cc1",
                "CCCC(=O)C(C)C(NC(=O)C(CC1CCCCC1)NC(=O)C(C)CC1CCCC1)C(C)C",
                "[H][C]12CC[C](OC(C)=O)(C(C)=O)[C]1(C)CC[C]1([H])[C]2([H])C[CH](C)C2=CC(=O)[CH](O)C[C]12C"
            ];
        const randomSmile = exampleSmile.sort(() => Math.random() - Math.random()).slice(0, 1)[0];
        setSmileString(randomSmile);
        setDrawnSmiles(randomSmile)

    };
    const handleStructChange = (struct) => {
        const smilesString = struct.ketcher.smi;
        setSmileString(smilesString);
        // Optionally, update drawnSmiles if needed
        setDrawnSmiles(smilesString);
    };





    useEffect(() => {
        const smilesInputEle = document.getElementById('smiles-string-input');

        smilesInputEle.addEventListener('paste', function (e) {
            e.preventDefault();
            let contentOnBlur = (e.originalEvent || e).clipboardData.getData('text/plain');
            contentOnBlur = contentOnBlur.replaceAll(" ", '');
            smilesInputEle.value = contentOnBlur;
        })
    }, [])

    // const validateSmileString = async () => {
    //     setIsPredictDisabled(true); // Disable predict button during validation


    //     try {
    //         const response = await fetch(`${baseurl}/retrot5/smile_validation`, {
    //             method: 'POST',
    //             headers: postapi_header,
    //             body: JSON.stringify({ sequence: smileString })
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const responseData = await response.json();

    //         if (responseData === "Not valid") {
    //             toast.error('Please enter a valid SMILES string.', {
    //                 className: 'mt-14 '
    //             });
    //             setShowPredictButton(false); // Hide Predict button if the string is invalid
    //         } else {
    //             toast.success('Your SMILES string has been successfully validated.', {
    //                 className: 'mt-14 '
    //             });
    //             if (activeTab === 'smile') {
    //                 setActiveTab('visual')
    //             }
    //             setShowPredictButton(true); // Show Predict button if the string is valid

    //         }

    //         setIsPredictDisabled(false); // Enable predict button after validation
    //     } catch (error) {
    //         console.error('Error validating SMILES string:', error);
    //         toast.error(`Error validating SMILES string: ${error.message}`);
    //         setIsPredictDisabled(false); // Ensure predict button is enabled in case of error
    //     }
    // };



    const smileStringRef = useRef(smileString);

    useEffect(() => {
        smileStringRef.current = smileString;
    }, [smileString]);





    const handlePredictClick = async () => {
        setPredictionResult(null)
        setIsPredictDisabled(true);
        setLoader(true); // Show the loader

        // Scroll to loader
        const loaderElement = document.getElementById('loader');
        if (loaderElement) {
            loaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (!smileString.trim()) {
            toast.error('SMILE string is empty. Please enter a valid SMILE string.');
            setIsPredictDisabled(false);
            setLoader(false); // Hide the loader
            return;
        }

        if (activeTab === 'visual') {
            await getMolecule();
        }

        // Simulate 5-second delay for prediction result
        setTimeout(async () => {
            await AdmtApiCall();
            setLoader(false); // Hide the loader after the delay
        }, 5000);
    };





    const AdmtApiCall = async () => {
        try {
            // Step 1: Send the SMILE string to the new admet endpoint
            const responseResult = await fetch('https://caitapimus.azure-api.net/admet_predict', {
                method: 'POST',
                headers: postapi_header,
                body: JSON.stringify({
                    userId: 12,
                    userName: "Test User1",
                    projectId: 1276,
                    smile: smileString
                }),
            });

            if (!responseResult.ok) {
                throw new Error(`HTTP error! status: ${responseResult.status}`);
            }

            const resultData = await responseResult.json();
            console.log('Full API Response Data:', resultData); // Log the full response

            // Ensure resultData has the expected structure
            if (resultData && resultData.result) {
                setPredictionResult(resultData.result); // Update this according to the actual response
                setShowPopup(true);
                setLoader(false);
                setIsPredictDisabled(false);
                if (admetResultPageRef.current) {
                    admetResultPageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                throw new Error(`Unexpected response data structure or incorrect SMILES: ${smileString}`);
            }
        } catch (error) {
            console.error('Error fetching ADMET prediction result:', error);
            toast.error(`Error fetching prediction result: ${error.message}`);
            setLoader(false);
            setIsPredictDisabled(false);
        }
    };




    // Additionally, hide the Predict button if the textarea becomes empty
    const handleInputChange = (e) => {
        setSmileString(e.target.value);
        setDrawnSmiles(e.target.value);
        setShowPredictButton(false); // Hide Predict button when input changes
        setShowPopup(false);
        setPredictionResult(null); // Clear previous results
        setIsPredictDisabled(true); // Disable Predict button until validated again
    };

    const setMolecule = async () => {
        if (window.ketcher && smileString) {
            try {
                await window.ketcher.setMolecule(smileString); // Set the molecule if not empty
            } catch (error) {
                console.error("Error setting molecule in Ketcher:", error);
            }
        } else {
            // Clear editor if smileString is empty
            if (window.ketcher) {
                try {
                    await window.ketcher.setMolecule('');
                } catch (error) {
                    console.error("Error clearing molecule in Ketcher:", error);
                }
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
            }
        }
    };


    const handleactiveTab = (e) => {
        console.log(e)
        setActiveTab(e)
        if (e === 'smile') {
            getMolecule()
        }
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



    useEffect(() => {
        if (window.ketcher && smileString) {
            window.ketcher.setMolecule(smileString);
        }
    }, [smileString]);



    return (
        <>
            <AuthenticatedTemplate>


                <div className=" mx-auto px-4 sm:px-8  bg-[#F4F4F4]">
                    <div>
                        <p className=" mt-4 flex flex-row"><Link className='  font-semibold text-[#3182CE]' to={`/`}>Home</Link> <img src="https://cdn-icons-png.flaticon.com/128/8591/8591654.png" height={20} width={20} alt="" className="mt-1" />
                            <Link className='  font-semibold text-[#3182CE]' to={`/${location.pathname.split('/')[1]}`}>  Projects</Link> <img src="https://cdn-icons-png.flaticon.com/128/8591/8591654.png" height={20} width={20} alt="" className="mt-1" /> <Link className='  font-semibold text-[#3182CE]' to={location.pathname.substring(0, location.pathname.lastIndexOf('/'))}>  ProjectDetails</Link> </p>
                    </div>
                    <div className="path-editors  flex flex-wrap justify-start sm:justify-start">
                        <p
                            className={`${activeTab === 'smile' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF] '}`}
                            onClick={() => handleactiveTab('smile')}
                            style={{ cursor: "pointer" }}
                        >
                            Paste Smile
                        </p>
                        <p className="px-1">|</p>
                        <p
                            className={`${activeTab === 'cas' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF] '}`}
                            onClick={() => handleactiveTab('cas')}
                            style={{ cursor: "pointer" }}
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
                    </div>
                    {activeTab === 'cas' && (
                        <CASNumber
                            setSmileString={setSmileString}
                            setActiveTab={setActiveTab}
                        />
                    )}

                    {activeTab !== 'cas' && (
                        <div className="flex flex-row sm:flex-row items-end w-full align-bottom">
                            <div className="w-full relative">
                                <div
                                    className="hover:text-[#74A8C4] text-[#4E8FAB] font-semibold text-lg mb-1 text-right cursor-pointer"
                                    onClick={handleExampleClick}
                                >
                                    Get an example
                                </div>

                                <input
                                    type="text"
                                    id="smiles-string-input"
                                    className="w-full h-[32px] rounded-[5px] font-bold px-3 py-[5px] border cursor-pointer pr-10"
                                    value={smileString}
                                    onPaste={handleInputChange}
                                    onChange={handleInputChange}
                                />

                                {smileString && (
                                    <IoIosClose
                                        className="absolute right-3 top-11 transform -translate-y-1/2 text-[#000000] font-semibold cursor-pointer"
                                        onClick={clearInput}
                                        size={28}
                                    />
                                )}
                            </div>

                            <div className="flex flex-row items-start sm:ml-2 sm:mt-0">
                                <button
                                    className="rounded-[5px] text-white px-4 h-[32px] ml-2 mb-2 sm:mb-0"
                                    style={{ backgroundColor: smileString ? '#735AA7 ' : '#A0AEC0', color: smileString ? 'white' : '' }}
                                    onClick={() => validateSmileString(smileString, activeTab, setActiveTab)}
                                    disabled={!smileString}
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

                    {activeTab === 'visual' && (
                        <div className="editor overflow-hidden">
                            <div className="mt-4" style={{ width: '100%', height: '474px' }}>
                                <Editor
                                    staticResourcesUrl=""
                                    structServiceProvider={structServiceProvider}
                                    onInit={(ketcher) => {
                                        window.ketcher = ketcher;
                                        setMolecule();
                                    }}
                                    onStructChange={handleStructChange}
                                />
                            </div>
                            {/* Flexbox for aligning the button */}
                            <div className="w-[90%] ml-[10%] flex justify-end mt-4">
                                <button
                                    onClick={handlePredictClick}
                                    disabled={isPredictDisabled}
                                    className={`px-6 py-1 rounded text-white cursor-pointer ${!showPredictButton || isPredictDisabled ? ' bg-[#735AA7] opacity-50 cursor-not-allowed' : 'bg-[#735AA7]'}`}
                                >
                                    Predict
                                </button>
                            </div>
                        </div>
                    )}


                    <div ref={admetResultPageRef}>
                        {!loader ? (
                            <>
                                {
                                    showPopup && (
                                        <AdmetResultPage
                                            predictionResult={predictionResult}
                                            onClose={() => setShowPopup(false)}
                                            smileString={smileString}
                                        />
                                    )
                                }
                            </>
                        ) : (
                            <div className="text-center pt-[6%]">
                                <Loader />
                            </div>
                        )}
                    </div>
                </div>

            </AuthenticatedTemplate>
        </>
    )
}

export default PredictComponent;

