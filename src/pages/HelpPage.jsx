// const HelpPage =()=>{
//     return (
//         <>
//         <h3>Help Page</h3>
//         </>
//     )
// }

// export default HelpPage


// import SmilePage1 from './ProjectRoutes'

import React, { useEffect, useState } from "react";
import './../styles/editor.css'
import { Link, useLocation } from "react-router-dom";
import { useAtom } from 'jotai';
import AdmetResultPage from './AdmetResultPage';
import projData from './../json/projects.json'
import { base_api_url, currentWorkflow, post_api_headers } from "../utils/Store";
import { toast } from "sonner";
import Loader from "../components/Loader";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";
import RetroResultPage from "./RetroResultPage";
import { HiDotsVertical } from "react-icons/hi";

const structServiceProvider = new StandaloneStructServiceProvider();


const HelpPage = () => {
    const location = useLocation();
    const oid = location.pathname.split('/')[3]
    const projectDetails = projData.filter(e => e.id == oid)[0]
    const [currentWflow] = useAtom(currentWorkflow)
    const [smileString, setSmileString] = useState('');   //current smile string
    const [predictionResult, setPredictionResult] = useState(null);   //the result of the prediction API call
    const [showPredictButton, setShowPredictButton] = useState(false);   //controls the visibility of the predict button
    const [showPopup, setShowPopup] = useState(false);   //controls the visibility of the result popup
    const [activeTab, setActiveTab] = useState('smile');  //tracks which tab is active (smile,visual,upload)
    const [isPredictDisabled, setIsPredictDisabled] = useState(false);   //disables the predict button when neccessary
    const [loader, setLoader] = useState(false)  //Controls the visibility of the loader during API calls.
    const apiUrl = useAtom(base_api_url)[0]
    const postapi_header = useAtom(post_api_headers)[0]
    const [showResults, setShowResults] = useState(false)

    const handleExampleClick = async () => {
        const exampleSmile =
            ["CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5", "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5",
                // "C1CCC23CCC45CCCC64C25C13CC6", 
                "CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",
                "CN(C)CCNC(=O)c1ccc(Nc2ncnc3cc(C=CC(=O)NO)ccc23)cc1-c1ccc(F)cc1",
                "CCCC(=O)C(C)C(NC(=O)C(CC1CCCCC1)NC(=O)C(C)CC1CCCC1)C(C)C",
            ];
        const randomSmile = exampleSmile.sort(() => Math.random() - Math.random()).slice(0, 1)[0];
        setSmileString(randomSmile);
        setActiveTab('visual'); // Set active tab to 'smile'
        toast.info('Example SMILE string is set.');
        setTimeout(() => {
            if (window.ketcher) {
                window.ketcher.setMolecule(randomSmile);
            }
        }, 500);
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

    const validateSmileString = () => {
        const regex = /^[A-Za-z0-9+\-()=#@\[\]]+$/;
        if (regex.test(smileString) && smileString.trim() !== "") {
            toast.success('Your SMILE String has been successfully validated. You can now view and edit in the Visual Editor.');
            setShowPredictButton(true);
            setIsPredictDisabled(false);
        } else {
            toast.error('Please enter a valid SMILES string.');
            setShowPredictButton(false); // Hide Predict button if the string is invalid or empty
        }
    };

    const handlePredictClick = async () => {
        setIsPredictDisabled(true);

        if (!smileString.trim()) {
            toast.error('SMILE string is empty. Please enter a valid SMILE string.');
            return;
        }

        if (activeTab === 'visual') {
            await getMolecule();
        }
        if (currentWflow === 'ADMET') {
            AdmtApiCall();
        }
        else {
            RetroApiCall();
        }

        // Open the modal to show the results
    };

    const AdmtApiCall = async () => {
        try {

            // Step 1: Send the SMILE string to the admet_predict endpoint
            const predictResponse = await fetch(apiUrl + '/api/v1/admet_predict/', {
                method: 'POST',
                headers: postapi_header,
                body: JSON.stringify({ smile: smileString }),
            });

            if (!predictResponse.ok) {
                const message = await predictResponse.text();
                throw new Error(`Prediction request failed: ${predictResponse.status} ${message}`);
            }

            // Assume the response is { "message": "Task added to queue", "length_queue": 1 }
            const predictData = await predictResponse.json();
            toast.info(predictData.message);
            setLoader(true)

            // Step 2: Wait for 10 seconds before fetching the result
            setTimeout(getadmetresponse, 5000);

        } catch (error) {
            console.error('Error during the prediction process:', error);
            toast.error(`Error during prediction: ${error.message}`);
        }
    }
    const getadmetresponse = async () => {
        try {
            const responseResult = await fetch(apiUrl + '/api/v1/get_admet_result', {   //await fetch(...) waits for the fetch request to complete and assigns the result to responseResult.
                method: 'POST', // Use POST method as specified
                headers: postapi_header,
                // Assuming the endpoint requires the SMILE string
                body: JSON.stringify({ smile: smileString }),
            });

            if (!responseResult.ok) {
                throw new Error(`HTTP error! status: ${responseResult.status}`);
            }
            else {
                const resultData = await responseResult.json();// Define resultData here from the response
                if (resultData.code == 200) {
                    setPredictionResult(resultData.result);// Update the state with the fetched results

                    // const filteredResult = filterPredictionResult(resultData)
                    setPredictionResult(resultData); // Assuming resultData is your API response
                    setShowPopup(true);
                    setLoader(false)
                    setIsPredictDisabled(true);
                }

                else {
                    setTimeout(getadmetresponse, 5000);
                }
            }
        } catch (error) {
            console.error('Error during fetching prediction results:', error);
            toast.error(`Error during fetching results: ${error.message}`);
        }

    }
    const RetroApiCall = async () => {
        try {
            // Step 1: Send the SMILE string to the retrosynth endpoint
            const predictResponse = await fetch(apiUrl + '/api/v1/synth/', {
                method: 'POST',
                headers: postapi_header,
                body: JSON.stringify({ smile: smileString }),
            });

            if (!predictResponse.ok) {
                const message = await predictResponse.text();
                throw new Error(`Prediction request failed: ${predictResponse.status} ${message}`);
            }

            // Assume the response is { "message": "Task added to queue", "length_queue": 1 }
            const predictData = await predictResponse.json();
            toast.info(predictData.message);
            setLoader(true)

            // Step 2: Wait for 10 seconds before fetching the result
            setTimeout(getretroResp, 10000);

        } catch (error) {
            console.error('Error during the prediction process:', error);
            toast.error(`Error during prediction: ${error.message}`);
        }
    }
    const getretroResp = async () => {

        try {
            const responseResult = await fetch(apiUrl + '/api/v1/get_synth_result', {
                method: 'POST', // Use POST method as specified
                headers: postapi_header,
                // Assuming the endpoint requires the SMILE string
                body: JSON.stringify({ smile: smileString }),
            });

            if (!responseResult.ok) {
                throw new Error(`HTTP error! status: ${responseResult.status}`);
            }
            else {
                const resultData = await responseResult.json();// Define resultData here from the response
                if (resultData.code == 200) {
                    setPredictionResult(resultData.result);// Update the state with the fetched results

                    // const filteredResult = filterPredictionResult(resultData)
                    setPredictionResult(resultData); // Assuming resultData is your API response
                    setShowPopup(true);
                    setLoader(false)
                    setIsPredictDisabled(true);
                }
                else {
                    setTimeout(getretroResp, 5000);
                }

            }

        } catch (error) {
            console.error('Error during fetching prediction results:', error);
            toast.error(`Error during fetching results: ${error.message}`);
        }
    }
    // Additionally, hide the Predict button if the textarea becomes empty
    const handleInputChange = (e) => {
        setSmileString(e.target.value);
        console.log(smileString, e.target.value)
        // Hide predict button and results popup immediately when input changes
        setShowPredictButton(false);
        setShowPopup(false);
        setPredictionResult(null); // Clear previous prediction results

    };
    const setMolecule = async () => {
        if (window.ketcher && smileString) {
            try {
                // Assuming setMolecule is a function to set the editor's structure.
                // Replace with the correct method to initialize the molecule from a SMILES string if different.
                console.log(smileString)
                await window.ketcher.setMolecule(smileString);
            } catch (error) {
                console.error('Error setting molecule in Ketcher:', error);
                toast.error(`Error setting molecule: ${error}`);
            }
        }
    };
    const getMolecule = async () => {
        if (window.ketcher && smileString) {
            try {
                // Assuming setMolecule is a function to set the editor's structure.
                // Replace with the correct method to initialize the molecule from a SMILES string if different.
                let str = await window.ketcher.getSmiles(false);
                console.log(str)
                setSmileString(str);
            } catch (error) {
                console.error('Error setting molecule in Ketcher:', error);
                toast.error(`Error setting molecule: ${error}`);
            }
        }
    };
    useEffect(() => {
        // Calls setMolecule once component mounts and whenever smileString changes
        setMolecule();
    }, [smileString]);

    const handleactiveTab = (e) => {
        console.log(e)
        setActiveTab(e)
        if (e === 'smile') {
            getMolecule()
        }
    }



    return (
        <>
            <div className="container page-dashboard mx-auto px-4 sm:px-8 max-w-screen-xl bg-[#F4F4F4]">
                <div className="path-editors flex flex-wrap justify-start sm:justify-start">
                    <p
                        className={`${activeTab === 'smile' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF]'}`}
                        onClick={() => handleactiveTab('smile')}
                    >
                        Paste Smile
                    </p>
                    <p className="px-1">|</p>
                    <p
                        className={`${activeTab === 'visual' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF]'}`}
                        onClick={() => handleactiveTab('visual')}
                    >
                        Draw Smile
                    </p>
                    <p className="px-1">|</p>
                    <p
                        className={`${activeTab === 'upload' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF]'}`}
                        onClick={() => handleactiveTab('upload')}
                    >
                        Upload file
                    </p>
                </div>

                <div
                    className="example  mt-4  text-[#4E8FAB] font-semibold text-right cursor-pointer"
                    onClick={handleExampleClick}
                >
                    Get an example
                </div>

                <div className="flex flex-col sm:flex-row mt-1">
                    <input
                        style={{ width: '800px' }}
                        type="text"
                        id="smiles-string-input"
                        className="lg:w-[450px] xl:w-[650px] sm:w-[450px] h-[32px] rounded-[5px] px-3 py-[5px] border cursor-pointer"
                        value={smileString}
                        onPaste={handleInputChange}
                        onChange={handleInputChange}

                    />

                    <div className="flex flex-col justify-start sm:ml-24  mb-1 sm:mt-0">
                        <div className="flex flex-wrap justify-start">
                            {/* <button
                                onClick={handleExampleClick}
                                className=" ml-8 bg-[#A0AEC0] rounded-[5px] text-white px-4 h-[32px] w-[100px]"
                            >
                                Example
                            </button> */}
                            <button
                                className="validate rounded-[5px] text-white px-4 h-[32px] w-[100px] mb-2 sm:mb-0"
                                style={{ backgroundColor: smileString ? '#4E8FAB' : '', color: smileString ? 'white' : '' }}
                                onClick={() => validateSmileString(smileString)}
                                disabled={!smileString}
                            >
                                Validate
                            </button>
                            {showPredictButton && activeTab === 'smile' && (
                                <button
                                    className="predict rounded-[5px] text-white px-4 h-[32px] w-[100px]"
                                    onClick={handlePredictClick}
                                    disabled={!showPredictButton || isPredictDisabled}
                                    style={{ backgroundColor: !showPredictButton || isPredictDisabled ? '#735AA7' : '' }}
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {activeTab === 'visual' && (
                    <div className="mt-6">
                        <div className="editor" style={{ width: '100%', maxWidth: '1200px', height: '444px' }}>
                            <Editor
                                staticResourcesUrl=""
                                structServiceProvider={structServiceProvider}
                                onInit={(ketcher) => {
                                    window.ketcher = ketcher;
                                    setMolecule();
                                }}
                            />

                            <div className="absolute right-0 top-12 bg-white p-4 shadow-lg flex flex-col justify-between" style={{ width: '280px', height: '390px' }}>
                                <div>
                                    <h1 className="text-lg font-semibold mb-2">Select Parameters</h1>
                                    <div className="mb-4">
                                        <div className="opacity-50">Choose AI Model</div>
                                        <select className="border border-gray-300 rounded px-2 py-1 w-full">
                                            <option value="model_version">AI Model Version</option>
                                        </select>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold mb-2">Model Description</h2>
                                        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Natus, illum.</p>
                                    </div>
                                </div>
                                {/* Predict Button */}
                                <div className="w-[250px] relative mr-4">
                                    <button
                                        onClick={handlePredictClick}
                                        disabled={isPredictDisabled}
                                        style={{ backgroundColor: !showPredictButton || isPredictDisabled ? '#3182CE' : '' }}
                                        className="w-[250px] text-white px-16 p-2  "
                                    >
                                        Predict Retrosynthesis Route

                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* //this is results for predict retro synthesis routes  */}
                        <div className="p-4 mt-12 ">
                            <div className="flex flex-col sm:flex-row ">
                                {/* Filter Section */}
                                <div className="col-span-1">
                                    <div className="space-y-4">                                        <div>
                                        <label className="block text-gray-700 opacity-75">Select Type</label>
                                        <select className="mt-1 block py-2 w-[250px] rounded-md border-gray-300 shadow-sm">
                                            <option value="">Synthesis</option>
                                            <option value="">Exact search</option>
                                            <option value="">Similarity Search</option>
                                            <option value="">Substructure Search</option>
                                            <option value="">Chemical Properties and alerts</option>
                                        </select>
                                    </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700  ">Select Filters</label>
                                            <hr className="border-gray-300 w-[250px] my-2" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 opacity-75">Route Type</label>
                                            <select className="mt-1 py-2 block w-[250px] rounded-md border-gray-300 shadow-sm">
                                                <option>All</option>
                                                <option>1 Step Route</option>
                                                <option>2 Step Route</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 opacity-75">Select Vendor</label>
                                            <select className="mt-1 py-2 block w-[250px] rounded-md border-gray-300 shadow-sm">
                                                <option>Vendor Name</option>
                                                <option>Vendor Name 1</option>
                                                <option>Vendor Name 2</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 opacity-75">Select Database</label>
                                            <select className="mt-1 py-2 block w-[250px] rounded-md border-gray-300 shadow-sm">
                                                <option>Surechembel</option>
                                                <option>Select Database 1</option>
                                                <option>Select Database 2</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 opacity-75">Select Lead Time</label>
                                            <select className="mt-1 py-2 block w-[250px] rounded-md border-gray-300 shadow-sm">
                                                <option>10 min</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 opacity-75">Select BB Price</label>
                                            <select className="mt-1 py-2 block w-[250px] rounded-md border-gray-300 shadow-sm">
                                                <option>&lt; $100/g</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 opacity-75">Select SCR Price</label>
                                            <select className="mt-1 py-2 block w-[250px] rounded-md border-gray-300 shadow-sm">
                                                <option>&gt; $100/g</option>
                                            </select>
                                        </div>
                                        <div>
                                            <button style={{ letterSpacing: '1px' }} className="mt-2 bg-[#3182CE] text-white font-segoe py-2 block w-[250px] rounded-lg shadow-sm ">Apply</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Cards Section */}
                                <div className="col-span-2  ml-8   mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="bg-white  p-4  shadow rounded-lg">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-green-600 font-semibold">{index % 2 === 0 ? '2 Step' : '1 Step'}</span>
                                                <div className="flex space-x-2">
                                                    <span className="bg-purple-600 text-white px-2 py-1 rounded">BB</span>
                                                    <span className="bg-purple-600 text-white px-2 py-1 rounded">SCR</span>
                                                    <HiDotsVertical className="text-gray-600 cursor-pointer  h-8  w-6 " />

                                                </div>
                                            </div>
                                            <div className="text-center mb-4">
                                                <img src="/structure.png" alt="Molecule" className="mx-auto" />
                                            </div>
                                            <div className="text-center mb-4">
                                                <p>O=C(O)Cn1ncc2ccccc21</p>
                                            </div>
                                            <div className="flex flex-wrap justify-center space-x-4 ">
                                                <span className="bg-stone-50 border border-black px-2 py-1 rounded-lg">Surechembel</span>
                                                <span className="bg-stone-50 border border-black px-2 py-1 rounded-lg">enamine</span>
                                                <span className="bg-stone-50 border border-black px-2 py-1 mt-2 rounded-lg">emolecules</span>
                                                <span className="bg-stone-50 border border-black px-2 py-1 mt-2 rounded-lg">molport</span>
                                                <span className="bg-stone-50 border border-black px-2 py-1 mt-2 rounded-lg">wuxi</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>

                    </div>
                )}

                {!loader ? (
                    <>
                        {currentWflow === 'ADMET' ? (
                            showPopup && (
                                <AdmetResultPage
                                    predictionResult={predictionResult}
                                    onClose={() => setShowPopup(false)}
                                    smileString={smileString}
                                />
                            )
                        ) : (
                            showPopup && (
                                <RetroResultPage
                                    predictionResult={predictionResult}
                                    onClose={() => setShowPopup(false)}
                                    smileString={smileString}
                                />
                            )
                        )}
                    </>
                ) : (
                    <div className="text-center pt-[10%]">
                        <Loader />
                    </div>
                )}
            </div>

        </>
    )
}

export default HelpPage